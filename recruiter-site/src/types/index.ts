/**
 * Recruiter Site shared types
 */

export interface ProjectSummary {
  id: string;
  type: 'SERVICE' | 'PRODUCT' | 'TOOL' | 'SUCCESS_CASE';
  title: string;
  slug: string;
  classification: string;
  description: string;
  images: string[];
  technicalExplanation?: string;
  technicalImages?: string[];
}
