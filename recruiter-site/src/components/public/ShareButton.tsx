import { useId, useState } from 'react';
import { buildSafeShareUrl } from './share';
import styles from './ShareButton.module.css';

export function ShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState('');
  const statusId = useId();
  async function share() {
    const url = buildSafeShareUrl(window.location.href);
    if (!url) { setStatus('No se pudo preparar el enlace.'); return; }
    try {
      if (typeof navigator.share === 'function') { await navigator.share({ title, url }); setStatus('Enlace compartido.'); }
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); setStatus('Enlace copiado.'); }
      else setStatus('No se pudo preparar el enlace.');
    } catch (error) {
      setStatus(error instanceof Error && error.name === 'AbortError' ? 'Compartir cancelado.' : 'No se pudo compartir el enlace.');
    }
  }
  return <div className={styles.root}>
    <button className={styles.button} type="button" onClick={share} aria-label={`Compartir ${title}`} aria-describedby={statusId}>
      <span className={styles.icon} aria-hidden="true">↗</span> Compartir
    </button>
    <span id={statusId} className={styles.status} role="status" aria-live="polite">{status}</span>
  </div>;
}
