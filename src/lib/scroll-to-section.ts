export const OUR_CAKES_SECTION_ID = "cakes";

export function scrollToSection(
  id: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior, block: "start" });
  return true;
}

export function scrollToOurCakesSection(
  behavior: ScrollBehavior = "smooth",
): boolean {
  return scrollToSection(OUR_CAKES_SECTION_ID, behavior);
}

/** Wait for hero intro handoff before scrolling to a home hash target. */
export function scrollToHomeHashWhenReady(id: string) {
  const run = () => scrollToSection(id, "auto");

  if (document.documentElement.dataset.heroIntro === "done") {
    window.requestAnimationFrame(run);
    return;
  }

  const obs = new MutationObserver(() => {
    if (document.documentElement.dataset.heroIntro !== "done") return;
    obs.disconnect();
    window.requestAnimationFrame(run);
  });
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-hero-intro"],
  });
}
