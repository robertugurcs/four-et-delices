"use client";

import Link from "next/link";

import { useLocale } from "@/i18n/LocaleProvider";

type SiteHeaderOrderLinkProps = {
  linkClassName?: string;
  label?: string;
  ariaLabel?: string;
};

/** Inline SVG — fills via `.cake-layer` / `.candle` (`globals.css`). */
function OrderLinkCandleSvg({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="124 58 38 172"
      preserveAspectRatio="xMidYMax meet"
      width={38}
      height={172}
      className={`candle ${className}`}
      aria-hidden
      focusable={false}
    >
      <path d="M152,223.48H136a6.65,6.65,0,0,1-6.65-6.64V121.69a6.65,6.65,0,0,1,6.65-6.64h16a6.65,6.65,0,0,1,6.65,6.64v95.15A6.65,6.65,0,0,1,152,223.48ZM136,119.05a2.65,2.65,0,0,0-2.65,2.64v95.15a2.65,2.65,0,0,0,2.65,2.64h16a2.65,2.65,0,0,0,2.65-2.64V121.69a2.65,2.65,0,0,0-2.65-2.64Z" />
      <rect x="142" y="101.06" width="4" height="14.75" />
      <path d="M144.2,96.67a9.21,9.21,0,0,1-7.74-4.57c-2.17-3.49-1.77-7.18-1.28-9.65,1.3-6.54,4.23-11.71,9.5-16.76a4.49,4.49,0,0,1,1.81-1.11l2.7-.69L149,66.67A23,23,0,0,0,151.47,79a15.07,15.07,0,0,1,1.33,10.44,8.77,8.77,0,0,1-7,7A7.55,7.55,0,0,1,144.2,96.67ZM145,71.1a25.1,25.1,0,0,0-5.92,12.13c-.58,2.91-.35,5,.75,6.76A5,5,0,0,0,145,92.58c2.09-.42,3.32-1.7,3.87-4a11.08,11.08,0,0,0-1-7.74A27.5,27.5,0,0,1,145,71.1Z" />
      <polygon points="131.33 135.13 156.67 127.38 156.67 150.6 131.33 158.38 131.33 135.13" />
      <rect x="130.69" y="158.9" width="26.62" height="4" transform="translate(-42.4 51.91) rotate(-17.86)" />
      <polygon points="131.33 171.64 156.67 163.89 156.67 187.12 131.33 194.9 131.33 171.64" />
      <rect x="130.69" y="195.42" width="26.62" height="4" transform="translate(-53.6 53.67) rotate(-17.86)" />
      <path d="M131.33,207.17l25.34-7.75v17.84a4,4,0,0,1-4.22,4l-17.34-1a4,4,0,0,1-3.78-4Z" />
      <rect x="130.69" y="123.73" width="26.62" height="4" transform="translate(-31.62 50.22) rotate(-17.86)" />
      <polygon points="132.5 123.59 152.02 117.05 134.2 117.4 132.15 119.07 132.5 123.59" />
    </svg>
  );
}

function OrderLinkCakeSvg({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-5 -10 110 88"
      width={120}
      height={120}
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        className="cake-layer"
        d="m73.035 33.387c-1.0664 0.22656-2.1562 0.33984-3.25 0.33984-2.6758-0.054687-5.3281-0.51953-7.8633-1.3789-3.6992-1.2188-7.6367-2.0703-11.512-0.13672-3.707 1.9766-8.1133 2.0117-13.047 0.085937l0.003907 0.003906c-3.6523-1.7227-7.8398-1.9219-11.641-0.55078v10.133h47.309z"
      />
      <path
        className="cake-layer"
        d="m39.156 28.055c3.5625 1.3867 6.5898 1.4219 9.1445 0.066406 5.4336-2.7188 10.648-1.6016 15.039-0.15625 3.0898 1.2031 6.4727 1.4297 9.6953 0.65234v-4.875c0-1.5469-1.2539-2.7969-2.7969-2.8008h-41.711c-1.5469 0.003906-2.7969 1.2539-2.8008 2.8008v3.2109c4.4648-1.2344 9.2227-0.84375 13.43 1.1016z"
      />
      <path
        className="cake-layer"
        d="m29.102 59.113c0.11719 0.027344 0.22656 0.066407 0.33203 0.11328 5.0469 2.1797 10.883 2.1602 18.375-0.050781l0.14453-0.046875c8.0625-2.9727 15.445-2.9922 21.938-0.058594h0.003906c0.13281 0.0625 0.26953 0.11328 0.40625 0.14844 7.3867 1.9375 13.277 2.1172 17.566 0.56641l0.003906-10.496c-0.003906-1.543-1.2539-2.7969-2.8008-2.7969h-70.141c-1.5469 0-2.7969 1.2539-2.8008 2.7969v8.9961c5.6445-1.0977 11.465-0.81641 16.973 0.82812z"
      />
      <path
        className="cake-plate"
        d="m93.008 74.449h-5.1367v-9.8398c-4.9766 1.3555-11.137 1.0625-18.746-0.93359-0.38672-0.10547-0.76562-0.24219-1.1289-0.40625-5.4219-2.4531-11.457-2.3906-18.445 0.17969-0.14062 0.050781-0.28516 0.097656-0.42969 0.14062-3.7266 1.1758-7.6016 1.8047-11.508 1.875-3.375 0.027344-6.7227-0.62891-9.8359-1.9375-5.0781-1.5508-10.48-1.7266-15.648-0.50391v11.422l-5.1367 0.003907c-1.2734 0-2.3047 1.0312-2.3047 2.3047 0 1.2695 1.0312 2.3047 2.3047 2.3047h86.016c1.2734 0 2.3047-1.0352 2.3047-2.3047 0-1.2734-1.0312-2.3047-2.3047-2.3047z"
      />
    </svg>
  );
}

/** Cake first in DOM; candle layers above (z-index) + shorter scale, anchored on cake top — see `globals.css`. */
export function SiteHeaderOrderLink({
  linkClassName = "",
  label = "Order your cake",
  ariaLabel,
}: SiteHeaderOrderLinkProps) {
  const { path } = useLocale();

  return (
    <Link
      href={path("/inquiry")}
      aria-label={ariaLabel ?? label}
      className={`${linkClassName} site-header__order-link`.trim()}
    >
      <span className="site-header__order-icon-wrap" aria-hidden>
        <span className="site-header__order-cake-stack">
          <OrderLinkCakeSvg className="site-header__order-cake" />
          <OrderLinkCandleSvg className="site-header__order-candle-body" />
          <OrderLinkCandleSvg className="site-header__order-candle-tip" />
        </span>
      </span>
      <span className="site-header__order-label">{label}</span>
      <img
        src="/icons/noun-arrow.svg"
        alt=""
        className="site-header__order-arrow hidden min-[901px]:block"
        width={51}
        height={59}
        decoding="async"
        draggable={false}
      />
    </Link>
  );
}
