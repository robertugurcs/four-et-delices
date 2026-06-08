"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/i18n/LocaleProvider";

const MARIANNE_EMAIL = "mariannendoye12@gmail.com";
const ROBERT_EMAIL = "robertugurcs@gmail.com";
const ROBERT_WHATSAPP_HREF = "https://wa.me/905534239570";

function gmailComposeHref(email: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

type WebsiteDesignCreditsProps = {
  open: boolean;
  onClose: () => void;
};

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="18" height="18">
      <path
        d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m4 8 8 5 8-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="18" height="18">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="16" height="16">
      <path
        d="M18 6 6 18M6 6l12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type CreditPersonProps = {
  name: string;
  email: string;
  whatsappHref?: string;
  emailLabel: string;
  whatsappLabel: string;
};

function CreditPerson({
  name,
  email,
  whatsappHref,
  emailLabel,
  whatsappLabel,
}: CreditPersonProps) {
  return (
    <li className="website-design-credits__person">
      <span className="website-design-credits__name">{name}</span>
      <span className="website-design-credits__actions">
        <a
          className="website-design-credits__action website-design-credits__action--email"
          href={gmailComposeHref(email)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={emailLabel}
        >
          <EmailIcon />
        </a>
        {whatsappHref ? (
          <a
            className="website-design-credits__action website-design-credits__action--wa"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={whatsappLabel}
          >
            <WhatsAppIcon />
          </a>
        ) : null}
      </span>
    </li>
  );
}

/**
 * Right-side credits panel — website design team with direct email / WhatsApp links.
 */
export function WebsiteDesignCredits({ open, onClose }: WebsiteDesignCreditsProps) {
  const t = useTranslations();
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="website-design-credits"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <aside
        ref={panelRef}
        className="website-design-credits__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="website-design-credits__close"
          onClick={onClose}
          aria-label={t.footer.closeCredits}
        >
          <CloseIcon />
        </button>

        <h2 id={titleId} className="website-design-credits__title">
          {t.footer.creditsTitle}
        </h2>

        <ul className="website-design-credits__list">
          <CreditPerson
            name="Marianne Ndoye"
            email={MARIANNE_EMAIL}
            emailLabel={t.footer.emailMarianne}
            whatsappLabel={t.footer.whatsappMarianne}
          />
          <CreditPerson
            name="Robert Ugur Aksu"
            email={ROBERT_EMAIL}
            whatsappHref={ROBERT_WHATSAPP_HREF}
            emailLabel={t.footer.emailRobert}
            whatsappLabel={t.footer.whatsappRobert}
          />
        </ul>
      </aside>
    </div>,
    document.body,
  );
}
