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

export { Badge } from './components/index.js';
export type { BadgeProps } from './components/index.js';

export { Loading } from './components/index.js';
export type { LoadingProps } from './components/index.js';

export { ErrorMessage } from './components/index.js';
export type { ErrorMessageProps } from './components/index.js';

export { Modal } from './components/index.js';
export type { ModalProps } from './components/index.js';

export { Textarea } from './components/index.js';
export type { TextareaProps } from './components/index.js';

export { Select } from './components/index.js';
export type { SelectProps } from './components/index.js';

export { Checkbox } from './components/index.js';
export type { CheckboxProps } from './components/index.js';

// Auth Components
export { ProtectedRoute } from './components/index.js';
export type { ProtectedRouteProps } from './components/index.js';

// Error Boundary Components
export { ErrorBoundary } from './components/index.js';
export type { ErrorBoundaryProps } from './components/index.js';
export { ErrorFallback } from './components/index.js';
export type { ErrorFallbackProps } from './components/index.js';
export { withBoundary } from './components/index.js';

// CSS Variables (import to apply design tokens)
import './styles/variables.css';

// Component CSS — imported explicitly so tsup bundles them into dist/index.css.
// We use inline class name strings in components (not CSS module bindings)
// because tsup strips module JS mappings, but the CSS is still valid.
import './components/ui/Modal/Modal.module.css';
import './components/ui/Button/Button.module.css';
import './components/ui/Card/Card.module.css';
import './components/ui/Badge/Badge.module.css';
import './components/ui/Loading/Loading.module.css';
import './components/ui/ErrorMessage/ErrorMessage.module.css';
import './components/ui/Input/Input.module.css';
import './components/ui/Textarea/Textarea.module.css';
import './components/ui/Select/Select.module.css';
import './components/ui/Checkbox/Checkbox.module.css';
