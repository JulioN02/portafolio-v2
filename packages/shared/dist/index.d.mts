import { z } from 'zod';
import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ButtonHTMLAttributes, ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

/**
 * Schema for Service entity
 * Used for creating and updating services in the admin
 */
declare const serviceSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    classification: z.ZodString;
    shortDescription: z.ZodString;
    fullDescription: z.ZodString;
    includedItems: z.ZodArray<z.ZodString, "many">;
    images: z.ZodArray<z.ZodString, "many">;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    technicalExplanation: z.ZodOptional<z.ZodString>;
    technicalImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
    title: string;
    slug: string;
    shortDescription: string;
    classification: string;
    fullDescription: string;
    includedItems: string[];
    images: string[];
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
}, {
    title: string;
    slug: string;
    shortDescription: string;
    classification: string;
    fullDescription: string;
    includedItems: string[];
    images: string[];
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
}>;
/**
 * Partial schema for updating services (all fields optional)
 */
declare const serviceUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    classification: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    fullDescription: z.ZodOptional<z.ZodString>;
    includedItems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>>;
    technicalExplanation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    technicalImages: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    classification?: string | undefined;
    fullDescription?: string | undefined;
    includedItems?: string[] | undefined;
    images?: string[] | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    classification?: string | undefined;
    fullDescription?: string | undefined;
    includedItems?: string[] | undefined;
    images?: string[] | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
}>;
/**
 * Schema for filtering services in API queries
 */
declare const serviceFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    classification: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    classification?: string | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    classification?: string | undefined;
}>;
/**
 * Schema for changing service status
 */
declare const serviceStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}>;
/**
 * Type inferred from serviceSchema
 */
type ServiceInput = z.infer<typeof serviceSchema>;
type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
type ServiceFilterInput = z.infer<typeof serviceFilterSchema>;
type ServiceStatusInput = z.infer<typeof serviceStatusSchema>;
/**
 * Service response type (what the API returns)
 */
interface ServiceResponse extends ServiceInput {
    id: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
}

/**
 * Schema for Product entity
 * Used for creating and updating products in the admin
 */
declare const productSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    classification: z.ZodString;
    shortDescription: z.ZodString;
    fullDescription: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    externalLink: z.ZodOptional<z.ZodString>;
    featured: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    technicalExplanation: z.ZodOptional<z.ZodString>;
    technicalImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
    title: string;
    slug: string;
    shortDescription: string;
    classification: string;
    fullDescription: string;
    images: string[];
    featured: boolean;
    externalLink?: string | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
}, {
    title: string;
    slug: string;
    shortDescription: string;
    classification: string;
    fullDescription: string;
    images: string[];
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    externalLink?: string | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
    featured?: boolean | undefined;
}>;
/**
 * Partial schema for updating products
 */
declare const productUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    classification: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    fullDescription: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    externalLink: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    featured: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>>;
    technicalExplanation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    technicalImages: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    externalLink?: string | undefined;
    classification?: string | undefined;
    fullDescription?: string | undefined;
    images?: string[] | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
    featured?: boolean | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    externalLink?: string | undefined;
    classification?: string | undefined;
    fullDescription?: string | undefined;
    images?: string[] | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
    featured?: boolean | undefined;
}>;
/**
 * Schema for filtering products in API queries
 */
declare const productFilterSchema: z.ZodObject<{
    featured: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    classification: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    classification?: string | undefined;
    featured?: boolean | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    classification?: string | undefined;
    featured?: boolean | undefined;
}>;
/**
 * Schema for changing product status
 */
declare const productStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}>;
/**
 * Type inferred from productSchema
 */
type ProductInput = z.infer<typeof productSchema>;
type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
type ProductFilterInput = z.infer<typeof productFilterSchema>;
type ProductStatusInput = z.infer<typeof productStatusSchema>;
/**
 * Product response type
 */
interface ProductResponse extends ProductInput {
    id: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
}

/**
 * Schema for Tool entity
 * Used for creating and updating tools in the admin
 */
