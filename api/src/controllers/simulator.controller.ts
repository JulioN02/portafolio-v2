import { Request, Response } from 'express';
import { Transform } from 'stream';
import multer from 'multer';
import path from 'path';
import { simulatorService, SIMULATOR_MAX_SIZE } from '../services/simulator.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Secure file-filter: reject anything that is not an .html file BEFORE multer
 * buffers it (simulators are HTML with embedded CSS/JS — never other types).
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.html') {
    cb(new ValidationError('Simulators must be .html files (text/html only)'));
    return;
  }
  cb(null, true);
};

// Multer: memory storage, hard 1MB cap (enforced again at serve time).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: SIMULATOR_MAX_SIZE },
  fileFilter,
});
export const simulatorUploadMiddleware = upload;

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const parseOptionalInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * CSP for the simulator serving endpoint (Decision 6 in design.md):
 * - `sandbox allow-scripts` — sandboxed document, no same-origin privileges
 *   (mirrors the iframe sandbox attribute; the API owns this header because
 *   the raw HTML is never DOMPurify-rendered).
 * - `default-src 'none'; base-uri 'none'; form-action 'none'` — the document
 *   can't reach any origin, can't navigate the parent, can't submit forms.
 * - `script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:`
 *   — minimal relaxation so the self-contained dashboard HTML (inline
 *   `<script>`/`<style>`, local/embedded images) actually runs inside the
 *   sandboxed iframe. `default-src 'none'` still blocks ALL network requests
 *   (connect-src/font-src/object-src/etc.), and the content is admin-trusted
 *   and served with `sandbox="allow-scripts"` WITHOUT `allow-same-origin`, so
 *   inline JS cannot access the parent DOM or exfiltrate data.
 * - `frame-ancestors <CORS_ORIGIN>` — cross-origin frontends may embed it
 *   (helmet's `frame-ancestors 'self'` is replaced for this response).
 */
export function buildSimulatorCsp(): string {
  const origins = (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:4173'])
    .map((origin) => origin.trim())
    .filter(Boolean)
    .join(' ');
  return `sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors ${origins}`;
}

/**
 * Minimal fluid CSS injected into every served simulator so large elements
 * (images, video, pre/code blocks, tables, canvas) never overflow the sandbox
 * iframe viewport. The embed itself is responsive (width:100% + aspect-ratio
 * on the iframe), so a simulator designed with relative units fits the whole
 * container without internal scrolling; this keeps fixed-size media from
 * blowing out horizontally in narrow viewports.
 */
const SIMULATOR_FLUID_CSS =
  'html,body{max-width:100%;overflow-x:hidden;margin:0;padding:0}img,video,pre,table,canvas{max-width:100%;height:auto}';

function injectFluidCss(): Transform {
  let injected = false;
  let buffer = '';
  return new Transform({
    transform(chunk, _encoding, cb) {
      if (injected) {
        this.push(chunk);
        cb();
        return;
      }
      buffer += chunk.toString('utf8');
      if (buffer.includes('</head>')) {
        const idx = buffer.indexOf('</head>');
        this.push(buffer.slice(0, idx) + `<style>${SIMULATOR_FLUID_CSS}</style>` + buffer.slice(idx));
        buffer = '';
        injected = true;
        cb();
        return;
      }
      if (buffer.length >= 16384) {
        // No <head> found in the first 16KB — prepend the style instead.
        this.push(`<style>${SIMULATOR_FLUID_CSS}</style>` + buffer);
        buffer = '';
        injected = true;
        cb();
        return;
      }
      cb();
    },
    flush(cb) {
      if (!injected && buffer) {
        this.push(`<style>${SIMULATOR_FLUID_CSS}</style>` + buffer);
        buffer = '';
      }
      cb();
    },
  });
}

export const simulatorController = {
  /**
   * POST /api/simulators/upload (JWT + multer, 1MB, .html/text-html only).
   * The bucket is forced to the private `simulators` bucket server-side.
   */
  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError('No file provided');
    }

    const title = typeof req.body?.title === 'string' ? req.body.title : '';
    const width = parseOptionalInt(req.body?.width);
    const height = parseOptionalInt(req.body?.height);

    const simulator = await simulatorService.upload({ title, file: req.file, width, height });
    res.status(201).json(simulator);
  }),

  /** GET /api/simulators (JWT) — admin list for the editor picker. */
  list: asyncHandler(async (_req: Request, res: Response) => {
    const simulators = await simulatorService.list();
    res.json(simulators);
  }),

  /** GET /api/simulators/:id (JWT) — metadata for editor prefill. */
  getMetadata: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const simulator = await simulatorService.getMetadata(id);
    if (!simulator) {
      throw new NotFoundError('Simulator not found');
    }
    res.json(simulator);
  }),

  /**
   * DELETE /api/simulators/:id (JWT) — soft-delete. Mirrors the product/tool
   * delete convention: existence guard first (getMetadata filters deletedAt:
   * null, so unknown AND already-deleted ids → 404), then the metadata-only
   * soft-delete (deletedAt), responding { message } on success.
   */
  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const simulator = await simulatorService.getMetadata(id);
    if (!simulator) {
      throw new NotFoundError('Simulator not found');
    }
    await simulatorService.softDelete(id);
    res.json({ message: 'Simulator deleted successfully' });
  }),

  /**
   * GET /api/simulators/:id/content (PUBLIC) — streams the raw HTML with the
   * sandbox CSP + nosniff + no-store headers. Never DOMPurify-rendered: the
   * content is contained by the sandbox, not by sanitization.
   */
  getContent: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const result = await simulatorService.download(id);
    if (!result) {
      throw new NotFoundError('Simulator not found');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', buildSimulatorCsp());
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    // Helmet sets X-Frame-Options: SAMEORIGIN globally — that would block
    // cross-origin frontends (client/recruiter/admin) from embedding the
    // simulator. Remove it for this response; framing is governed by the CSP
    // frame-ancestors directive above (Design Decision 6).
    res.removeHeader('X-Frame-Options');

    result.stream.pipe(injectFluidCss()).pipe(res);
  }),
};