// Server-only entry point for @jsoft/shared
// Exports only types and Zod schemas (no React components, no CSS)

// Schemas
export * from './schemas/index.js';

// Types
export type {
  // Service
  ServiceInput,
  ServiceUpdateInput,
  ServiceFilterInput,
  ServiceResponse,
  
  // Product
  ProductInput,
  ProductUpdateInput,
  ProductFilterInput,
  ProductResponse,
  
  // Tool
  ToolInput,
  ToolUpdateInput,
  ToolFilterInput,
  ToolResponse,
  
  // SuccessCase
  SuccessCaseInput,
  SuccessCaseUpdateInput,
  SuccessCaseResponse,
  
  // BlogPost
  PostStatus,
  BlogPostInput,
  BlogPostUpdateInput,
  BlogPostFilterInput,
  BlogPostStatusInput,
  BlogPostResponse,
  
  // Contact
  FormOrigin,
  ClientContactInput,
  RecruiterContactInput,
  ContactFormInput,
  ContactFormResponse,
  
  // Auth
  LoginInput,
  JwtPayload,
  LoginResponse,
  UpdateProfileInput,
  ChangePasswordInput,
  
  // Common
  PaginationParams,
  PaginatedResponse,
  ApiError,
  ApiSuccess,
} from './types/index.js';
