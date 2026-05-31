const HERO_INTRO_SEEN_KEY = "cake:hero-intro-seen";

/** Persist for the session — intro must not replay after the visitor has entered the site. */
export function markHeroIntroSeen() {
  try {
    sessionStorage.setItem(HERO_INTRO_SEEN_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
}

/** @deprecated alias — kept for existing call sites */
export function markSkipHeroIntro() {
  markHeroIntroSeen();
}

export function shouldSkipHeroIntro() {
  try {
    return sessionStorage.getItem(HERO_INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