declare const toolSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    classification: z.ZodString;
    shortDescription: z.ZodString;
    fullDescription: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    requiresInstall: z.ZodDefault<z.ZodBoolean>;
    featured: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    technicalExplanation: z.ZodOptional<z.ZodString>;
    technicalImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
    title: string;
    slug: string;
    shortDescription: string;
    classification: string;
    fullDescription: string;
    images: string[];
    featured: boolean;
    requiresInstall: boolean;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
}, {
    title: string;
    slug: string;
    shortDescription: string;
    classification: string;
    fullDescription: string;
    images: string[];
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
    featured?: boolean | undefined;
    requiresInstall?: boolean | undefined;
}>;
/**
 * Partial schema for updating tools
 */
declare const toolUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    classification: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    fullDescription: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requiresInstall: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    featured: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>>;
    technicalExplanation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    technicalImages: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    classification?: string | undefined;
    fullDescription?: string | undefined;
    images?: string[] | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
    featured?: boolean | undefined;
    requiresInstall?: boolean | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    classification?: string | undefined;
    fullDescription?: string | undefined;
    images?: string[] | undefined;
    technicalExplanation?: string | undefined;
    technicalImages?: string[] | undefined;
    featured?: boolean | undefined;
    requiresInstall?: boolean | undefined;
}>;
/**
 * Schema for filtering tools in API queries
 */
declare const toolFilterSchema: z.ZodObject<{
    featured: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    classification: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    classification?: string | undefined;
    featured?: boolean | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    classification?: string | undefined;
    featured?: boolean | undefined;
}>;
/**
 * Schema for changing tool status
 */
declare const toolStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}>;
/**
 * Type inferred from toolSchema
 */
type ToolInput = z.infer<typeof toolSchema>;
type ToolUpdateInput = z.infer<typeof toolUpdateSchema>;
type ToolFilterInput = z.infer<typeof toolFilterSchema>;
type ToolStatusInput = z.infer<typeof toolStatusSchema>;
/**
 * Tool response type
 */
interface ToolResponse extends ToolInput {
    id: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
}

/**
 * Schema for SuccessCase entity
 * Used for creating and updating success cases in the admin
 */
declare const successCaseSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    videos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
    title: string;
    slug: string;
    images: string[];
    description: string;
    videos?: string[] | undefined;
    links?: string[] | undefined;
}, {
    title: string;
    slug: string;
    images: string[];
    description: string;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    videos?: string[] | undefined;
    links?: string[] | undefined;
}>;
/**
 * Partial schema for updating success cases
 */
declare const successCaseUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    videos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    links: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    videos?: string[] | undefined;
    links?: string[] | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    videos?: string[] | undefined;
    links?: string[] | undefined;
}>;
/**
 * Schema for filtering success cases in API queries
 */
declare const successCaseFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    classification: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    classification?: string | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    classification?: string | undefined;
}>;
/**
 * Schema for changing success case status
 */
declare const successCaseStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}>;
/**
 * Type inferred from successCaseSchema
 */
type SuccessCaseInput = z.infer<typeof successCaseSchema>;
type SuccessCaseUpdateInput = z.infer<typeof successCaseUpdateSchema>;
type SuccessCaseFilterInput = z.infer<typeof successCaseFilterSchema>;
type SuccessCaseStatusInput = z.infer<typeof successCaseStatusSchema>;
/**
 * SuccessCase response type
 */
interface SuccessCaseResponse extends SuccessCaseInput {
    id: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
}

/**
 * Enum for blog post status
 */
declare const postStatusEnum: z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>;
type PostStatus = z.infer<typeof postStatusEnum>;
/**
 * Schema for BlogPost entity
 * Used for creating and updating blog posts in the admin
 */
declare const blogPostSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    category: z.ZodString;
    shortDescription: z.ZodString;
    coverImage: z.ZodString;
    mediaGallery: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    body: z.ZodString;
    externalLink: z.ZodOptional<z.ZodString>;
    lessonsLearned: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
    title: string;
    slug: string;
    category: string;
    shortDescription: string;
    coverImage: string;
    body: string;
    mediaGallery?: string[] | undefined;
    externalLink?: string | undefined;
    lessonsLearned?: string | undefined;
}, {
    title: string;
    slug: string;
    category: string;
    shortDescription: string;
    coverImage: string;
    body: string;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    mediaGallery?: string[] | undefined;
    externalLink?: string | undefined;
    lessonsLearned?: string | undefined;
}>;
/**
 * Partial schema for updating blog posts
 */
