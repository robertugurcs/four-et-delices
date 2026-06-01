/** Robust muted inline autoplay — iOS Safari often ignores a single play() on mount. */
export function ensureVideoPlays(video: HTMLVideoElement): () => void {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  const tryPlay = () => {
    if (video.paused) {
      const pending = video.play();
      if (pending && typeof pending.catch === "function") {
        pending.catch(() => {});
      }
    }
  };

  tryPlay();

  const onReady = () => tryPlay();
  const events = ["loadedmetadata", "loadeddata", "canplay"] as const;
  for (const event of events) {
    video.addEventListener(event, onReady);
  }

  // iOS: retry when tab becomes visible (switching tabs / lock screen unlock)
  const onVisibility = () => {
    if (!document.hidden) tryPlay();
  };

  // iOS back/forward cache: when navigating back, the page is restored from bfcache
  // and the video needs to restart
  const onPageShow = (e: PageTransitionEvent) => {
    if (e.persisted) tryPlay();
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onPageShow);

  return () => {
    for (const event of events) {
      video.removeEventListener(event, onReady);
    }
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", onPageShow);
  };
}
