import { PROFILE } from '@jsoft/shared';
export function StickyCta() {
  return <a className="public-sticky-cta" href={`mailto:${PROFILE.email}`} aria-label="Solicitar una propuesta por correo electrónico">Solicitar propuesta</a>;
}
