import type { ServiceResponse } from '@jsoft/shared';
import { isSafeExternalDemo } from '@jsoft/shared';

export interface EvidenceSummary {
  gallery: number;
  technical: number;
  included: number;
  hasDemo: boolean;
}

export function getEvidenceSummary(service: Pick<ServiceResponse, 'images' | 'technicalImages' | 'includedItems'> & { externalLink?: string | null }): EvidenceSummary {
  return {
    gallery: Math.max(service.images.length - 1, 0),
    technical: service.technicalImages?.length ?? 0,
    included: service.includedItems.length,
    hasDemo: isSafeExternalDemo(service.externalLink),
  };
}
