"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CakeCategory, OurCake } from "@/data/our-cakes";
import { ourCakeAngleList } from "@/data/our-cakes";
import { SiteHeaderOrderLink } from "@/components/site-header/SiteHeaderOrderLink";
import type { Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/LocaleProvider";
import { localizedPath } from "@/i18n/routing";
import { BackBar } from "./BackBar";

type CakeDetailViewProps = {
  category: CakeCategory;
  cake: OurCake;
  locale: Locale;
};

type SectionId = "description" | "craft";

function ChevronIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="our-cakes-lightbox__nav-icon"
    >
      {direction === "prev" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      className="our-cakes-lightbox__close-icon"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function FullscreenIcon({ compress }: { compress?: boolean }) {
  if (compress) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
      </svg>
    );
  }
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
    </svg>
  );
}

function AccordionChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`our-cakes-detail__section-chev${
        open ? " our-cakes-detail__section-chev--open" : ""
      }`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ShotButton({
  src,
  alt,
  label,
  variant,
  priority,
  onOpen,
  viewFullSizeLabel,
  zoomLabel,
}: {
  src: string;
  alt: string;
  label: string;
  variant: "hero" | "thumb";
  priority?: boolean;
  onOpen: () => void;
  viewFullSizeLabel: string;
  zoomLabel: string;
}) {
  return (
    <button
      type="button"
      className={`our-cakes-detail__shot our-cakes-detail__shot--${variant}`}
      onClick={onOpen}
      aria-label={viewFullSizeLabel.replace("{label}", label)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="our-cakes-detail__shot-img"
        sizes={
          variant === "hero"
            ? "(max-width: 900px) 100vw, 60vw"
            : "(max-width: 900px) 50vw, 22vw"
        }
        quality={92}
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
      <span className="our-cakes-detail__shot-zoom" aria-hidden>
        {zoomLabel}
      </span>
    </button>
  );
}

export function CakeDetailView({ category, cake, locale }: CakeDetailViewProps) {
  const t = useTranslations();
  const detail = t.cakes.detail;
  const angleLabels = [detail.frontView, detail.sideView, detail.detailView];
  const categoryLabel = t.cakes.categoryCakes.replace("{category}", category.title);
  const angles = ourCakeAngleList(cake);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openSection, setOpenSection] = useState<SectionId | null>(
    "description",
  );

  const toggleSection = useCallback((id: SectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
    setIsFullscreen(false);
  }, []);

  const closeLightbox = useCallback(async () => {
    await exitFullscreen();
    setLightboxIndex(null);
  }, [exitFullscreen]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + angles.length - 1) % angles.length,
    );
  }, [angles.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % angles.length,
    );
  }, [angles.length]);

  const toggleFullscreen = useCallback(async () => {
    const el = lightboxRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* unsupported or denied */
    }
  }, []);

  const handleLightboxTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    },
    [],
  );

  const handleLightboxTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      if (!start) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      touchStartRef.current = null;

      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      if (deltaX > 0) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goPrev, goNext],
  );

  useEffect(() => {
    if (lightboxIndex === null) {
      document.documentElement.removeAttribute("data-our-cakes-lightbox");
      return;
    }

    document.documentElement.setAttribute("data-our-cakes-lightbox", "open");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement === lightboxRef.current) {
          void exitFullscreen();
          return;
        }
        void closeLightbox();
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "f" || e.key === "F") {
        void toggleFullscreen();
      }
    };

    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === lightboxRef.current);
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.documentElement.removeAttribute("data-our-cakes-lightbox");
    };
  }, [
    lightboxIndex,
    closeLightbox,
    exitFullscreen,
    goPrev,
    goNext,
    toggleFullscreen,
  ]);

  const activeSrc = lightboxIndex !== null ? angles[lightboxIndex] : null;
  const activeLabel =
    lightboxIndex !== null
      ? detail.photoAlt
          .replace("{title}", cake.title)
          .replace("{angle}", angleLabels[lightboxIndex] ?? detail.frontView)
      : "";

  const sections: Array<{
    id: SectionId;
    label: string;
    body: React.ReactNode;
  }> = [
    {
      id: "description",
      label: detail.description,
      body: <p>{cake.description}</p>,
    },
    {
      id: "craft",
      label: detail.craft,
      body: (
        <ul className="our-cakes-detail__list">
          {cake.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
          <li>{detail.handFinished}</li>
          <li>{detail.anyFlavour}</li>
        </ul>
      ),
    },
  ];

  return (
    <>
      <BackBar
        href={localizedPath(`/cakes/${category.id}`, locale)}
        label={categoryLabel}
      />

      <div className="our-cakes-detail">
        <aside className="our-cakes-detail__info">
          <p className="our-cakes-detail__brand">{t.nav.brandName}</p>

          <h1 className="our-cakes-detail__title">{cake.title}</h1>

          <p className="our-cakes-detail__byline">
            {detail.designedBy}
          </p>
          <p className="our-cakes-detail__year">[2026]</p>

          <dl className="our-cakes-detail__meta-grid">
            <div className="our-cakes-detail__meta-item">
              <dt>{detail.collection}</dt>
              <dd>{category.title}</dd>
            </div>
            <div className="our-cakes-detail__meta-item">
              <dt>{detail.code}</dt>
              <dd>{cake.code}</dd>
            </div>
          </dl>

          <div className="our-cakes-detail__sections">
            {sections.map((section) => {
              const isOpen = openSection === section.id;
              const panelId = `our-cakes-section-${section.id}`;
              return (
                <div
                  key={section.id}
                  className={`our-cakes-detail__section${
                    isOpen ? " our-cakes-detail__section--open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="our-cakes-detail__section-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="our-cakes-detail__section-label">
                      {section.label}
                    </span>
                    <AccordionChevron open={isOpen} />
                  </button>
                  <div
                    id={panelId}
                    className="our-cakes-detail__section-panel"
                    role="region"
                    aria-hidden={!isOpen}
                    hidden={!isOpen}
                  >
                    <div className="our-cakes-detail__section-body">
                      {section.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="our-cakes-detail__cta-wrap">
            <SiteHeaderOrderLink
              label={detail.beginDesign}
              ariaLabel={detail.beginDesignAria}
            />
          </div>

          <p className="our-cakes-detail__hint">
            {detail.galleryHint}
          </p>
        </aside>

        <div
          className="our-cakes-detail__gallery"
          aria-label={detail.photos.replace("{title}", cake.title)}
        >
          {angles[0] ? (
            <ShotButton
              src={angles[0]}
              alt={detail.photoAlt
                .replace("{title}", cake.title)
                .replace("{angle}", angleLabels[0])}
              label={angleLabels[0]}
              variant="hero"
              priority
              onOpen={() => openLightbox(0)}
              viewFullSizeLabel={detail.viewFullSize}
              zoomLabel={detail.clickToEnlarge}
            />
          ) : null}

          <div className="our-cakes-detail__stack">
            {angles[1] ? (
              <ShotButton
                src={angles[1]}
                alt={detail.photoAlt
                  .replace("{title}", cake.title)
                  .replace("{angle}", angleLabels[1])}
                label={angleLabels[1]}
                variant="thumb"
                onOpen={() => openLightbox(1)}
                viewFullSizeLabel={detail.viewFullSize}
                zoomLabel={detail.clickToEnlarge}
              />
            ) : null}
            {angles[2] ? (
              <ShotButton
                src={angles[2]}
                alt={detail.photoAlt
                  .replace("{title}", cake.title)
                  .replace("{angle}", angleLabels[2])}
                label={angleLabels[2]}
                variant="thumb"
                onOpen={() => openLightbox(2)}
                viewFullSizeLabel={detail.viewFullSize}
                zoomLabel={detail.clickToEnlarge}
              />
            ) : null}
          </div>
        </div>
      </div>

      {activeSrc !== null && lightboxIndex !== null ? (
        <div
          ref={lightboxRef}
          className={`our-cakes-lightbox${
            isFullscreen ? " our-cakes-lightbox--native-fs" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={activeLabel}
          onClick={() => void closeLightbox()}
        >
          <button
            type="button"
            className="our-cakes-lightbox__fs"
            onClick={(e) => {
              e.stopPropagation();
              void toggleFullscreen();
            }}
            aria-label={
              isFullscreen ? detail.exitFullscreen : detail.enterFullscreen
            }
          >
            <FullscreenIcon compress={isFullscreen} />
          </button>

          <button
            type="button"
            className="our-cakes-lightbox__close"
            onClick={(e) => {
              e.stopPropagation();
              void closeLightbox();
            }}
            aria-label={detail.closeGallery}
          >
            <CloseIcon />
          </button>

          <button
            type="button"
            className="our-cakes-lightbox__nav our-cakes-lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={detail.previousPhoto}
          >
            <ChevronIcon direction="prev" />
          </button>

          <button
            type="button"
            className="our-cakes-lightbox__nav our-cakes-lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={detail.nextPhoto}
          >
            <ChevronIcon direction="next" />
          </button>

          <p className="our-cakes-lightbox__counter" aria-live="polite">
            {detail.counter
              .replace("{index}", String(lightboxIndex + 1))
              .replace("{total}", String(angles.length))}
          </p>

          <div
            className="our-cakes-lightbox__stage"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <div className="our-cakes-lightbox__frame">
              <Image
                key={activeSrc}
                src={activeSrc}
                alt={activeLabel}
                fill
                className="our-cakes-lightbox__img"
                sizes="100vw"
                quality={95}
                priority
                draggable={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
