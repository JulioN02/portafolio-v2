import { describe, it, expect } from 'vitest';
import {
  serviceSchema,
  serviceUpdateSchema,
  serviceFilterSchema,
  productSchema,
  productUpdateSchema,
  productFilterSchema,
  toolSchema,
  toolUpdateSchema,
  toolFilterSchema,
  successCaseSchema,
  successCaseUpdateSchema,
  successCaseFilterSchema,
  blogPostSchema,
  blogPostUpdateSchema,
  blogPostFilterSchema,
  blogPostStatusSchema,
  contactFormSchema,
  clientContactSchema,
  recruiterContactSchema,
  contactFormFilterSchema,
  loginSchema,
  jwtPayloadSchema,
  siteSectionSchema,
  siteSectionUpdateSchema,
  siteSectionReorderSchema,
  updateProfileSchema,
  sendVerificationCodeSchema,
  changePasswordSchema,
  postStatusEnum,
  formOriginEnum,
} from '../index';

describe('Shared schemas', () => {
  it('exports postStatusEnum as a Zod enum', () => {
    expect(postStatusEnum._def.typeName).toBe('ZodEnum');
    expect(postStatusEnum.options).toEqual(['DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED']);
  });

  it('exports formOriginEnum as a Zod enum', () => {
    expect(formOriginEnum._def.typeName).toBe('ZodEnum');
    expect(formOriginEnum.options).toEqual(['CLIENT', 'RECRUITER']);
  });

  const objectSchemas = [
    ['serviceSchema', serviceSchema],
    ['serviceUpdateSchema', serviceUpdateSchema],
    ['serviceFilterSchema', serviceFilterSchema],
    ['productSchema', productSchema],
    ['productUpdateSchema', productUpdateSchema],
    ['productFilterSchema', productFilterSchema],
    ['toolSchema', toolSchema],
    ['toolUpdateSchema', toolUpdateSchema],
    ['toolFilterSchema', toolFilterSchema],
    ['successCaseSchema', successCaseSchema],
    ['successCaseUpdateSchema', successCaseUpdateSchema],
    ['successCaseFilterSchema', successCaseFilterSchema],
    ['blogPostSchema', blogPostSchema],
    ['blogPostUpdateSchema', blogPostUpdateSchema],
    ['blogPostFilterSchema', blogPostFilterSchema],
    ['blogPostStatusSchema', blogPostStatusSchema],
    ['clientContactSchema', clientContactSchema],
    ['recruiterContactSchema', recruiterContactSchema],
    ['contactFormFilterSchema', contactFormFilterSchema],
    ['loginSchema', loginSchema],
    ['jwtPayloadSchema', jwtPayloadSchema],
    ['siteSectionSchema', siteSectionSchema],
    ['siteSectionUpdateSchema', siteSectionUpdateSchema],
    ['siteSectionReorderSchema', siteSectionReorderSchema],
    ['updateProfileSchema', updateProfileSchema],
    ['sendVerificationCodeSchema', sendVerificationCodeSchema],
    ['changePasswordSchema', changePasswordSchema],
  ] as const;

  it.each(objectSchemas)('%s is a ZodObject', (_name, schema) => {
    expect(schema._def.typeName).toBe('ZodObject');
  });

  it('contactFormSchema is a ZodDiscriminatedUnion', () => {
    expect(contactFormSchema._def.typeName).toBe('ZodDiscriminatedUnion');
  });
});