declare const blogPostUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    coverImage: z.ZodOptional<z.ZodString>;
    mediaGallery: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    body: z.ZodOptional<z.ZodString>;
    externalLink: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lessonsLearned: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    category?: string | undefined;
    shortDescription?: string | undefined;
    coverImage?: string | undefined;
    mediaGallery?: string[] | undefined;
    body?: string | undefined;
    externalLink?: string | undefined;
    lessonsLearned?: string | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    category?: string | undefined;
    shortDescription?: string | undefined;
    coverImage?: string | undefined;
    mediaGallery?: string[] | undefined;
    body?: string | undefined;
    externalLink?: string | undefined;
    lessonsLearned?: string | undefined;
}>;
/**
 * Schema for filtering blog posts in API queries (public)
 */
declare const blogPostFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>>;
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    category?: string | undefined;
    search?: string | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED" | undefined;
    category?: string | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
/**
 * Schema for changing post status
 */
declare const blogPostStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}, {
    status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "ARCHIVED";
}>;
/**
 * Type inferred from blogPostSchema
 */
type BlogPostInput = z.infer<typeof blogPostSchema>;
type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
type BlogPostFilterInput = z.infer<typeof blogPostFilterSchema>;
type BlogPostStatusInput = z.infer<typeof blogPostStatusSchema>;
/**
 * BlogPost response type
 */
interface BlogPostResponse extends BlogPostInput {
    id: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
}

/**
 * Enum for contact form origin type
 */
declare const formOriginEnum: z.ZodEnum<["CLIENT", "RECRUITER"]>;
type FormOrigin = z.infer<typeof formOriginEnum>;
/**
 * Schema for client contact form
 * Used when a client contacts from the client site (services, products, tools)
 */
declare const clientContactSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    whatsapp: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    message: z.ZodString;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    firstName: string;
    email: string;
    source: string;
    lastName?: string | undefined;
    whatsapp?: string | undefined;
}, {
    message: string;
    firstName: string;
    email: string;
    source: string;
    lastName?: string | undefined;
    whatsapp?: string | undefined;
}>;
/**
 * Schema for recruiter contact form
 * Used when a recruiter contacts from the recruiter site
 */
declare const recruiterContactSchema: z.ZodObject<{
    firstName: z.ZodString;
    email: z.ZodString;
    whatsapp: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    firstName: string;
    email: string;
    whatsapp?: string | undefined;
}, {
    message: string;
    firstName: string;
    email: string;
    whatsapp?: string | undefined;
}>;
/**
 * Combined contact schema that detects origin type
 */
declare const contactFormSchema: z.ZodDiscriminatedUnion<"originType", [z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    whatsapp: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    message: z.ZodString;
    source: z.ZodString;
} & {
    originType: z.ZodLiteral<"CLIENT">;
}, "strip", z.ZodTypeAny, {
    message: string;
    firstName: string;
    email: string;
    source: string;
    originType: "CLIENT";
    lastName?: string | undefined;
    whatsapp?: string | undefined;
}, {
    message: string;
    firstName: string;
    email: string;
    source: string;
    originType: "CLIENT";
    lastName?: string | undefined;
    whatsapp?: string | undefined;
}>, z.ZodObject<{
    firstName: z.ZodString;
    email: z.ZodString;
    whatsapp: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
} & {
    originType: z.ZodLiteral<"RECRUITER">;
}, "strip", z.ZodTypeAny, {
    message: string;
    firstName: string;
    email: string;
    originType: "RECRUITER";
    whatsapp?: string | undefined;
}, {
    message: string;
    firstName: string;
    email: string;
    originType: "RECRUITER";
    whatsapp?: string | undefined;
}>]>;
/**
 * Type inferred from contact schemas
 */
type ClientContactInput = z.infer<typeof clientContactSchema>;
type RecruiterContactInput = z.infer<typeof recruiterContactSchema>;
type ContactFormInput = z.infer<typeof contactFormSchema>;
/**
 * Schema for filtering contact forms in admin
 */
