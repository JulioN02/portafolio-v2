/**
 * Recruiter Site shared types
 */

/** Source types returned by the portfolio aggregation endpoint. */
export type ProjectType =
  | 'service'
  | 'product'
  | 'tool'
  | 'successCase'
  | 'project'
  | 'laboratorio';

export interface ProjectSummary {
  id: string;
  type: ProjectType;
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  images: string[];
  /** Free-form classification tags — present on real Project rows. */
  tags?: string[];
  featured?: boolean;
  createdAt?: string;
  image?: string;
  technicalExplanation?: string;
  technicalImages?: string[];
}