"use client";

import PhoneInput from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import fr from "react-phone-number-input/locale/fr.json";

import { formatPhoneForWhatsApp } from "@/lib/format-phone-e164";

import "react-phone-number-input/style.css";

type PhoneFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  locale: "en" | "fr";
  invalid?: boolean;
  countrySelectAriaLabel: string;
  hint: string;
  whatsAppReadyLabel: string;
};

export function PhoneField({
  id,
  value,
  onChange,
  locale,
  invalid,
  countrySelectAriaLabel,
  hint,
  whatsAppReadyLabel,
}: PhoneFieldProps) {
  const whatsAppNumber = formatPhoneForWhatsApp(value);

  return (
    <div className="cake-inquiry-phone-wrap">
      <PhoneInput
        id={id}
        international
        defaultCountry="SN"
        countryCallingCodeEditable={false}
        labels={locale === "fr" ? fr : en}
        value={value || undefined}
        onChange={(next) => onChange(next ?? "")}
        className={`cake-inquiry-phone${invalid ? " cake-inquiry-phone--invalid" : ""}`}
        numberInputProps={{
          "aria-invalid": invalid,
          autoComplete: "tel",
          required: true,
          inputMode: "tel",
          placeholder: locale === "fr" ? "77 123 45 67" : "77 123 45 67",
        }}
        countrySelectProps={{
          "aria-label": countrySelectAriaLabel,
        }}
      />
      <p className="cake-inquiry-phone-hint">{hint}</p>
      {whatsAppNumber ? (
        <p className="cake-inquiry-phone-preview" aria-live="polite">
          <span className="cake-inquiry-phone-preview__label">
            {whatsAppReadyLabel}
          </span>{" "}
          <strong>{whatsAppNumber}</strong>
        </p>
      ) : null}
    </div>
  );
}
