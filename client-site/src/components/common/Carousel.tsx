import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './Carousel.module.css';

interface CarouselProps {
  children: React.ReactNode[];
  slidesToShow?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
}

export function Carousel({ 
  children, 
  slidesToShow = 3, 
  autoplay = true,
  autoplayInterval = 4000 
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
  });
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay
  useEffect(() => {
    if (!emblaApi || !autoplay) return;
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, autoplayInterval);
    
    return () => clearInterval(interval);
  }, [emblaApi, autoplay, autoplayInterval]);

  if (!children.length) return null;

  return (
    <div className={styles.carousel}>
      <div className={styles.embla} ref={emblaRef}>
        <div 
          className={styles.embla__container}
          style={{ 
            '--slides-to-show': slidesToShow 
          } as React.CSSProperties}
        >
          {children.map((child, index) => (
            <div key={index} className={styles.embla__slide}>
              {child}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.controls}>
        <button 
          onClick={scrollPrev} 
          disabled={!canScrollPrev}
          className={styles.button}
          aria-label="Anterior"
        >
          ←
        </button>
        <button 
          onClick={scrollNext} 
          disabled={!canScrollNext}
          className={styles.button}
          aria-label="Siguiente"
        >
          →
        </button>
      </div>
    </div>
  );
}
