/**
 * Genie card landing (~0.83s on GSAP) — soft upper-register cocktail-jazz tink,
 * Cmaj7 arpeggio — light, airy, no “game sfx” aggression.
 */

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AC();
  }
  return sharedCtx;
}

function softKey(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  t: number,
  vol: number,
  decay = 0.9,
): void {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2;

  const g = ctx.createGain();
  const g2 = ctx.createGain();

  const end = Math.max(t + 0.023, t + decay);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.022);
  g.gain.exponentialRampToValueAtTime(0.0001, end);

  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.linearRampToValueAtTime(vol * 0.15, t + 0.022);
  g2.gain.exponentialRampToValueAtTime(0.0001, Math.max(t + 0.023, t + decay * 0.7));

  osc.connect(g); g.connect(dest);
  osc2.connect(g2); g2.connect(dest);

  const stopAt = t + decay + 0.1;
  osc.start(t); osc.stop(stopAt);
  osc2.start(t); osc2.stop(stopAt);
}

export async function playGenieArrivalPuff(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = getCtx();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") await ctx.resume();
  } catch {
    return;
  }

  try {
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.value = 0.22;

    const shelf = ctx.createBiquadFilter();
    shelf.type = "highshelf";
    shelf.frequency.value = 3000;
    shelf.gain.value = -3;

    master.connect(shelf);
    shelf.connect(ctx.destination);

    const phrase: { freq: number; t: number; vol: number; decay: number }[] = [
      { freq: 1046.5, t: 0.0, vol: 0.55, decay: 1.1 },
      { freq: 1318.5, t: 0.11, vol: 0.45, decay: 1.0 },
      { freq: 1567.9, t: 0.21, vol: 0.4, decay: 0.95 },
      { freq: 1975.5, t: 0.3, vol: 0.38, decay: 1.1 },
      { freq: 2637.0, t: 0.4, vol: 0.28, decay: 1.2 },
    ];
    phrase.forEach(({ freq, t, vol, decay }) =>
      softKey(ctx, master, freq, now + t, vol, decay),
    );

    const delay = ctx.createDelay(0.2);
    delay.delayTime.value = 0.11;
    const dryWet = ctx.createGain();
    dryWet.gain.value = 0.09;

    shelf.connect(delay);
    delay.connect(dryWet);
    dryWet.connect(ctx.destination);
  } catch {
    /* unsupported graph */
  }
}
