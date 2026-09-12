import { z } from 'zod';
import { normalizePhone, PHONE_REGEX } from '../utils/phone.js';

/**
 * Enum for contact form origin type
 */
export const formOriginEnum = z.enum(['CLIENT', 'RECRUITER']);
export type FormOrigin = z.infer<typeof formOriginEnum>;

/**
 * Lenient pre-normalization shape: accepts digits plus common human formatting
 * (spaces, dashes, parentheses, dots) with an optional leading `+`. The value
 * is then normalized to canonical digits and re-validated against PHONE_REGEX.
 */
const PHONE_INPUT_REGEX = /^\+?[\d\s().()-]{7,20}$/;

/**
 * WhatsApp/phone field shared by both contact schemas. Accepts human-friendly
 * formats (matching what the public forms allow), normalizes to digits-only,
 * and only then enforces the canonical 10–15 digit rule.
 */
const whatsappSchema = z
  .string()
  .regex(PHONE_INPUT_REGEX, 'Invalid WhatsApp number format')
  .transform(normalizePhone)
  .refine((v) => PHONE_REGEX.test(v), 'Invalid WhatsApp number format');

/**
 * Schema for client contact form
 * Used when a client contacts from the client site (services, products, tools)
 */
export const clientContactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2).max(50).optional(),
  whatsapp: whatsappSchema.optional(),
  email: z.string().email('Invalid email format'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  source: z.string().min(2).max(100), // "service:Desarrollo Web", "product:ERP", "tool:X", "general"
  // Honeypot anti-spam backstop: hidden field that must stay empty.
  // The middleware answers bots before Zod; this schema-level guard protects
  // if middleware order ever changes. Never persisted (transient field).
  website: z.string().max(0).optional(),
});

/**
 * Schema for recruiter contact form
 * Used when a recruiter contacts from the recruiter site
 */
export const recruiterContactSchema = z.object({
  firstName: z.string().min(2).max(50),
  email: z.string().email('Invalid email format'),
  whatsapp: whatsappSchema.optional(),
  message: z.string().min(10).max(2000),
  // Honeypot anti-spam backstop (see clientContactSchema above).
  website: z.string().max(0).optional(),
});

/**
 * Combined contact schema that detects origin type
 */
export const contactFormSchema = z.discriminatedUnion('originType', [
  clientContactSchema.extend({ originType: z.literal('CLIENT') }),
  recruiterContactSchema.extend({ originType: z.literal('RECRUITER') }),
]);

/**
 * Type inferred from contact schemas
 */
export type ClientContactInput = z.infer<typeof clientContactSchema>;
export type RecruiterContactInput = z.infer<typeof recruiterContactSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * Schema for filtering contact forms in admin
 */
export const contactFormFilterSchema = z.object({
  search: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(),
  isStarred: z.coerce.boolean().optional(),
  label: z.string().optional(),
  originType: formOriginEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ContactFormFilterInput = z.infer<typeof contactFormFilterSchema>;

/**
 * ContactForm response type
 */
export interface ContactFormResponse {
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