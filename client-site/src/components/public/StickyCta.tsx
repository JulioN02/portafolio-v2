import { PROFILE } from '@jsoft/shared';
export function StickyCta() {
  return <a className="public-sticky-cta" href={`mailto:${PROFILE.email}`} aria-label="Contactar por correo electrónico">Contactar</a>;
}
