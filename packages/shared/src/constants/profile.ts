/**
 * Canonical profile + contact constants — single source of truth.
 *
 * Both public sites (recruiter-site, client-site) import from here;
 * no literal contact value may be hardcoded in site components, layouts,
 * or translations. Phone/WhatsApp PII was removed for public launch
 * (public-pii-minimization): email is the only direct contact channel.
 */
export const PROFILE = {
  name: 'Julio Manuel Nieto Martinez',
  fullName: 'Julio Manuel Nieto Martinez',
  role: {
    es: 'Ingeniero de Sistemas | Desarrollador Backend',
    en: 'Systems Engineer | Backend Developer',
  },
  email: 'jsoftsolutions@gmail.com',
  linkedinUrl: 'https://linkedin.com/in/jsoftsolutions',
  githubUrl: 'https://github.com/jsoftsolutions',
  cvUrl: '/cv/Julio_Nieto_CV.pdf',
  availabilityMetric: '100%',
} as const;

export type ProfileInfo = typeof PROFILE;
