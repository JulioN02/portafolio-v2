import type { PublicExternalLink } from './types/index.js';

export interface PublicService {
  id: string;
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  fullDescription: string;
  includedItems: string[];
  images: string[];
  technicalImages: string[];
  externalLink: PublicExternalLink;
}

export interface PublicProduct {
  id: string;
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  technicalImages: string[];
  externalLink: PublicExternalLink;
  featured: boolean;
}

export interface PublicTool extends PublicProduct {
  requiresInstall: boolean;
}

export interface PublicSuccessCase {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  videos: string[];
  links: string[];
}

export interface PublicProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  body: string;
  images: string[];
  repositoryUrl: PublicExternalLink;
  tags: string[];
  featured: boolean;
  order: number;
}

export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  shortDescription: string;
  coverImage: string;
  mediaGallery: string[];
  body: string;
  externalLink: PublicExternalLink;
  lessonsLearned: string | null;
}

export interface PublicPortfolioItem {
  id: string;
  type: 'product' | 'tool' | 'successCase' | 'project' | 'laboratorio';
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  image: string;
  images?: string[];
  tags?: string[];
  featured?: boolean;
  createdAt: Date | string;
}
