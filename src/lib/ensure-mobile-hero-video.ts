import { ensureVideoPlays } from "@/lib/ensure-video-plays";

/** Matches compact hero layout in globals.css (phones + touch tablets). */
export function isMobileHeroViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 900px)").matches;
}

export function kickMobileHeroVideo(video: HTMLVideoElement): void {
  if (!video.paused && !video.ended) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  if (video.readyState === 0) {
    video.load();
  }

  const pending = video.play();
  if (pending && typeof pending.catch === "function") {
    pending.catch(() => {});
  }
}

/** Fire play attempts after layout paint — iOS often misses the first synchronous call. */
export function scheduleMobileHeroVideoKick(video: HTMLVideoElement): void {
  kickMobileHeroVideo(video);
  requestAnimationFrame(() => {
    kickMobileHeroVideo(video);
    requestAnimationFrame(() => kickMobileHeroVideo(video));
  });
}

/** iOS Safari hero autoplay — extra retries without changing desktop behaviour. */
export function ensureMobileHeroVideoPlays(video: HTMLVideoElement): () => void {
  const baseCleanup = ensureVideoPlays(video);
  const tryPlay = () => kickMobileHeroVideo(video);

  scheduleMobileHeroVideoKick(video);

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting && !document.hidden)) {
        tryPlay();
      }
    },
    { threshold: 0.01 },
  );
  io.observe(video);

  const onGesture = () => tryPlay();
  window.addEventListener("touchstart", onGesture, { passive: true });
  window.addEventListener("scroll", onGesture, { passive: true });

  const onPageShow = () => tryPlay();
  window.addEventListener("pageshow", onPageShow);

  const extraEvents = [
    "canplaythrough",
    "stalled",
    "waiting",
    "suspend",
  ] as const;
  for (const event of extraEvents) {
    video.addEventListener(event, tryPlay);
  }

  const timers = [100, 400, 1000, 2500, 5000].map((ms) =>
    window.setTimeout(tryPlay, ms),
  );

  const stopGestureRetries = () => {
    window.removeEventListener("touchstart", onGesture);
    window.removeEventListener("scroll", onGesture);
  };
  video.addEventListener("playing", stopGestureRetries, { once: true });

  return () => {
    baseCleanup();
    io.disconnect();
    stopGestureRetries();
    window.removeEventListener("pageshow", onPageShow);
    for (const timer of timers) window.clearTimeout(timer);
    for (const event of extraEvents) {
      video.removeEventListener(event, tryPlay);
    }
    video.removeEventListener("playing", stopGestureRetries);
  };
}
