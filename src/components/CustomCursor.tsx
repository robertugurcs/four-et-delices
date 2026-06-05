"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

/** Desktop-style pointer: fine control + real hover */
const CURSOR_MQ = "(pointer: fine) and (hover: hover)";

/* ── Knife cursor config (unchanged) ─────────────────────────────────── */
const VIEWBOX   = 512.8;
const KNIFE_PX  = 32;
const TIP_UX    = 506.8;
const TIP_UY    = 14.319;
const TIP_X     = (TIP_UX / VIEWBOX) * KNIFE_PX;
const TIP_Y     = (TIP_UY / VIEWBOX) * KNIFE_PX;
const KNIFE_PATH_D =
  "M506.8,14.319c-6.4-6.4-17.6-11.6-36-0.8c-91.6,55.2-225.6,180-227.2,181.2c-0.4,0.4-0.4,0.4-0.4,0.8l-0.4,0.4c0,0,0,0.4,0,0.8c0,0.4,0,0.4,0,0.8v44L9.2,452.719c-6,6-9.2,13.6-9.2,22c0,8.4,3.2,16,8.8,22c6.4,6,14.4,8.8,22,8.8c8,0,16-3.2,22-9.2l454-453.6C514.8,34.719,514.8,21.919,506.8,14.319z";

/* ── Finger-snap cursor config ────────────────────────────────────────── */
const SNAP_PX = 58;
/** Finger snap graphic (Noun Project). Hotspot tuned in CSS ~54% / 16%. */
const SNAP_SRC = "/assets/category-wish/noun-finger-snapping-5460465.svg";

const CLICK_MS = 150;
const INTERACTIVE_FOR_HOVER =
  'button, a[href], [role="button"], input[type="submit"], input[type="button"], input[type="reset"], summary';

type CursorUi = {
  mode: "knife" | "snap";
  grow: boolean;
  knifeClick: boolean;
};

