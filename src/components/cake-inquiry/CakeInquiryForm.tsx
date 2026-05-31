"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { buildPreviewSegments } from "@/lib/cake-inquiry-preview";
import {
  CUSTOM_FLAVOUR_OPTION,
  DELIVERY_METHODS,
  FLAVOURS,
  OCCASIONS,
  type Occasion,
  type Servings,
  type Style,
  STYLES,
} from "@/lib/cake-inquiry-constants";
import {
  toPayload,
  validateCakeInquiry,
  type CakeInquiryFormState,
} from "@/lib/validate-cake-inquiry";
import type { FieldErrors } from "@/types/cake-inquiry";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";

import "./cake-inquiry.css";

const SPARKLE = " ✦";

const SERVINGS_COLUMN_ONE = ["2", "6–8", "15–20", "More"] as const satisfies readonly Servings[];
const SERVINGS_COLUMN_TWO = ["4–5", "10–12", "20–40"] as const satisfies readonly Servings[];

const displayServing = (value: string) => value.replace("–", "-");

const ERROR_FIELD_ORDER = [
  "occasion",
  "customOccasion",
  "servings",
  "customServings",
  "flavour",
  "customFlavour",
  "style",
  "name",
  "phone",
  "email",
  "eventDate",
  "deliveryMethod",
] as const satisfies readonly (keyof FieldErrors)[];

function getScrollTargetId(
  field: (typeof ERROR_FIELD_ORDER)[number],
  baseId: string,
): string {
  switch (field) {
    case "occasion":
      return `${baseId}-occasion-section`;
    case "customOccasion":
      return `${baseId}-custom-occasion`;
    case "servings":
      return `${baseId}-servings-section`;
    case "customServings":
      return `${baseId}-custom-servings`;
    case "flavour":
      return `${baseId}-flavour-section`;
    case "customFlavour":
      return `${baseId}-custom-flavour`;
    case "style":
      return `${baseId}-style-section`;
    case "name":
      return `${baseId}-name`;
    case "phone":
      return `${baseId}-phone`;
    case "email":
      return `${baseId}-email`;
    case "eventDate":
      return `${baseId}-event`;
    case "deliveryMethod":
      return `${baseId}-delivery-section`;
  }
}

function focusScrollTarget(el: HTMLElement) {
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    el.focus({ preventScroll: true });
    return;
  }

  const focusable = el.querySelector<HTMLElement>(
    "input:not([type=file]), select, textarea",
  );
  focusable?.focus({ preventScroll: true });
}

const initialState = (): CakeInquiryFormState => ({
  occasion: "",
  customOccasion: "",
  servings: "",
  customServings: "",
  flavour: "",
  customFlavour: "",
  style: "",
  notes: "",
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  deliveryMethod: "",
});

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="cake-inquiry-error">{message}</p>;
}

function SubmitSpinner() {
  return (
    <span
      className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-[#b84d63]/30 border-t-[#b84d63]"
      aria-hidden
    />
  );
}

type RadioChoiceProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
};