declare const contactFormFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    isRead: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
    isStarred: z.ZodOptional<z.ZodBoolean>;
    label: z.ZodOptional<z.ZodString>;
    originType: z.ZodOptional<z.ZodEnum<["CLIENT", "RECRUITER"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    originType?: "CLIENT" | "RECRUITER" | undefined;
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
    isStarred?: boolean | undefined;
    label?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    originType?: "CLIENT" | "RECRUITER" | undefined;
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
    isStarred?: boolean | undefined;
    label?: string | undefined;
}>;
type ContactFormFilterInput = z.infer<typeof contactFormFilterSchema>;
/**
 * ContactForm response type
 */
interface ContactFormResponse {
    id: string;
    firstName: string;
    lastName: string | null;
    whatsapp: string | null;
    email: string;
    message: string;
    source: string;
    originType: FormOrigin;
    readAt: Date | null;
    archived: boolean;
    starred: boolean;
    labels: string[];
    createdAt: Date;
}

/**
 * Schema for admin login
 * Validates username and password
 */
declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
/**
 * Schema for login response (JWT payload)
 */
declare const jwtPayloadSchema: z.ZodObject<{
    userId: z.ZodString;
    username: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["ADMIN"]>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    userId: string;
    role: "ADMIN";
}, {
    username: string;
    userId: string;
    role?: "ADMIN" | undefined;
}>;
/**
 * Type inferred from schemas
 */
type LoginInput = z.infer<typeof loginSchema>;
type JwtPayload = z.infer<typeof jwtPayloadSchema>;
/**
 * Login response type
 */
interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        role: 'ADMIN';
    };
}

/**
 * Schema for SiteSection entity
 * Used for managing homepage section visibility and order
 */
declare const siteSectionSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    visible: z.ZodDefault<z.ZodBoolean>;
    order: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    label: string;
    key: string;
    visible: boolean;
    order: number;
}, {
    label: string;
    key: string;
    visible?: boolean | undefined;
    order?: number | undefined;
}>;
/**
 * Schema for updating a site section (partial)
 */
declare const siteSectionUpdateSchema: z.ZodObject<{
    visible: z.ZodOptional<z.ZodBoolean>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    label?: string | undefined;
    visible?: boolean | undefined;
}, {
    label?: string | undefined;
    visible?: boolean | undefined;
}>;
/**
 * Schema for batch reorder of site sections
 */
declare const siteSectionReorderSchema: z.ZodObject<{
    sections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        order: number;
        id: string;
    }, {
        order: number;
        id: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    sections: {
        order: number;
        id: string;
    }[];
}, {
    sections: {
        order: number;
        id: string;
    }[];
}>;
/**
 * Type inferred from siteSectionSchema
 */
type SiteSectionInput = z.infer<typeof siteSectionSchema>;
type SiteSectionUpdateInput = z.infer<typeof siteSectionUpdateSchema>;
type SiteSectionReorderInput = z.infer<typeof siteSectionReorderSchema>;
/**
 * SiteSection response type
 */
interface SiteSectionResponse extends SiteSectionInput {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema for updating admin profile
 * At least one of username or email must be provided
 */
declare const updateProfileSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    currentPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    email?: string | null | undefined;
    username?: string | undefined;
}, {
    currentPassword: string;
    email?: string | null | undefined;
    username?: string | undefined;
}>;
/**
 * Schema for requesting a verification code
 */
declare const sendVerificationCodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Schema for changing password with verification code
 */
declare const changePasswordSchema: z.ZodObject<{
    verificationCode: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    verificationCode: string;
    newPassword: string;
}, {
    verificationCode: string;
    newPassword: string;
}>;
/**
 * Types inferred from schemas
 */
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type SendVerificationCodeInput = z.infer<typeof sendVerificationCodeSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
/**
 * Response types
 */
interface UpdateProfileResponse {
    id: string;
    username: string;
    email: string | null;
    role: 'ADMIN';
}
interface SendVerificationCodeResponse {
    code: string;
    expiresIn: number;
}
interface ChangePasswordResponse {
    message: string;
}

interface PaginationParams {
    page: number;
    limit: number;
}
interface PaginatedResponse<T> {
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
interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
}
interface ApiSuccess<T> {
    data: T;
    message?: string;
}