export function CustomCursor() {
  const rootRef       = useRef<HTMLDivElement>(null);
  const innerRef      = useRef<HTMLDivElement>(null);
  const svgRef        = useRef<SVGSVGElement>(null);
  const snapImgRef    = useRef<HTMLImageElement>(null);
  const hotspotRef    = useRef({ hx: TIP_X, hy: TIP_Y });
  const clickAnimRef  = useRef(0);
  const targetRef     = useRef({ x: 0, y: 0 });
  const syncedRef     = useRef(false);
  const frameRef      = useRef(0);
  const iframeRelayRef = useRef(false);
  const zoneRef       = useRef<"knife" | "snap">("knife");
  const cursorUiRef   = useRef<CursorUi>({
    mode: "knife",
    grow: false,
    knifeClick: false,
  });
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const [cursorUi, setCursorUi] = useState<CursorUi>({
    mode: "knife",
    grow: false,
    knifeClick: false,
  });

  const measureKnifeHotspot = useCallback(() => {
    const root = rootRef.current;
    const svg  = svgRef.current;
    if (!root || !svg) return;
    const pt = svg.createSVGPoint();
    pt.x = TIP_UX;
    pt.y = TIP_UY;
    const m = svg.getScreenCTM();
    if (!m) return;
    const scr = pt.matrixTransform(m);
    const rr  = root.getBoundingClientRect();
    hotspotRef.current = { hx: scr.x - rr.left, hy: scr.y - rr.top };
  }, []);

  /** Snap hotspot: fingertip area (upper-center of the snap image) */
  const measureSnapHotspot = useCallback(() => {
    const root = rootRef.current;
    const img  = snapImgRef.current;
    if (!root || !img) return;
    const ir = img.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    if (ir.width < 2 || ir.height < 2) {
      hotspotRef.current = { hx: SNAP_PX * 0.54, hy: SNAP_PX * 0.16 };
      return;
    }
    hotspotRef.current = {
      hx: ir.left + ir.width  * 0.54 - rr.left,
      hy: ir.top  + ir.height * 0.16 - rr.top,
    };
  }, []);

  const paintAtTarget = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const { x, y } = targetRef.current;
    const { hx, hy } = hotspotRef.current;
    el.style.transform = `translate3d(${x - hx}px, ${y - hy}px, 0)`;
  }, []);

  const cancelFrame = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);

  const schedulePaint = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      paintAtTarget();
    });
  }, [paintAtTarget]);

  const setPointer = useCallback(
    (x: number, y: number) => {
      targetRef.current = { x, y };
      syncedRef.current = true;
      schedulePaint();
    },
    [schedulePaint],
  );

  const resolveHover = useCallback((hit: Element | null) => {
    const inWish = !!hit?.closest(".category-wish-section");
    const inTestimonial = !!hit?.closest(".testimonial-section");
    zoneRef.current = inTestimonial ? "knife" : inWish ? "snap" : "knife";
    const mode = zoneRef.current;
    const grow =
      !!hit?.closest(INTERACTIVE_FOR_HOVER) &&
      !hit?.closest("[data-no-cursor-grow]");

    const prev = cursorUiRef.current;
    if (prev.mode === mode && prev.grow === grow) return;

    const next = { ...prev, mode, grow };
    cursorUiRef.current = next;
    setCursorUi(next);
  }, []);

  const refreshHoverAtPointer = useCallback(() => {
    if (typeof document === "undefined") return;
    const { x, y } = targetRef.current;
    resolveHover(document.elementFromPoint(x, y));
  }, [resolveHover]);

  useLayoutEffect(() => {
    cursorUiRef.current = cursorUi;
  }, [cursorUi]);

  useLayoutEffect(() => {
    if (!active) return;
    const schedule = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cursorUi.mode === "snap") measureSnapHotspot();
          else measureKnifeHotspot();
          paintAtTarget();
        });
      });
    };
    schedule();
    window.addEventListener("resize", schedule);
    return () => window.removeEventListener("resize", schedule);
  }, [
    active,
    cursorUi.mode,
    measureKnifeHotspot,
    measureSnapHotspot,
    paintAtTarget,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(CURSOR_MQ);
    const syncActive = () => setActive(mq.matches);
    syncActive();
    mq.addEventListener("change", syncActive);
    return () => mq.removeEventListener("change", syncActive);
  }, []);

  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.setAttribute("data-custom-cursor", "true");

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (iframeRelayRef.current) return;

      setPointer(e.clientX, e.clientY);
      resolveHover(e.target as Element | null);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      setCursorUi((prev) => {
        window.clearTimeout(clickAnimRef.current);
        if (prev.mode === "snap") {
          return prev;
        }
        clickAnimRef.current = window.setTimeout(
          () => setCursorUi((p) => ({ ...p, knifeClick: false })),
          CLICK_MS,
        );
        return { ...prev, knifeClick: true };
      });
    };

    const onScroll = () => {
      if (iframeRelayRef.current) return;
      refreshHoverAtPointer();
      schedulePaint();
    };

    document.addEventListener("pointermove", onPointerMove, {
      passive: true,
      capture: true,
    });
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      html.removeAttribute("data-custom-cursor");
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
      window.clearTimeout(clickAnimRef.current);
      cancelFrame();
      syncedRef.current = false;
      iframeRelayRef.current = false;
    };
  }, [
    active,
    cancelFrame,
    refreshHoverAtPointer,
    resolveHover,
    schedulePaint,
    setPointer,
  ]);

  /* Native fullscreen only paints the target subtree — portal cursor inside it. */
  useEffect(() => {
    if (!active || !mounted) return;

    const syncPortalHost = () => {
      setPortalHost(document.fullscreenElement as HTMLElement | null);
      requestAnimationFrame(() => {
        paintAtTarget();
        refreshHoverAtPointer();
      });
    };

    document.addEventListener("fullscreenchange", syncPortalHost);
    syncPortalHost();

    return () => {
      document.removeEventListener("fullscreenchange", syncPortalHost);
      setPortalHost(null);
    };
  }, [active, mounted, paintAtTarget, refreshHoverAtPointer]);

  /* Sweet Catch iframe relay — position snaps 1:1, no trailing lerp. */
  useEffect(() => {
    if (!active) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || typeof d !== "object") return;

      if (d.type === "sweet-catch-pointer") {
        iframeRelayRef.current = true;
        const nx = typeof d.vx === "number" ? d.vx : targetRef.current.x;
        const ny = typeof d.vy === "number" ? d.vy : targetRef.current.y;
        setPointer(nx, ny);
        /* Skip grow inside iframe — hover scale remeasures hotspot and jumps. */
        return;
      }

      if (d.type === "sweet-catch-pointer-leave") {
        iframeRelayRef.current = false;

        if (typeof d.vx === "number" && typeof d.vy === "number") {
          setPointer(d.vx, d.vy);
        }

        refreshHoverAtPointer();
        setCursorUi((p) => {
          if (p.mode === "knife" && !p.grow) return p;
          const next: CursorUi = { ...p, mode: "knife", grow: false };
          cursorUiRef.current = next;
          return next;
        });
        return;
      }

      if (d.type === "sweet-catch-click") {
        window.clearTimeout(clickAnimRef.current);
        setCursorUi((p) => ({ ...p, knifeClick: true }));
        clickAnimRef.current = window.setTimeout(
          () => setCursorUi((p) => ({ ...p, knifeClick: false })),
          CLICK_MS,
        );
      }
    };

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [active, refreshHoverAtPointer, setPointer]);

  if (!active || !mounted) return null;

  const innerClassName =
    cursorUi.mode === "knife"
      ? [
          "custom-knife-cursor-inner",
          cursorUi.knifeClick ? "custom-knife-cursor-inner--click" : "",
          !cursorUi.knifeClick && cursorUi.grow
            ? "custom-knife-cursor-inner--hover"
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      : "custom-snap-cursor-inner";

  return createPortal(
    <div
      ref={rootRef}
      className="custom-cursor pointer-events-none fixed left-0 top-0 z-[10150] overflow-visible will-change-transform"
      style={{ transform: "translate3d(0px,0px,0)" }}
      aria-hidden
    >
      <div ref={innerRef} className={innerClassName}>
        {cursorUi.mode === "knife" ? (
          <svg
            ref={svgRef}
            width={KNIFE_PX}
            height={KNIFE_PX}
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            xmlns="http://www.w3.org/2000/svg"
            className="custom-knife-cursor-svg block overflow-visible"
            fill="currentColor"
          >
            <path d={KNIFE_PATH_D} />
          </svg>
        ) : (
          <img
            ref={snapImgRef}
            key="snap"
            src={SNAP_SRC}
            width={SNAP_PX}
            height={SNAP_PX}
            alt=""
            draggable={false}
            className="custom-snap-cursor-img block"
            style={{ width: SNAP_PX, height: SNAP_PX }}
            onLoad={() => {
              measureSnapHotspot();
              paintAtTarget();
            }}
          />
        )}
      </div>
    </div>,
    portalHost ?? document.body,
  );
}
