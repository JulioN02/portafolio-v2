// Re-export all types from schemas
export type {
  ServiceInput,
  ServiceUpdateInput,
  ServiceFilterInput,
  ServiceStatusInput,
  ServiceResponse,
} from '../schemas/service.schema.js';

export type {
  ProductInput,
  ProductUpdateInput,
  ProductFilterInput,
  ProductStatusInput,
  ProductResponse,
} from '../schemas/product.schema.js';

export type {
  ToolInput,
  ToolUpdateInput,
  ToolFilterInput,
  ToolStatusInput,
  ToolResponse,
} from '../schemas/tool.schema.js';

export type {
  SuccessCaseInput,
  SuccessCaseUpdateInput,
  SuccessCaseFilterInput,
  SuccessCaseStatusInput,
  SuccessCaseResponse,
} from '../schemas/successCase.schema.js';

export type {
  PostStatus,
  BlogPostInput,
  BlogPostUpdateInput,
  BlogPostFilterInput,
  BlogPostStatusInput,
  BlogPostResponse,
} from '../schemas/blogPost.schema.js';

export type {
  FormOrigin,
  ClientContactInput,
  RecruiterContactInput,
  ContactFormInput,
  ContactFormFilterInput,
  ContactFormResponse,
} from '../schemas/contact.schema.js';

export type {
  LoginInput,
  JwtPayload,
  LoginResponse,
} from '../schemas/login.schema.js';

export type {
  SiteSectionInput,
  SiteSectionUpdateInput,
  SiteSectionReorderInput,
  SiteSectionResponse,
} from '../schemas/siteSection.schema.js';

export type {
  UpdateProfileInput,
  SendVerificationCodeInput,
  ChangePasswordInput,
} from '../schemas/profile.schema.js';

export type {
  UpdateProfileResponse,
  SendVerificationCodeResponse,
  ChangePasswordResponse,
} from '../schemas/profile.schema.js';

// Common types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}