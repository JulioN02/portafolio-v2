// Main export for @jsoft/shared package
// Re-export schemas and types

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
  
  // Common
  PaginationParams,
  PaginatedResponse,
  ApiError,
  ApiSuccess,
} from './types/index.js';

// API Client
export { createApiClient } from './api-client/index.js';
export type {
  ApiClient,
  ApiClientConfig,
  ApiClientError,
  ApiResponse,
  RequestOptions,
  HttpMethod,
} from './api-client/index.js';

// UI Components
export { Button } from './components/index.js';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/index.js';

export { Input } from './components/index.js';
export type { InputProps } from './components/index.js';

export { Card } from './components/index.js';
export type { CardProps } from './components/index.js';

export { Loading } from './components/index.js';
export type { LoadingProps } from './components/index.js';

export { ErrorMessage } from './components/index.js';
export type { ErrorMessageProps } from './components/index.js';

export { Modal } from './components/index.js';
export type { ModalProps } from './components/index.js';

// Auth Components
export { ProtectedRoute } from './components/index.js';
export type { ProtectedRouteProps } from './components/index.js';

// CSS Variables (import to apply design tokens)
import './styles/variables.css';