/**
 * API Client types for @jsoft/shared
 */
/** HTTP methods supported by the client */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
/** Configuration options for creating an API client */
interface ApiClientConfig {
    /** Base URL for all API requests (e.g., 'http://localhost:3000/api') */
    baseUrl: string;
    /** Optional callback invoked on 401 Unauthorized responses */
    onUnauthorized?: () => void;
    /** Optional function that returns the current JWT token */
    getToken?: () => string | null;
}
/** Options for individual requests */
interface RequestOptions {
    /** Additional headers to include */
    headers?: Record<string, string>;
    /** Query parameters */
    params?: Record<string, string | number | boolean>;
    /** Skip adding Authorization header for this request */
    skipAuth?: boolean;
}
/** Standard API error structure */
interface ApiClientError {
    message: string;
    status: number;
    code?: string;
    details?: Record<string, string[]>;
}
/** Response wrapper for typed responses */
interface ApiResponse<T> {
    data: T;
    message?: string;
}

/**
 * API Client - fetch-based HTTP client with JWT support
 *
 * Uses native fetch (no external dependencies).
 * Automatically attaches JWT Authorization headers.
 * Handles 401 via configurable logout callback.
 */

declare function createApiClient(config: ApiClientConfig): {
    /** GET request */
    get<T>(path: string, options?: RequestOptions): Promise<T>;
    /** POST request */
    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
    /** PUT request */
    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
    /** PATCH request */
    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
    /** DELETE request */
    delete<T>(path: string, options?: RequestOptions): Promise<T>;
};
type ApiClient = ReturnType<typeof createApiClient>;

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'whatsapp';
type ButtonSize = 'sm' | 'md' | 'lg' | 'large';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Show loading spinner and disable interaction */
    loading?: boolean;
    /** Button content */
    children: ReactNode;
}
declare function Button({ variant, size, loading, disabled, children, className, ...rest }: ButtonProps): react_jsx_runtime.JSX.Element;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Label text displayed above the input */
    label?: string;
    /** Error message displayed below the input */
    error?: string;
    /** Unique identifier for the input (used for label association) */
    id: string;
}
declare function Input({ label, error, id, className, type, ...rest }: InputProps): react_jsx_runtime.JSX.Element;

interface CardProps {
    /** Header content */
    header?: ReactNode;
    /** Main body content */
    children: ReactNode;
    /** Footer content */
    footer?: ReactNode;
    /** Badge text (green accent, uppercase) */
    badge?: string;
    /** Image URL (200px height at top) */
    image?: string;
    /** Additional CSS class */
    className?: string;
}
declare function Card({ header, children, footer, badge, image, className }: CardProps): react_jsx_runtime.JSX.Element;

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'developing' | 'available' | 'coming';
    className?: string;
}
declare function Badge({ children, variant, className }: BadgeProps): react_jsx_runtime.JSX.Element;

interface LoadingProps {
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg';
    /** Accessible label */
    label?: string;
    /** Additional CSS class */
    className?: string;
}
declare function Loading({ size, label, className }: LoadingProps): react_jsx_runtime.JSX.Element;

interface ErrorMessageProps {
    /** Error message to display */
    message: string;
    /** Optional retry callback — renders a retry button if provided */
    onRetry?: () => void;
    /** Additional content below the message */
    children?: ReactNode;
    /** Additional CSS class */
    className?: string;
}
declare function ErrorMessage({ message, onRetry, children, className, }: ErrorMessageProps): react_jsx_runtime.JSX.Element;

interface ModalProps {
    /** Whether the modal is visible */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Optional title displayed in modal header */
    title?: string;
    /** Modal body content */
    children: ReactNode;
    /** Additional CSS class on the modal container */
    className?: string;
}
declare function Modal({ isOpen, onClose, title, children, className, }: ModalProps): react_jsx_runtime.JSX.Element | null;

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Label text displayed above the textarea */
    label?: string;
    /** Error message displayed below the textarea */
    error?: string;
    /** Unique identifier for the textarea (used for label association) */
    id: string;
}
declare function Textarea({ label, error, id, className, ...rest }: TextareaProps): react_jsx_runtime.JSX.Element;

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    /** Label text displayed above the select */
    label?: string;
    /** Error message displayed below the select */
    error?: string;
    /** Unique identifier for the select (used for label association) */
    id: string;
    /** Array of options to render */
    options: {
        value: string;
        label: string;
    }[];
}
declare function Select({ label, error, id, options, className, ...rest }: SelectProps): react_jsx_runtime.JSX.Element;

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** Label text displayed next to the checkbox */
    label?: string;
    /** Unique identifier for the checkbox (used for label association) */
    id: string;
}
declare function Checkbox({ label, id, className, ...rest }: CheckboxProps): react_jsx_runtime.JSX.Element;