function RadioChoice({
  name,
  value,
  checked,
  onChange,
  label,
}: RadioChoiceProps) {
  return (
    <label className="cake-inquiry-radio-option">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="cake-inquiry-radio-dot" aria-hidden />
      <span>{label}</span>
    </label>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

function FormField({ id, label, error, children, className }: FormFieldProps) {
  return (
    <div
      className={`cake-inquiry-field${error ? " cake-inquiry-field--error" : ""}${className ? ` ${className}` : ""}`}
    >
      <label className="cake-inquiry-label" htmlFor={id}>
        {label}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

export function CakeInquiryForm() {
  const { locale } = useLocale();
  const t = useTranslations();
  const inquiry = t.inquiry;
  const baseId = useId();
  const [form, setForm] = useState<CakeInquiryFormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shakeTargetId, setShakeTargetId] = useState<string | null>(null);
  const [showValidationBanner, setShowValidationBanner] = useState(false);
  const [validationBannerKey, setValidationBannerKey] = useState(0);
  const submitInFlight = useRef(false);

  const previewSegments = useMemo(
    () =>
      buildPreviewSegments(
        {
          occasion: form.occasion,
          servings: form.servings,
          flavour: form.flavour,
          customFlavour: form.customFlavour,
          style: form.style,
        },
        inquiry.preview,
        inquiry.options,
      ),
    [
      form.customFlavour,
      form.flavour,
      form.occasion,
      form.servings,
      form.style,
      inquiry.options,
      inquiry.preview,
    ],
  );

  const isFormComplete = useMemo(
    () => Object.keys(validateCakeInquiry(form, inquiry.validation)).length === 0,
    [form, inquiry.validation],
  );

  const wasCompleteRef = useRef(false);
  const [readyPulse, setReadyPulse] = useState(false);

  useEffect(() => {
    if (isFormComplete && !wasCompleteRef.current) {
      setReadyPulse(true);
      const timer = window.setTimeout(() => setReadyPulse(false), 1200);
      wasCompleteRef.current = true;
      return () => window.clearTimeout(timer);
    }
    if (!isFormComplete) {
      wasCompleteRef.current = false;
      setReadyPulse(false);
    }
  }, [isFormComplete]);

  useEffect(() => {
    if (isFormComplete) {
      setShowValidationBanner(false);
    }
  }, [isFormComplete]);

  function set<K extends keyof CakeInquiryFormState>(
    key: K,
    value: CakeInquiryFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setServerError(null);
    if (errors[key as keyof FieldErrors]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[key as keyof FieldErrors];
        return n;
      });
    }
  }

  function clearError(key: keyof FieldErrors) {
    if (!errors[key]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function scrollToFirstError(errorMap: FieldErrors) {
    const firstField = ERROR_FIELD_ORDER.find((key) => errorMap[key]);
    if (!firstField) return;

    const targetId = getScrollTargetId(firstField, baseId);

    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      focusScrollTarget(el);
      setShakeTargetId(targetId);
      window.setTimeout(() => setShakeTargetId(null), 900);
    });
  }

  function sectionClass(sectionId: string, hasError: boolean) {
    return [
      "cake-inquiry-section",
      hasError ? "cake-inquiry-section--invalid" : "",
      shakeTargetId === sectionId ? "cake-inquiry-section--shake" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function inputClass(id: string, extra = "") {
    return [
      extra,
      shakeTargetId === id ? "cake-inquiry-input--shake" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitInFlight.current) return;

    setServerError(null);
    const eMap = validateCakeInquiry(form, inquiry.validation);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) {
      setShowValidationBanner(true);
      setValidationBannerKey((k) => k + 1);
      scrollToFirstError(eMap);
      return;
    }
    setShowValidationBanner(false);
    const payload = toPayload(form, locale);
    if (!payload) {
      setServerError(inquiry.completeRequired);
      return;
    }

    submitInFlight.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.success) {
        const base =
          data.error ?? inquiry.sendFailedRetry;
        setServerError(
          data.hint && data.hint.length > 0
            ? `${base} ${data.hint}`
            : base,
        );
        return;
      }
      setSuccess(true);
    } catch {
      setServerError(inquiry.sendFailedRetry);
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="cake-inquiry-form__main">
        <div className="rounded-3xl border border-[#8b3a4a]/20 bg-[#fff9f2] p-10 text-center shadow-sm">
        <p
          className="font-serif text-2xl font-normal leading-snug tracking-[0.02em] text-[#3d2228] sm:text-3xl"
          role="status"
        >
          {inquiry.successMessage}
        </p>
        <button
          type="button"
          className="cake-inquiry-cta mt-8 max-w-xs"
          onClick={() => {
            setForm(initialState());
            setSuccess(false);
            setErrors({});
            setServerError(null);
            submitInFlight.current = false;
            setSubmitting(false);
          }}
        >
          {inquiry.startAnother}
        </button>
        </div>
      </div>
    );
  }

  function renderServingOption(serving: Servings) {
    if (serving === "More") {
      return (
        <div
          key={serving}
          className="cake-inquiry-radio-row cake-inquiry-radio-row--inline-extra"
        >
          <RadioChoice
            name="servings"
            value={serving}
            checked={form.servings === serving}
            onChange={() => {
              set("servings", serving);
              clearError("servings");
            }}
            label={inquiry.options.servings[serving]}
          />
          {form.servings === "More" ? (
            <div className="cake-inquiry-radio-row__extra">
              <input
                id={`${baseId}-custom-servings`}
                type="text"
                className={inputClass(
                  `${baseId}-custom-servings`,
                  "cake-inquiry-input cake-inquiry-input--inline",
                )}
                value={form.customServings}
                onChange={(e) => set("customServings", e.target.value)}
                placeholder=""
                aria-label={inquiry.customServingsPlaceholder}
                aria-invalid={Boolean(errors.customServings)}
              />
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div key={serving} className="cake-inquiry-radio-row">
        <RadioChoice
          name="servings"
          value={serving}
          checked={form.servings === serving}
          onChange={() => {
            setForm((f) => ({
              ...f,
              servings: serving,
              customServings: "",
            }));
            setServerError(null);
            clearError("servings");
            clearError("customServings");
          }}
          label={displayServing(inquiry.options.servings[serving])}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="cake-inquiry-form"
      noValidate
      aria-busy={submitting}
      inert={submitting}
    >
      <div className="cake-inquiry-form__main">
      <section
        id={`${baseId}-occasion-section`}
        className={sectionClass(
          `${baseId}-occasion-section`,
          Boolean(errors.occasion || errors.customOccasion),
        )}
        aria-labelledby={`${baseId}-occasion-heading`}
      >
        <h2
          id={`${baseId}-occasion-heading`}
          className="cake-inquiry-section-title"
        >
          {inquiry.occasionHeading}{SPARKLE}
        </h2>
        <div className="cake-inquiry-radio-list">
          {OCCASIONS.map((occasion) => (
            <div key={occasion} className="cake-inquiry-radio-row">
              <RadioChoice
                name="occasion"
                value={occasion}
                checked={form.occasion === occasion}
                onChange={() => {
                  setForm((f) => ({
                    ...f,
                    occasion: occasion as Occasion,
                    customOccasion:
                      occasion === "Something else" ? f.customOccasion : "",
                  }));
                  setServerError(null);
                  clearError("occasion");
                  if (occasion !== "Something else") clearError("customOccasion");
                }}
                label={inquiry.options.occasions[occasion]}
              />
              {occasion === "Something else" && form.occasion === "Something else" ? (
                <input
                  id={`${baseId}-custom-occasion`}
                  type="text"
                  className={inputClass(
                    `${baseId}-custom-occasion`,
                    "cake-inquiry-input cake-inquiry-input--nested",
                  )}
                  value={form.customOccasion}
                  onChange={(e) => set("customOccasion", e.target.value)}
                  placeholder={inquiry.customOccasionPlaceholder}
                  aria-label={inquiry.customOccasionAria}
                  aria-invalid={Boolean(errors.customOccasion)}
                />
              ) : null}
            </div>
          ))}
        </div>
        <FieldError message={errors.occasion} />
        <FieldError message={errors.customOccasion} />
      </section>

      <hr className="cake-inquiry-divider" />

      <section
        id={`${baseId}-servings-section`}
        className={sectionClass(
          `${baseId}-servings-section`,
          Boolean(errors.servings || errors.customServings),
        )}
        aria-labelledby={`${baseId}-servings-heading`}
      >
        <h2
          id={`${baseId}-servings-heading`}
          className="cake-inquiry-section-title"
        >
          {inquiry.servingsHeading}{SPARKLE}
        </h2>
        <div className="cake-inquiry-radio-list cake-inquiry-radio-list--columns">
          <div className="cake-inquiry-radio-list">
            {SERVINGS_COLUMN_ONE.map((serving) => renderServingOption(serving))}
          </div>
          <div className="cake-inquiry-radio-list">
            {SERVINGS_COLUMN_TWO.map((serving) => renderServingOption(serving))}
          </div>
        </div>
        <FieldError message={errors.servings} />
        <FieldError message={errors.customServings} />
      </section>

      <hr className="cake-inquiry-divider" />

      <section
        id={`${baseId}-flavour-section`}
        className={sectionClass(
          `${baseId}-flavour-section`,
          Boolean(errors.flavour || errors.customFlavour),
        )}
        aria-labelledby={`${baseId}-flavour-heading`}
      >
        <h2
          id={`${baseId}-flavour-heading`}
          className="cake-inquiry-section-title"
        >
          {inquiry.flavourHeading}{SPARKLE}
        </h2>
        <div className="cake-inquiry-radio-list">
          {FLAVOURS.map((flavour) => (
            <div key={flavour} className="cake-inquiry-radio-row">
              <RadioChoice
                name="flavour"
                value={flavour}
                checked={form.flavour === flavour}
                onChange={() => {
                  setForm((f) => ({
                    ...f,
                    flavour,
                    customFlavour:
                      flavour === CUSTOM_FLAVOUR_OPTION ? f.customFlavour : "",
                  }));
                  setServerError(null);
                  clearError("flavour");
                  if (flavour !== CUSTOM_FLAVOUR_OPTION) {
                    clearError("customFlavour");
                  }
                }}
                label={inquiry.options.flavours[flavour]}
              />
              {flavour === CUSTOM_FLAVOUR_OPTION &&
              form.flavour === CUSTOM_FLAVOUR_OPTION ? (
                <input
                  id={`${baseId}-custom-flavour`}
                  type="text"
                  className={inputClass(
                    `${baseId}-custom-flavour`,
                    "cake-inquiry-input cake-inquiry-input--nested",
                  )}
                  value={form.customFlavour}
                  onChange={(e) => set("customFlavour", e.target.value)}
                  placeholder={inquiry.customFlavourPlaceholder}
                  aria-label={inquiry.customFlavourAria}
                  aria-invalid={Boolean(errors.customFlavour)}
                  required
                />
              ) : null}
            </div>
          ))}
        </div>
        <FieldError message={errors.flavour} />
        <FieldError message={errors.customFlavour} />
      </section>

      <hr className="cake-inquiry-divider" />

      <section
        id={`${baseId}-style-section`}
        className={sectionClass(`${baseId}-style-section`, Boolean(errors.style))}
        aria-labelledby={`${baseId}-style-heading`}
      >
        <h2 id={`${baseId}-style-heading`} className="cake-inquiry-section-title">
          {inquiry.styleHeading}{SPARKLE}
        </h2>
        <div className="cake-inquiry-radio-list">
          {STYLES.map((style) => (
            <div key={style} className="cake-inquiry-radio-row">
              <RadioChoice
                name="style"
                value={style}
                checked={form.style === style}
                onChange={() => {
                  set("style", style as Style);
                  clearError("style");
                }}
                label={
                  style === "Not sure yet" ? (
                    <>
                      {inquiry.options.styles[style]}
                      <span className="cake-inquiry-radio-hint">
                        {inquiry.styleHint}
                      </span>
                    </>
                  ) : (
                    inquiry.options.styles[style]
                  )
                }
              />
            </div>
          ))}
        </div>
        <FieldError message={errors.style} />
      </section>

      <hr className="cake-inquiry-divider" />

      <section aria-labelledby={`${baseId}-notes-heading`}>
        <h2
          id={`${baseId}-notes-heading`}
          className="cake-inquiry-section-title"
        >
          {inquiry.notesHeading}
        </h2>
        <textarea
          id={`${baseId}-notes`}
          className="cake-inquiry-textarea"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          placeholder={inquiry.notesPlaceholder}
        />
      </section>

      <hr className="cake-inquiry-divider" />

      <section aria-labelledby={`${baseId}-contact-heading`}>
        <h2
          id={`${baseId}-contact-heading`}
          className="cake-inquiry-section-title"
        >
          {inquiry.deliveryHeading}{SPARKLE}
        </h2>

        <div className="cake-inquiry-grid cake-inquiry-grid--2">
          <FormField
            id={`${baseId}-name`}
            label={`${inquiry.nameLabel}${SPARKLE}`}
            error={errors.name}
          >
            <input
              id={`${baseId}-name`}
              type="text"
              className={inputClass(`${baseId}-name`, "cake-inquiry-input")}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              required
            />
          </FormField>

          <FormField
            id={`${baseId}-phone`}
            label={`${inquiry.phoneLabel}${SPARKLE}`}
            error={errors.phone}
          >
            <input
              id={`${baseId}-phone`}
              type="tel"
              className={inputClass(`${baseId}-phone`, "cake-inquiry-input")}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              required
            />
          </FormField>

          <FormField
            id={`${baseId}-email`}
            label={`${inquiry.emailLabel}${SPARKLE}`}
            error={errors.email}
          >
            <input
              id={`${baseId}-email`}
              type="email"
              className={inputClass(`${baseId}-email`, "cake-inquiry-input")}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              required
            />
          </FormField>

          <FormField
            id={`${baseId}-event`}
            label={`${inquiry.eventDateLabel}${SPARKLE}`}
            error={errors.eventDate}
          >
            <input
              id={`${baseId}-event`}
              type="date"
              className={inputClass(`${baseId}-event`, "cake-inquiry-input")}
              value={form.eventDate}
              onChange={(e) => set("eventDate", e.target.value)}
              aria-invalid={Boolean(errors.eventDate)}
              required
            />
          </FormField>
        </div>

        <fieldset
          id={`${baseId}-delivery-section`}
          className={`cake-inquiry-delivery${errors.deliveryMethod ? " cake-inquiry-delivery--invalid" : ""}${shakeTargetId === `${baseId}-delivery-section` ? " cake-inquiry-section--shake" : ""}`}
        >
          <legend className="cake-inquiry-delivery__legend">
            {inquiry.deliveryLabel}{SPARKLE}
          </legend>
          <div className="cake-inquiry-delivery__options">
            {DELIVERY_METHODS.map((d) => (
              <label key={d} className="cake-inquiry-delivery__option">
                <input
                  type="radio"
                  name="delivery"
                  checked={form.deliveryMethod === d}
                  onChange={() => set("deliveryMethod", d)}
                />
                <span className="cake-inquiry-delivery__dot" aria-hidden />
                {inquiry.options.delivery[d]}
              </label>
            ))}
          </div>
          <FieldError message={errors.deliveryMethod} />
        </fieldset>
      </section>

      <div className="cake-inquiry-preview" aria-live="polite">
        <span className="cake-inquiry-preview__sparkle" aria-hidden>
          ✦
        </span>
        <p className="cake-inquiry-preview__text">
          {previewSegments.map((segment, index) =>
            segment.highlight ? (
              <span
                key={`${segment.text}-${index}`}
                className="cake-inquiry-preview__highlight"
              >
                {segment.text}
              </span>
            ) : (
              <span key={`${segment.text}-${index}`}>{segment.text}</span>
            ),
          )}
        </p>
      </div>

      {serverError ? (
        <div
          className="cake-inquiry-server-error"
          role="alert"
          aria-live="assertive"
        >
          <strong>{inquiry.sendFailed}</strong> {serverError}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {submitting ? inquiry.submitting : ""}
      </p>
      </div>

      <div
        className={`cake-inquiry-footer${isFormComplete ? " cake-inquiry-footer--ready" : ""}`}
      >
        <div className="cake-inquiry-footer__inner">
          {showValidationBanner && Object.keys(errors).length > 0 ? (
            <div
              key={validationBannerKey}
              className="cake-inquiry-validation-banner"
              role="alert"
              aria-live="assertive"
            >
              {inquiry.fillRequired}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className={[
              "cake-inquiry-cta",
              isFormComplete ? "cake-inquiry-cta--ready" : "",
              readyPulse ? "cake-inquiry-cta--ready-pop" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-describedby={`${baseId}-footer-note`}
          >
            {submitting ? (
              <>
                <SubmitSpinner />
                <span>{inquiry.sending}</span>
              </>
            ) : isFormComplete ? (
              <>✦ {inquiry.createCake}</>
            ) : (
              <>{inquiry.createCake}</>
            )}
          </button>
          <p
            id={`${baseId}-footer-note`}
            className={`cake-inquiry-footer__note${isFormComplete ? " cake-inquiry-footer__note--ready" : ""}`}
            aria-live="polite"
          >
            {isFormComplete
              ? inquiry.createCakeReady
              : inquiry.createCakeFooter}
          </p>
        </div>
      </div>
    </form>
  );
}
