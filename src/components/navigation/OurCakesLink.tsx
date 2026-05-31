"use client";



import Link from "next/link";

import type { ComponentPropsWithoutRef, ReactNode } from "react";



import { useLocale } from "@/i18n/LocaleProvider";



type OurCakesLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {

  children: ReactNode;

};



/** Navigates to the dedicated Our Cakes gallery at /cakes. */

export function OurCakesLink({ children, ...props }: OurCakesLinkProps) {

  const { path } = useLocale();



  return (

    <Link href={path("/cakes")} {...props}>

      {children}

    </Link>

  );

}


