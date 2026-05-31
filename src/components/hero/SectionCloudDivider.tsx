"use client";

interface SectionCloudDividerProps {
  fill?: string;
  direction?: "down" | "up";
  className?: string;
}

export function SectionCloudDivider({
  fill = "#7d1828",
  direction = "down",
  className = "",
}: SectionCloudDividerProps) {
  const flipped = direction === "up";

  return (
    <div
      className={`section-cloud-divider ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 230"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
        className={`section-cloud-divider__svg ${
          flipped ? "section-cloud-divider__svg--up" : ""
        }`}
      >
        <path
          d="
            M0 0
            H1440
            V78

            C1418 96 1390 99 1362 82
            C1350 134 1300 154 1252 126
            C1235 177 1168 184 1138 139
            C1104 166 1050 151 1043 104

            C1012 143 946 138 930 85
            C902 126 840 129 814 84
            C779 145 692 142 664 77

            C625 132 547 124 528 63
            C491 109 421 99 409 40
            C372 93 302 96 275 47

            C245 107 160 113 125 58
            C82 88 34 85 0 54

            Z
          "
          fill={fill}
        />
      </svg>
    </div>
  );
}
