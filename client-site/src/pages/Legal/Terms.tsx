import { PROFILE } from '@jsoft/shared';
import { MetaTags } from '../../components/seo/MetaTags';
export function TermsPage() { return <><MetaTags title="Términos | J Soft Solutions" description="Borrador de términos de uso." /><h1>Términos de uso</h1><p>Este contenido es un borrador informativo y está sujeto a revisión y aprobación del propietario y de asesoría legal.</p><p>Para consultas, escribe a <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>.</p></>; }
