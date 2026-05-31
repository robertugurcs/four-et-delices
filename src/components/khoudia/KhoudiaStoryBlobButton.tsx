import Link from "next/link";

type KhoudiaStoryBlobButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

/**
 * Soft morphing blob CTA — CSS adapted from `blob_slower.html`, colors aligned with
 * `--background` / espresso / plum accents (see `.meet-khoudia-story-btn` in globals.css).
 */
export function KhoudiaStoryBlobButton({
  href = "/meet-khoudia",
  label = "my story",
  className = "",
}: KhoudiaStoryBlobButtonProps) {
  const merged = ["meet-khoudia-story-btn", "font-serif", className]
    .filter(Boolean)
    .join(" ");
  return (
    <Link href={href} className={merged}>
      {label}
    </Link>
  );
}
