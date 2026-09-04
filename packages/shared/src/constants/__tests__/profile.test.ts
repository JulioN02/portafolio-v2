import { describe, it, expect } from 'vitest';
import { PROFILE } from '../profile';

describe('PROFILE constants (CIN-1 canonical)', () => {
  it('has the canonical name and bilingual roles', () => {
    expect(PROFILE.name).toBe('Julio Nieto');
    expect(PROFILE.role.es).toBe('Ingeniero de Sistemas | Desarrollador Backend');
    expect(PROFILE.role.en).toBe('Systems Engineer | Backend Developer');
  });

  it('has the canonical email', () => {
    expect(PROFILE.email).toBe('jsoftsolutions@gmail.com');
  });

  it('has the canonical phone display and tel href', () => {
    expect(PROFILE.phoneDisplay).toBe('300 3727134');
    expect(PROFILE.phoneHref).toBe('tel:+573003727134');
  });

  it('has the canonical WhatsApp URL', () => {
    expect(PROFILE.whatsappUrl).toBe('https://wa.me/573003727134');
  });

  it('has the canonical LinkedIn and GitHub URLs', () => {
    expect(PROFILE.linkedinUrl).toBe('https://linkedin.com/in/jsoftsolutions');
    expect(PROFILE.githubUrl).toBe('https://github.com/jsoftsolutions');
  });

  it('has the CV placeholder path and availability metric', () => {
    expect(PROFILE.cvUrl).toBe('/cv/julio-nieto-cv.pdf');
    expect(PROFILE.availabilityMetric).toBe('100%');
  });
});