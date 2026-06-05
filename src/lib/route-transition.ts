type AppRouter = {
  push: (href: string) => void;
};

export type RouteTransitionMood =
  | "kids"
  | "weddings"
  | "birthdays"
  | "corporate"
  | "default";

type RouteTransitionOptions = {
  scroll?: boolean;
  mood?: RouteTransitionMood;
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
  document.documentElement.removeAttribute("data-route-mood");
}

export function beginRouteTransition(options?: RouteTransitionOptions) {
  markRouteTransition();
  document.documentElement.dataset.routeMood = options?.mood ?? "default";

  if (options?.scroll !== false) {
    resetScrollPosition();
  }
}

export function pushWithRouteTransition(
  router: AppRouter,
  href: string,
  options?: RouteTransitionOptions,
) {
  beginRouteTransition(options);
  router.push(href);
}
