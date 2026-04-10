import { z } from 'zod';

/**
 * Enum for contact form origin type
 */
export const formOriginEnum = z.enum(['CLIENT', 'RECRUITER']);
export type FormOrigin = z.infer<typeof formOriginEnum>;

/**
 * Schema for client contact form
 * Used when a client contacts from the client site (services, products, tools)
 */
export const clientContactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2).max(50).optional(),
  whatsapp: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid WhatsApp number format').optional(),
  email: z.string().email('Invalid email format'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  source: z.string().min(2).max(100), // "service:Desarrollo Web", "product:ERP", "tool:X", "general"
});

/**
 * Schema for recruiter contact form
 * Used when a recruiter contacts from the recruiter site
 */
export const recruiterContactSchema = z.object({
  firstName: z.string().min(2).max(50),
  email: z.string().email('Invalid email format'),
  whatsapp: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  message: z.string().min(10).max(2000),
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
  createdAt: Date;
}