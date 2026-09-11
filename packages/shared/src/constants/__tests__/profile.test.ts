import { describe, it, expect } from 'vitest';
import { PROFILE } from '../profile';

describe('PROFILE constants (public-launch canonical)', () => {
  it('defines the canonical full name and mirrors it in name', () => {
    expect(PROFILE.fullName).toBe('Julio Manuel Nieto Martinez');
    expect(PROFILE.name).toBe('Julio Manuel Nieto Martinez');
    expect(PROFILE.name).toBe(PROFILE.fullName);
  });

  it('has the bilingual roles', () => {
    expect(PROFILE.role.es).toBe('Ingeniero de Sistemas | Desarrollador Backend');
    expect(PROFILE.role.en).toBe('Systems Engineer | Backend Developer');
  });

  it('has the canonical email', () => {
    expect(PROFILE.email).toBe('jsoftsolutions@gmail.com');
  });

  it('has the canonical LinkedIn and GitHub URLs', () => {
    expect(PROFILE.linkedinUrl).toBe('https://linkedin.com/in/jsoftsolutions');
    expect(PROFILE.githubUrl).toBe('https://github.com/jsoftsolutions');
  });

  it('points cvUrl at the real Julio_Nieto_CV.pdf path', () => {
    expect(PROFILE.cvUrl).toBe('/cv/Julio_Nieto_CV.pdf');
    expect(PROFILE.cvUrl.endsWith('Julio_Nieto_CV.pdf')).toBe(true);
  });

  it('has the availability metric', () => {
    expect(PROFILE.availabilityMetric).toBe('100%');
  });

  it('does not expose any phone or WhatsApp PII fields', () => {
    const keys = Object.keys(PROFILE);
    expect(keys).not.toContain('phone');
    expect(keys).not.toContain('phoneHref');
    expect(keys).not.toContain('phoneDisplay');
    expect(keys).not.toContain('whatsapp');
    expect(keys).not.toContain('whatsappUrl');
    // Defense-in-depth: no PII literal may survive anywhere in the shape.
    const serialized = JSON.stringify(PROFILE);
    expect(serialized).not.toMatch(/wa\.me/i);
    expect(serialized).not.toMatch(/tel:/i);
    expect(serialized).not.toContain('3727134');
  });
});