interface ProtectedRouteProps {
    /** Whether the user is currently authenticated */
    isAuthenticated: boolean;
    /** Content to render when authenticated */
    children: ReactNode;
    /** Optional path to redirect to (defaults to /login) */
    redirectTo?: string;
}
declare function ProtectedRoute({ isAuthenticated, children, redirectTo, }: ProtectedRouteProps): react_jsx_runtime.JSX.Element;

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onReset?: () => void;
}
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    handleReset: () => void;
    render(): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | react_jsx_runtime.JSX.Element | null | undefined;
}

interface ErrorFallbackProps {
    onReset?: () => void;
    title?: string;
    message?: string;
}
declare function ErrorFallback({ onReset, title, message, }: ErrorFallbackProps): react_jsx_runtime.JSX.Element;

declare function withBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: React.ReactNode): (props: P) => react_jsx_runtime.JSX.Element;

export { type ApiClient, type ApiClientConfig, type ApiClientError, type ApiError, type ApiResponse, type ApiSuccess, Badge, type BadgeProps, type BlogPostFilterInput, type BlogPostInput, type BlogPostResponse, type BlogPostStatusInput, type BlogPostUpdateInput, Button, type ButtonProps, type ButtonSize, type ButtonVariant, Card, type CardProps, type ChangePasswordInput, type ChangePasswordResponse, Checkbox, type CheckboxProps, type ClientContactInput, type ContactFormFilterInput, type ContactFormInput, type ContactFormResponse, ErrorBoundary, type ErrorBoundaryProps, ErrorFallback, type ErrorFallbackProps, ErrorMessage, type ErrorMessageProps, type FormOrigin, type HttpMethod, Input, type InputProps, type JwtPayload, Loading, type LoadingProps, type LoginInput, type LoginResponse, Modal, type ModalProps, type PaginatedResponse, type PaginationParams, type PostStatus, type ProductFilterInput, type ProductInput, type ProductResponse, type ProductStatusInput, type ProductUpdateInput, ProtectedRoute, type ProtectedRouteProps, type RecruiterContactInput, type RequestOptions, Select, type SelectProps, type SendVerificationCodeInput, type SendVerificationCodeResponse, type ServiceFilterInput, type ServiceInput, type ServiceResponse, type ServiceStatusInput, type ServiceUpdateInput, type SiteSectionInput, type SiteSectionReorderInput, type SiteSectionResponse, type SiteSectionUpdateInput, type SuccessCaseFilterInput, type SuccessCaseInput, type SuccessCaseResponse, type SuccessCaseStatusInput, type SuccessCaseUpdateInput, Textarea, type TextareaProps, type ToolFilterInput, type ToolInput, type ToolResponse, type ToolStatusInput, type ToolUpdateInput, type UpdateProfileInput, type UpdateProfileResponse, blogPostFilterSchema, blogPostSchema, blogPostStatusSchema, blogPostUpdateSchema, changePasswordSchema, clientContactSchema, contactFormFilterSchema, contactFormSchema, createApiClient, formOriginEnum, jwtPayloadSchema, loginSchema, postStatusEnum, productFilterSchema, productSchema, productStatusSchema, productUpdateSchema, recruiterContactSchema, sendVerificationCodeSchema, serviceFilterSchema, serviceSchema, serviceStatusSchema, serviceUpdateSchema, siteSectionReorderSchema, siteSectionSchema, siteSectionUpdateSchema, successCaseFilterSchema, successCaseSchema, successCaseStatusSchema, successCaseUpdateSchema, toolFilterSchema, toolSchema, toolStatusSchema, toolUpdateSchema, updateProfileSchema, withBoundary };
