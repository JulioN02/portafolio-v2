import { Request, Response } from 'express';
import { projectService } from '../services/project.service.js';
import {
  projectSchema,
  projectUpdateSchema,
  projectFilterSchema,
  projectReorderSchema,
  postStatusEnum,
  publicProjectQuerySchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingProject = async (id: string) => {
  const existing = await projectService.findById(id);
  if (!existing) {
    throw new NotFoundError('Project not found');
  }
  return existing;
};

export const projectController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicProjectQuerySchema.parse(req.query);
    const result = await projectService.findAllPublic(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    publicProjectQuerySchema.parse(req.query);
    const slug = getStringParam(req.params.slug);
    const project = await projectService.findPublicBySlug(slug);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    res.json(project);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const project = await projectService.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    res.json(project);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = projectSchema.parse(req.body);
    const project = await projectService.create(data);
    res.status(201).json(project);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = projectUpdateSchema.parse(req.body);
    await getExistingProject(id);
    const project = await projectService.update(id, data);
    res.json(project);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingProject(id);
    await projectService.softDelete(id);
    res.json({ message: 'Project deleted successfully' });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingProject(id);
    const project = await projectService.restore(id);
    res.json(project);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { status } = req.body;
    const parsedStatus = postStatusEnum.safeParse(status);
    if (!parsedStatus.success) {
      throw new ValidationError('Invalid status value');
    }
    if (parsedStatus.data === 'ALL') {
      res.status(400).json({ error: 'ALL is not a valid status' });
      return;
    }
    await getExistingProject(id);
    const project = await projectService.updateStatus(id, parsedStatus.data);
    res.json(project);
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { order } = projectReorderSchema.parse(req.body);
    await getExistingProject(id);
    const project = await projectService.reorder(id, order);
    res.json(project);
  }),

  getTags: asyncHandler(async (req: Request, res: Response) => {
    publicProjectQuerySchema.parse(req.query);
    const tags = await projectService.getTags();
    res.json(tags);
  }),

  findAllAdmin: asyncHandler(async (req: Request, res: Response) => {
    const filter = projectFilterSchema.parse(req.query);
    res.json(await projectService.findAll(filter));
  }),
};
