import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import productRoutes from './routes/product.routes.js';
import toolRoutes from './routes/tool.routes.js';
import successCaseRoutes from './routes/successCase.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import contactRoutes from './routes/contact.routes.js';
import blogPostRoutes from './routes/blog-post.routes.js';
import siteSectionRoutes from './routes/siteSection.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { r2Service } from './services/r2.service.js';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images — local disk or proxy from R2
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', async (req: Request, res: Response, next) => {
  const filename = req.path.replace(/^\//, '');
  if (!filename) return next();

  // 1. Try local disk (dev mode)
  const localPath = path.join(uploadsDir, filename);
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  // 2. Try Supabase Storage (production)
  if (r2Service.isConfigured()) {
    const storageUrl = r2Service.getPublicUrl(filename);
    if (storageUrl) {
      return res.redirect(storageUrl);
    }
  }

  // 3. Not found
  res.status(404).json({ error: 'File not found' });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/success-cases', successCaseRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/blog-posts', blogPostRoutes);
app.use('/api/site-sections', siteSectionRoutes);

// Protected routes (admin)
// All routes under /api/admin need authentication
// app.use('/api/admin', authMiddleware, adminRoutes);

// Centralized error handler (must be registered after all routes)
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found', code: 'NOT_FOUND' });
});

export default app;
