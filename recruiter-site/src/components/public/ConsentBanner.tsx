import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readConsent, saveConsent, type ConsentChoice } from './consent';
import styles from './ConsentBanner.module.css';

export const CONSENT_REOPEN_EVENT = 'jsoft:reopen-consent';
export function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice>('unset');
  useEffect(() => { setChoice(readConsent()); const reopen = () => setChoice('unset'); window.addEventListener(CONSENT_REOPEN_EVENT, reopen); return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen); }, []);
  if (choice !== 'unset') return null;
  const choose = (next: Exclude<ConsentChoice, 'unset'>) => { saveConsent(next); setChoice(next); };
  return <aside className={styles.banner} aria-labelledby="consent-title" aria-describedby="consent-description"><div className={styles.content}><p className={styles.eyebrow}>Privacidad</p><h2 id="consent-title">Preferencias de privacidad</h2><p id="consent-description">Las funciones no esenciales permanecen desactivadas hasta que las autorices.</p><p className={styles.links}><Link to="/privacidad">Privacidad</Link><Link to="/terminos">Términos de uso</Link></p></div><div className={styles.actions}><button className={styles.primary} type="button" onClick={() => choose('accepted')}>Aceptar no esenciales</button><button className={styles.secondary} type="button" onClick={() => choose('rejected')}>Rechazar no esenciales</button></div></aside>;
}
