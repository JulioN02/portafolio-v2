import { useState } from 'react';
import { SERVICE_PROBLEM_ENTRIES, type ServiceClassification } from '@jsoft/shared';
import type { ServiceResponse } from '@jsoft/shared';
import { useFeaturedServices } from '../../hooks/useServices';
import { ServiceCard } from '../../components/services/ServiceCard';
import styles from './ProblemEntrySection.module.css';

const PROBLEM_DESCRIPTIONS: Record<ServiceClassification, string> = {
  'Desarrollo web': 'Gana visibilidad y una presencia digital que explique tu propuesta.',
  'Comercio electrónico': 'Convierte tu catálogo en una experiencia clara para explorar y comprar.',
  Automatización: 'Reduce tareas repetitivas y recupera tiempo para atender tu negocio.',
  'Sistemas a la medida': 'Ordena tu operación con una herramienta alineada a tu forma de trabajar.',
  'Soporte tecnológico': 'Protege la continuidad de tus herramientas y resuelve incidencias con orden.',
};

export function getProblemEntryDescription(classification: ServiceClassification): string {
  return PROBLEM_DESCRIPTIONS[classification];
}

const ENTRY_ICONS: Record<string, string> = {
  visibility: '01', catalog: '02', orders: '03', manual: '04', system: '05', support: '06',
};

export function ProblemEntrySection() {
  const { data: services, isLoading, isError } = useFeaturedServices(12);
  const [selected, setSelected] = useState<ServiceClassification | null>(null);
  const matchingServices = selected && services
    ? services.filter((service) => service.classification.trim().toLocaleLowerCase() === selected.toLocaleLowerCase())
    : [];

  const selectProblem = (classification: ServiceClassification) => {
    setSelected((current) => (current === classification ? null : classification));
  };

  return (
    <section className={styles.section} aria-labelledby="problem-entry-title">
      <div className={styles.container}>
        <p className={styles.eyebrow}>Punto de partida</p>
        <h2 id="problem-entry-title" className={styles.title}>¿Qué necesitas resolver?</h2>
        <p className={styles.subtitle}>Elige una situación y revisa servicios relacionados.</p>
        <div className={styles.options} role="list">
          {SERVICE_PROBLEM_ENTRIES.map((entry) => {
            const active = selected === entry.classification;
            return (
              <div key={entry.key} role="listitem">
              <button
                key={entry.key}
                type="button"
                className={active ? styles.optionActive : styles.option}
                aria-pressed={active}
                onClick={() => selectProblem(entry.classification)}
              >
                <span className={styles.optionTop}><span className={styles.number}>{ENTRY_ICONS[entry.key]}</span><span className={styles.affordance} aria-hidden="true">↗</span></span>
                <span className={styles.optionTitle}>{entry.label}</span>
                <span className={styles.optionDescription}>{getProblemEntryDescription(entry.classification)}</span>
              </button>
              </div>
            );
          })}
        </div>
        {selected && (
          <div className={styles.results} aria-live="polite" aria-busy={isLoading}>
            <div className={styles.resultHeader}>
              <p className={styles.resultKicker}>Ruta recomendada</p>
              <h3 className={styles.resultTitle}>Servicios para: {selected}</h3>
            </div>
            {isLoading ? <p className={styles.state} role="status">Estamos preparando opciones para esta necesidad.</p> : isError ? <p className={styles.state} role="alert">No pudimos cargar las opciones ahora. Puedes escribirnos para revisar tu caso.</p> : matchingServices.length > 0 ? (
              <div className={styles.grid}>
                {matchingServices.map((service: ServiceResponse) => <ServiceCard key={service.id} service={service} />)}
              </div>
            ) : (
              <div className={styles.state} role="status"><strong>Aún no hay una opción publicada para esta ruta.</strong><span>Podemos revisar tu caso y orientarte hacia el siguiente paso.</span></div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
