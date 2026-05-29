/**
 * Recruiter Site shared types
 */

export interface ProjectSummary {
  id: string;
  type: string;
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  images: string[];
  featured?: boolean;
  createdAt?: string;
  image?: string;
  technicalExplanation?: string;
  technicalImages?: string[];
}
