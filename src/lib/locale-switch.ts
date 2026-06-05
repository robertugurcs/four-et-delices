const LOCALE_SWITCH_IN_MS = 360;

/** Soft crossfade while locale content swaps — no route balloons. */
export function beginLocaleSwitch() {
  document.documentElement.dataset.localeSwitch = "out";
}

export function completeLocaleSwitch() {
  const root = document.documentElement;
  if (!root.dataset.localeSwitch) return;

  root.dataset.localeSwitch = "in";
  window.setTimeout(() => {
    if (root.dataset.localeSwitch === "in") {
      root.removeAttribute("data-locale-switch");
    }
  }, LOCALE_SWITCH_IN_MS);
}
