/**
 * Canonical profile + contact constants — single source of truth.
 *
 * Contact values match CIN-1 exactly (see openspec spec home-redesign).
 * Both public sites (recruiter-site, client-site) import from here;
 * no literal contact value may be hardcoded in site components, layouts,
 * or translations.
 */
export const PROFILE = {
  name: 'Julio Nieto',
  role: {
    es: 'Ingeniero de Sistemas | Desarrollador Backend',
    en: 'Systems Engineer | Backend Developer',
  },
  email: 'jsoftsolutions@gmail.com',
  phoneDisplay: '300 3727134',
  phoneHref: 'tel:+573003727134',
  whatsappUrl: 'https://wa.me/573003727134',
  linkedinUrl: 'https://linkedin.com/in/jsoftsolutions',
  githubUrl: 'https://github.com/jsoftsolutions',
  cvUrl: '/cv/julio-nieto-cv.pdf', // placeholder until owner supplies the file
  availabilityMetric: '100%',
} as const;

export type ProfileInfo = typeof PROFILE;