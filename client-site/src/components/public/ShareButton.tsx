import { useState } from 'react';
import { buildSafeShareUrl } from './share';

export function ShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState('');
  async function share() {
    const url = buildSafeShareUrl(window.location.href);
    if (!url) { setStatus('No se pudo preparar el enlace.'); return; }
    try {
      if (navigator.share) await navigator.share({ title, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
      else throw new Error('clipboard-unavailable');
      setStatus('Enlace listo para compartir.');
    } catch { setStatus('No se pudo compartir el enlace.'); }
  }
  return <div><button type="button" onClick={share} aria-describedby="share-status">Compartir</button><span id="share-status" role="status" aria-live="polite">{status}</span></div>;
}
