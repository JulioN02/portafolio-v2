// Admin Panel Type Definitions
// Re-export types from @jsoft/shared
import type {
  ServiceInput,
  ServiceUpdateInput,
  ServiceFilterInput,
  ServiceResponse,
  ProductInput,
  ProductUpdateInput,
  ProductFilterInput,
  ProductResponse,
  ToolInput,
  ToolUpdateInput,
  ToolFilterInput,
  ToolResponse,
  SuccessCaseInput,
  SuccessCaseUpdateInput,
  SuccessCaseResponse,
  PostStatus,
  BlogPostInput,
  BlogPostUpdateInput,
  BlogPostFilterInput,
  BlogPostStatusInput,
  BlogPostResponse,
  FormOrigin,
  ClientContactInput,
  RecruiterContactInput,
  ContactFormInput,
  ContactFormResponse,
  LoginInput,
  JwtPayload,
  LoginResponse,
  PaginationParams,
  PaginatedResponse,
  ApiError,
  ApiSuccess,
} from '@jsoft/shared';

// Admin-specific types
export interface AuthState {
  token: string | null;
  user: JwtPayload | null;
  isAuthenticated: boolean;
}

export interface DashboardSummary {
  totalServices: number;
  totalProducts: number;
  totalTools: number;
  totalBlogPosts: number;
  totalContacts: number;
  recentServices: ServiceResponse[];
  recentBlogPosts: BlogPostResponse[];
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

// Re-export shared types
export type {
  ServiceInput,
  ServiceUpdateInput,
  ServiceFilterInput,
  ServiceResponse,
  ProductInput,
  ProductUpdateInput,
  ProductFilterInput,
  ProductResponse,
  ToolInput,
  ToolUpdateInput,
  ToolFilterInput,
  ToolResponse,
  SuccessCaseInput,
  SuccessCaseUpdateInput,
  SuccessCaseResponse,
  PostStatus,
  BlogPostInput,
  BlogPostUpdateInput,
  BlogPostFilterInput,
  BlogPostStatusInput,
  BlogPostResponse,
  FormOrigin,
  ClientContactInput,
  RecruiterContactInput,
  ContactFormInput,
  ContactFormResponse,
  LoginInput,
  JwtPayload,
  LoginResponse,
  PaginationParams,
  PaginatedResponse,
  ApiError,
  ApiSuccess,
};