"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";



import { useLocale } from "@/i18n/LocaleProvider";

import { isHomePath } from "@/i18n/routing";

import { markSkipHeroIntro } from "@/lib/skip-hero-intro";



type HomeBrandLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {

  children: ReactNode;

};



/**

 * Brand / wordmark link — home without replaying the hero intro veil.

 * On home already: scroll to top instead of a full reload.

 */

export function HomeBrandLink({

  children,

  onClick,

  ...props

}: HomeBrandLinkProps) {

  const pathname = usePathname();

  const { path } = useLocale();



  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {

    markSkipHeroIntro();

    onClick?.(event);



    if (isHomePath(pathname)) {

      event.preventDefault();

      window.scrollTo({ top: 0, behavior: "smooth" });

    }

  };



  return (

    <Link href={path("/")} onClick={handleClick} {...props}>

      {children}

    </Link>

  );

}


