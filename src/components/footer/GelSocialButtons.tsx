"use client";

import { useTranslations } from "@/i18n/LocaleProvider";

/** Replace with your live WhatsApp link (wa.me/country+digits, no spaces). */
const WHATSAPP_HREF = "https://wa.me/221777289602";

export function GelSocialButtons() {
  const t = useTranslations();

  return (
    /* Empty onTouchStart unlocks :active pseudo-class on iOS Safari for child <a> elements */
    <div className="gel-social-buttons" onTouchStart={() => {}}>
      <a
        className="gb gb--snapchat"
        href="https://www.snapchat.com/@fouretdelices"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.footer.snapchat}
      >
        <span className="gb-s" aria-hidden />
        <span className="gb-f" aria-hidden>
          <svg viewBox="0 0 512 512" aria-hidden>
            <path
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="18"
              strokeLinejoin="round"
              d="M510.846 392.673c-5.211 12.157-27.239 21.089-67.36 27.318c-2.064 2.786-3.775 14.686-6.507 23.956c-1.625 5.566-5.623 8.869-12.128 8.869l-.297-.005c-9.395 0-19.203-4.323-38.852-4.323c-26.521 0-35.662 6.043-56.254 20.588c-21.832 15.438-42.771 28.764-74.027 27.399c-31.646 2.334-58.025-16.908-72.871-27.404c-20.714-14.643-29.828-20.582-56.241-20.582c-18.864 0-30.736 4.72-38.852 4.72c-8.073 0-11.213-4.922-12.422-9.04c-2.703-9.189-4.404-21.263-6.523-24.13c-20.679-3.209-67.31-11.344-68.498-32.15a10.627 10.627 0 0 1 8.877-11.069c69.583-11.455 100.924-82.901 102.227-85.934c.074-.176.155-.344.237-.515c3.713-7.537 4.544-13.849 2.463-18.753c-5.05-11.896-26.872-16.164-36.053-19.796c-23.715-9.366-27.015-20.128-25.612-27.504c2.437-12.836 21.725-20.735 33.002-15.453c8.919 4.181 16.843 6.297 23.547 6.297c5.022 0 8.212-1.204 9.96-2.171c-2.043-35.936-7.101-87.29 5.687-115.969C158.122 21.304 229.705 15.42 250.826 15.42c.944 0 9.141-.089 10.11-.089c52.148 0 102.254 26.78 126.723 81.643c12.777 28.65 7.749 79.792 5.695 116.009c1.582.872 4.357 1.942 8.599 2.139c6.397-.286 13.815-2.389 22.069-6.257c6.085-2.846 14.406-2.461 20.48.058l.029.01c9.476 3.385 15.439 10.215 15.589 17.87c.184 9.747-8.522 18.165-25.878 25.018c-2.118.835-4.694 1.655-7.434 2.525c-9.797 3.106-24.6 7.805-28.616 17.271c-2.079 4.904-1.256 11.211 2.46 18.748q.13.254.239.515c1.301 3.03 32.615 74.46 102.23 85.934c6.427 1.058 11.163 7.877 7.725 15.859"
            />
          </svg>
        </span>
      </a>

      <a
        className="gb"
        href="https://www.instagram.com/four_et_delices/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.footer.instagram}
      >
        <span className="gb-s" aria-hidden />
        <span className="gb-f" aria-hidden>
          <svg viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle
              cx="17.5"
              cy="6.5"
              r="0.1"
              fill="#fbf4eb"
              stroke="#fbf4eb"
              strokeWidth="2.5"
            />
          </svg>
        </span>
      </a>

      <a
        className="gb gb--tiktok"
        href="https://www.tiktok.com/@fouretdelices"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.footer.tiktok}
      >
        <span className="gb-s" aria-hidden />
        <span className="gb-f" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path
              d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
              fill="none"
              stroke="#FE2C55"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0.45, 0.4)"
            />
            <path
              d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
              fill="none"
              stroke="#25F4EE"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
              fill="none"
              stroke="#f5f8fa"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>

      <a
        className="gb gb--wa"
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.footer.whatsapp}
      >
        <span className="gb-s" aria-hidden />
        <span className="gb-f" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"
            />
          </svg>
        </span>
      </a>
    </div>
  );
}
