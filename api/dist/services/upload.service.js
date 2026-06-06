import path from 'path';
import fs from 'fs';
import { r2Service } from './r2.service.js';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
// Ensure local upload directory exists (for local dev fallback)
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
export const uploadService = {
    /**
     * Save uploaded file — uploads to R2 in production, local disk in dev
     */
    async saveFile(file) {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;
        if (r2Service.isConfigured()) {
            // Production: upload to Cloudflare R2
            const result = await r2Service.uploadFile(file.buffer, filename, file.mimetype);
            return {
                filename: result.filename,
                url: result.url,
                size: file.size,
                mimetype: file.mimetype,
            };
        }
        // Local dev: save to disk
        const filepath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, file.buffer);
        return {
            filename,
            url: `/uploads/${filename}`,
            size: file.size,
            mimetype: file.mimetype,
        };
    },
    /**
     * Delete a file — from R2 or local disk
     */
    async deleteFile(filename) {
        if (r2Service.isConfigured()) {
            await r2Service.deleteFile(filename);
            return;
        }
        // Local dev: delete from disk
        const filepath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    },
    /**
     * Validate file type and size
     */
    validateFile(file) {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(', ')}`,
            };
        }
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File too large: ${file.size} bytes. Max: ${maxSize} bytes`,
            };
        }
        return { valid: true };
    },
};
//# sourceMappingURL=upload.service.js.map