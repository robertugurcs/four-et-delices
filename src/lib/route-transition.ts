type AppRouter = {
  push: (href: string) => void;
};

export function resetScrollPosition() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Hide layout footer before route content swaps (prevents top flash). */
export function markRouteTransition() {
  document.documentElement.dataset.routeTransition = "true";
}

export function clearRouteTransition() {
  document.documentElement.removeAttribute("data-route-transition");
}

export function beginRouteTransition(options?: { scroll?: boolean }) {
  markRouteTransition();
  if (options?.scroll !== false) {
    resetScrollPosition();
  }
}

export function pushWithRouteTransition(router: AppRouter, href: string) {
  beginRouteTransition({ scroll: true });
  router.push(href);
}
