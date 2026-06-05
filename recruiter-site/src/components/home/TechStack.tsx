import { useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { techStack } from '../../data/tech-stack';
import { SectionTitle } from '../common/SectionTitle';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './TechStack.module.css';

const AUTOPLAY_INTERVAL = 4000;

export function TechStack() {
  const { t } = useTranslation();
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });

  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    autoplayTimerRef.current = setInterval(() => {
      emblaApi?.scrollNext();
    }, AUTOPLAY_INTERVAL);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    startAutoplay();

    emblaApi.on('pointerDown', stopAutoplay);
    emblaApi.on('pointerUp', startAutoplay);

    return () => {
      stopAutoplay();
      emblaApi.off('pointerDown', stopAutoplay);
      emblaApi.off('pointerUp', startAutoplay);
    };
  }, [emblaApi, startAutoplay, stopAutoplay]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionTitle
          title={t('techStack.title')}
          subtitle={t('techStack.subtitle')}
        />

        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {techStack.map((group) => (
              <div key={group.category} className={styles.emblaSlide}>
                <div className={styles.slideHeader}>
                  <span className={styles.slideIcon}>{group.icon}</span>
                  <h3 className={styles.slideTitle}>{group.category}</h3>
                </div>
                <div className={styles.techList}>
                  {group.items.map((item) => (
                    <div key={item.name} className={styles.techCard}>
                      <div className={styles.techInfo}>
                        <span className={styles.techName}>{item.name}</span>
                        <span className={styles.techLevel}>{item.level}</span>
                      </div>
                      <div className={styles.levelBar}>
                        <div
                          className={styles.levelFill}
                          style={{
                            width:
                              item.level === 'Avanzado'
                                ? '90%'
                                : item.level === 'Intermedio'
                                  ? '60%'
                                  : '30%',
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dots}>
          {techStack.map((group, index) => (
            <button
              key={group.category}
              className={styles.dot}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={t('techStack.slideAria', { category: group.category })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
