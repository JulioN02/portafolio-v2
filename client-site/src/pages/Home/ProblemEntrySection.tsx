import { useState } from 'react';
import { SERVICE_PROBLEM_ENTRIES, type ServiceClassification } from '@jsoft/shared';
import type { ServiceResponse } from '@jsoft/shared';
import { useFeaturedServices } from '../../hooks/useServices';
import { ServiceCard } from '../../components/services/ServiceCard';
import styles from './ProblemEntrySection.module.css';

export function ProblemEntrySection() {
  const { data: services } = useFeaturedServices(12);
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
        <h2 id="problem-entry-title" className={styles.title}>¿Qué necesitas resolver?</h2>
        <p className={styles.subtitle}>Elige una situación y revisa servicios relacionados.</p>
        <div className={styles.options} role="list">
          {SERVICE_PROBLEM_ENTRIES.map((entry) => {
            const active = selected === entry.classification;
            return (
              <button
                key={entry.key}
                type="button"
                className={active ? styles.optionActive : styles.option}
                aria-pressed={active}
                onClick={() => selectProblem(entry.classification)}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
        {selected && (
          <div className={styles.results} aria-live="polite">
            <h3 className={styles.resultTitle}>Servicios para: {selected}</h3>
            {matchingServices.length > 0 ? (
              <div className={styles.grid}>
                {matchingServices.map((service: ServiceResponse) => <ServiceCard key={service.id} service={service} />)}
              </div>
            ) : (
              <p>No hay servicios publicados con esta clasificación todavía. Puedes escribirnos para revisar tu caso.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
