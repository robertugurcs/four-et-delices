import Link from "next/link";

type BackBarProps = {
  href: string;
  label: string;
};

export function BackBar({ href, label }: BackBarProps) {
  return (
    <Link href={href} className="our-cakes-back">
      <span aria-hidden>←</span>
      <span>{label}</span>
    </Link>
  );
}
