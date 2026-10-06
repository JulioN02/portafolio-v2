import { useState } from 'react';
import {
  SERVICE_PROBLEM_ENTRIES,
  serviceMatchesClassification,
  type ServiceClassification,
  type ServiceResponse,
} from '@jsoft/shared';
import { useSituations } from '../../hooks/useSituations';
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
  const { data: situations, isLoading: situationsLoading, isError: situationsError } = useSituations();
  const { data: fallbackServices, isLoading: servicesLoading, isError: servicesError } = useFeaturedServices(12);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const situationsReady = !situationsError && (situations?.length ?? 0) > 0;
  const selectedSituation = situationsReady
    ? situations!.find((situation) => situation.id === selectedKey)
    : undefined;
  const selectedEntry = !situationsReady
    ? SERVICE_PROBLEM_ENTRIES.find((entry) => entry.key === selectedKey)
    : undefined;

  const fallbackResults: ServiceResponse[] = selectedEntry && fallbackServices
    ? fallbackServices.filter((service) => serviceMatchesClassification(service.classification, selectedEntry.classification))
    : [];

  const toggle = (key: string) => setSelectedKey((current) => (current === key ? null : key));

  return (
    <section className={styles.section} aria-labelledby="problem-entry-title">
      <div className={styles.container}>
        <p className={styles.eyebrow}>Punto de partida</p>
        <h2 id="problem-entry-title" className={styles.title}>¿Qué necesitas resolver?</h2>
        <p className={styles.subtitle}>Elige una situación y revisa servicios relacionados.</p>

        <div className={styles.options} role="list">
          {situationsReady
            ? situations!.map((situation, index) => {
                const active = selectedKey === situation.id;
                return (
                  <div key={situation.id} role="listitem">
                    <button
                      type="button"
                      className={active ? styles.optionActive : styles.option}
                      aria-pressed={active}
                      onClick={() => toggle(situation.id)}
                    >
                      <span className={styles.optionTop}>
                        <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                        <span className={styles.affordance} aria-hidden="true">↗</span>
                      </span>
                      <span className={styles.optionTitle}>{situation.title}</span>
                      <span className={styles.optionDescription}>{situation.description}</span>
                    </button>
                  </div>
                );
              })
            : SERVICE_PROBLEM_ENTRIES.map((entry) => {
                const active = selectedKey === entry.key;
                return (
                  <div key={entry.key} role="listitem">
                    <button
                      type="button"
                      className={active ? styles.optionActive : styles.option}
                      aria-pressed={active}
                      onClick={() => toggle(entry.key)}
                    >
                      <span className={styles.optionTop}>
                        <span className={styles.number}>{ENTRY_ICONS[entry.key]}</span>
                        <span className={styles.affordance} aria-hidden="true">↗</span>
                      </span>
                      <span className={styles.optionTitle}>{entry.label}</span>
                      <span className={styles.optionDescription}>{getProblemEntryDescription(entry.classification)}</span>
                    </button>
                  </div>
                );
              })}
        </div>

        {selectedKey && (
          <div className={styles.results} aria-live="polite" aria-busy={situationsLoading || servicesLoading}>
            <div className={styles.resultHeader}>
              <p className={styles.resultKicker}>Ruta recomendada</p>
              <h3 className={styles.resultTitle}>
                Servicios para: {selectedSituation?.title ?? selectedEntry?.label ?? ''}
              </h3>
            </div>

            {situationsReady ? (
              selectedSituation && selectedSituation.services.length > 0 ? (
                <div className={styles.grid}>
                  {selectedSituation.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className={styles.state} role="status">
                  <strong>Aún no hay una opción publicada para esta ruta.</strong>
                  <span>Podemos revisar tu caso y orientarte hacia el siguiente paso.</span>
                </div>
              )
            ) : servicesLoading ? (
              <p className={styles.state} role="status">Estamos preparando opciones para esta necesidad.</p>
            ) : servicesError ? (
              <p className={styles.state} role="alert">No pudimos cargar las opciones ahora. Puedes escribirnos para revisar tu caso.</p>
            ) : fallbackResults.length > 0 ? (
              <div className={styles.grid}>
                {fallbackResults.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className={styles.state} role="status">
                <strong>Aún no hay una opción publicada para esta ruta.</strong>
                <span>Podemos revisar tu caso y orientarte hacia el siguiente paso.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
