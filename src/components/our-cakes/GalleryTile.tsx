import Image from "next/image";
import Link from "next/link";

type GalleryTileProps = {
  href: string;
  imageSrc: string;
  title: string;
  subtitle?: string;
  priority?: boolean;
};

export function GalleryTile({
  href,
  imageSrc,
  title,
  subtitle,
  priority = false,
}: GalleryTileProps) {
  return (
    <Link href={href} className="our-cakes-tile">
      <span className="our-cakes-tile__media">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="our-cakes-tile__img"
          sizes="(max-width: 560px) 100vw, 50vw"
          quality={92}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </span>
      <span className="our-cakes-tile__caption">
        <span className="our-cakes-tile__title">{title}</span>
        {subtitle ? (
          <span className="our-cakes-tile__sub">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
