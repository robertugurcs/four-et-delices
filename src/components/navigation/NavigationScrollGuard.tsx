"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import {
  beginRouteTransition,
  clearRouteTransition,
  resetScrollPosition,
} from "@/lib/route-transition";

function isInternalNavLink(anchor: HTMLAnchorElement, pathname: string) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === pathname && !url.hash) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Prevents the persistent layout footer from flashing at the top of the viewport
 * during client navigations when scroll position from the previous page lingers.
 */
export function NavigationScrollGuard() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname;
      resetScrollPosition();
    }

    clearRouteTransition();
  }, [pathname]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavLink(anchor, pathname)) return;

      beginRouteTransition();
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [pathname]);

  return null;
}
