"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import type { Locale } from "@/i18n/config";
import {
  getMonthMatrix,
  isBeforeDay,
  isEventDateAllowed,
  isSameDay,
  parseIsoDate,
  startOfDay,
  toIsoDateLocal,
} from "@/lib/event-date";

type EventDateFieldLabels = {
  placeholder: string;
  openAria: string;
  prevMonth: string;
  nextMonth: string;
};

type EventDateFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
  minDate: Date;
  invalid?: boolean;
  shake?: boolean;
  labels: EventDateFieldLabels;
};

const localeTag = (locale: Locale) => (locale === "fr" ? "fr-FR" : "en-GB");

function CalendarIcon() {
  return (
    <svg
      aria-hidden
      className="cake-inquiry-date__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

export function EventDateField({
  id,
  value,
  onChange,
  locale,
  minDate,
  invalid,
  shake,
  labels,
}: EventDateFieldProps) {
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDate = useMemo(
    () => (value ? parseIsoDate(value) : null),
    [value],
  );

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate && isEventDateAllowed(selectedDate, minDate)) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  });

  const intlLocale = localeTag(locale);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        month: "long",
        year: "numeric",
      }).format(viewMonth),
    [intlLocale, viewMonth],
  );

  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return new Intl.DateTimeFormat(intlLocale, { weekday: "short" }).format(
        date,
      );
    });
  }, [intlLocale]);

  const displayValue = useMemo(() => {
    if (!selectedDate) return "";
    return new Intl.DateTimeFormat(intlLocale, {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(selectedDate);
  }, [intlLocale, selectedDate]);

  const weeks = useMemo(() => getMonthMatrix(viewMonth), [viewMonth]);

  const canGoPrevMonth = useMemo(() => {
    const lastDayPrev = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      0,
    );
    return !isBeforeDay(lastDayPrev, minDate);
  }, [minDate, viewMonth]);

  useEffect(() => {
    setViewMonth((current) => {
      const lastDayCurrent = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0,
      );
      if (isBeforeDay(lastDayCurrent, minDate)) {
        return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      }
      return current;
    });
  }, [minDate]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const openCalendar = () => {
    if (selectedDate && isEventDateAllowed(selectedDate, minDate)) {
      setViewMonth(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      );
    } else {
      setViewMonth(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
    }
    setOpen(true);
  };

  const selectDate = (date: Date) => {
    if (!isEventDateAllowed(date, minDate)) return;
    onChange(toIsoDateLocal(date));
    setOpen(false);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open ? setOpen(false) : openCalendar();
    }

    if (event.key === "ArrowDown" && !open) {
      event.preventDefault();
      openCalendar();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`cake-inquiry-date${open ? " cake-inquiry-date--open" : ""}${invalid ? " cake-inquiry-date--invalid" : ""}${shake ? " cake-inquiry-input--shake" : ""}`}
    >
      <button
        id={id}
        type="button"
        className="cake-inquiry-date__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-invalid={invalid}
        aria-label={labels.openAria}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className={`cake-inquiry-date__value${displayValue ? "" : " cake-inquiry-date__value--placeholder"}`}
        >
          {displayValue || labels.placeholder}
        </span>
        <CalendarIcon />
      </button>

      {open ? (
        <div
          id={popoverId}
          className="cake-inquiry-date__popover"
          role="dialog"
          aria-modal="false"
          aria-label={labels.openAria}
        >
          <div className="cake-inquiry-date__header">
            <button
              type="button"
              className="cake-inquiry-date__nav"
              aria-label={labels.prevMonth}
              disabled={!canGoPrevMonth}
              onClick={() =>
                setViewMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
            >
              ‹
            </button>
            <p className="cake-inquiry-date__month">{monthLabel}</p>
            <button
              type="button"
              className="cake-inquiry-date__nav"
              aria-label={labels.nextMonth}
              onClick={() =>
                setViewMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
            >
              ›
            </button>
          </div>

          <div className="cake-inquiry-date__weekdays" aria-hidden>
            {weekdayLabels.map((label) => (
              <span key={label} className="cake-inquiry-date__weekday">
                {label.replace(".", "")}
              </span>
            ))}
          </div>

          <div className="cake-inquiry-date__grid" role="grid">
            {weeks.map((week, weekIndex) =>
              week.map((date, dayIndex) => {
                if (!date) {
                  return (
                    <span
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="cake-inquiry-date__day cake-inquiry-date__day--empty"
                      role="presentation"
                    />
                  );
                }

                const disabled = !isEventDateAllowed(date, minDate);
                const selected = selectedDate
                  ? isSameDay(date, selectedDate)
                  : false;
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={toIsoDateLocal(date)}
                    type="button"
                    role="gridcell"
                    className={[
                      "cake-inquiry-date__day",
                      selected ? "cake-inquiry-date__day--selected" : "",
                      isToday ? "cake-inquiry-date__day--today" : "",
                      disabled ? "cake-inquiry-date__day--disabled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={disabled}
                    aria-selected={selected}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
