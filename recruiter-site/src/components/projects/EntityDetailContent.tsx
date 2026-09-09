import { useEffect, useRef } from 'react';
import {
  renderSimulatorEmbeds,
  prepareLightboxMedia,
  useMediaClickDelegation,
} from '@jsoft/shared';
import type { LightboxItem } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './EntityDetailContent.module.css';

interface EntityDetailContentProps {
  /** Normalized type: service | product | tool | successCase | project. */
  type: string;
  /** Resolved detail payload from useProjectDetail. */
  detail: Record<string, unknown>;
  /** Entity title — used for gallery alt + aria-labels. */
  title: string;
  /** Reports media clicks to the page-level Lightbox (D7). */
  onOpenLightbox: (items: LightboxItem[], index: number) => void;
}

/**
 * Per-type full content for the recruiter entity detail page. The rich wrapper
 * (richRef) is ALWAYS mounted so the delegated lightbox listener stays live and
 * prepareLightboxMedia can re-run when the late-arriving detail sections mount.
 * React-rendered media (technicalImages grid, successCase videos/links) lives
 * OUTSIDE richRef so delegation never double-fires or hijacks native playback.
 */
export function EntityDetailContent({
  type,
  detail,
  title,
  onOpenLightbox,
}: EntityDetailContentProps) {
  const { t } = useTranslation();
  const richRef = useRef<HTMLDivElement>(null);
  const fullDescriptionRef = useRef<HTMLDivElement>(null);
  const technicalExplanationRef = useRef<HTMLDivElement>(null);
  const projectBodyRef = useRef<HTMLDivElement>(null);

  const isProject = type === 'project';
  const isSuccessCase = type === 'successCase';

  const fullDescription = detail.fullDescription as string | undefined;
  const technicalExplanation = detail.technicalExplanation as string | undefined;
  const technicalImages = (detail.technicalImages as string[] | undefined) ?? [];
  const projectBody = detail.body as string | undefined;
  const tags = (detail.tags as string[] | undefined) ?? [];
  const repositoryUrl = detail.repositoryUrl as string | undefined;
  const videos = (detail.videos as string[] | undefined) ?? [];
  const links = (detail.links as string[] | undefined) ?? [];

  // Sanitized rich pipeline (renderSimulatorEmbeds → innerHTML, never raw
  // dangerouslySetInnerHTML). prepareLightboxMedia re-runs whenever the
  // resolved fields change so late content still gets lightbox wiring.
  useEffect(() => {
    if (fullDescriptionRef.current && fullDescription) {
      fullDescriptionRef.current.innerHTML = renderSimulatorEmbeds(fullDescription);
    }
    if (technicalExplanationRef.current && technicalExplanation) {
      technicalExplanationRef.current.innerHTML = renderSimulatorEmbeds(
        technicalExplanation,
      );
    }
    if (projectBodyRef.current && projectBody) {
      projectBodyRef.current.innerHTML = renderSimulatorEmbeds(projectBody);
    }
    if (richRef.current) {
      prepareLightboxMedia(richRef.current, t('blogPostContent.media.expand'));
    }
  }, [fullDescription, technicalExplanation, projectBody, t]);

  useMediaClickDelegation(richRef, (item) => onOpenLightbox([item], 0));

  const openFromTechnicalImage = (index: number) => {
    onOpenLightbox(
      technicalImages.map((src): LightboxItem => ({ kind: 'image', src })),
      index,
    );
  };

  return (
    <>
      {/* ── Project branch: tags chips ── */}
      {isProject && tags.length > 0 && (
        <div className={styles.tagsSection}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tagChip}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Always-mounted rich wrapper: rich sections mount INSIDE it so the
          delegated listener stays attached (D6). */}
      <div ref={richRef} id="entity-detail-rich" className={styles.rich}>
        {isProject && projectBody && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t('projectDetailModal.fullDescription')}
            </h2>
            <div ref={projectBodyRef} className={styles.technicalContent} />
          </section>
        )}
        {!isProject && !isSuccessCase && fullDescription && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t('projectDetailModal.fullDescription')}
            </h2>
            <div ref={fullDescriptionRef} className={styles.technicalContent} />
          </section>
        )}
        {!isProject && !isSuccessCase && technicalExplanation && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t('projectDetailModal.technicalExplanation')}
            </h2>
            <div ref={technicalExplanationRef} className={styles.technicalContent} />
          </section>
        )}
      </div>

      {/* ── Project branch: repository link ── */}
      {isProject && repositoryUrl && (
        <a
          href={repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.repoLink}
        >
          {t('projectDetailModal.viewRepository')}
        </a>
      )}

      {/* ── Technical images grid → page Lightbox. React-rendered, OUTSIDE
          richRef so delegation never double-fires (D6/decision #1144). ── */}
      {!isProject && !isSuccessCase && technicalImages.length > 0 && (
        <section className={styles.techImagesSection}>
          <h2 className={styles.sectionTitle}>
            {t('projectDetailModal.technicalImages')}
          </h2>
          <div className={styles.techImagesGrid}>
            {technicalImages.map((img, index) => (
              <button
                key={img}
                type="button"
                className={styles.technicalThumb}
                onClick={() => openFromTechnicalImage(index)}
                aria-label={t('blogPostContent.galleryImageAlt', {
                  title,
                  index: index + 1,
                  total: technicalImages.length,
                })}
              >
                <img src={img} alt="" className={styles.techImage} loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── SuccessCase branch: native videos + links (OUTSIDE richRef so
          delegation never hijacks native playback). ── */}
      {isSuccessCase && (
        <>
          {videos.length > 0 && (
            <section className={styles.section}>
              {videos.map((src) => (
                <video key={src} src={src} controls className={styles.successVideo} />
              ))}
            </section>
          )}
          {links.length > 0 && (
            <section className={styles.section}>
              {links.map((href) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.successLink}
                >
                  {href}
                </a>
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
}