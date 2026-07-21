"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/app/theme-provider";

const CONFIG = {
  rows: 6,
  colsDesktop: 18, // ≥ breakpoint
  colsMobile: 12, // < breakpoint
  breakpoint: 1080,
  size: 28, // base px per SVG (unscaled)
  gap: 14, // base px between cells (unscaled)
  hoverRadiusCells: 3.0,
  baseDim: 0.33,
  hoverBaseDim: 0.18,
  glow: true,
  twinkleRate: 0.04,
  twinkleDurMin: 1000,
  twinkleDurMax: 2000,
  tickMin: 400,
  tickMax: 800,
};

const rand = (a, b) => a + Math.random() * (b - a);
const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export default function PlusGrid() {
  const rootRef = useRef(null);
  const cellsRef = useRef([]);
  const { theme } = useTheme();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Collect cells rendered by React (row-major, colsDesktop per row)
    const wraps = root.querySelectorAll(".pg-cell");
    const cells = [];
    let idx = 0;
    for (let r = 0; r < CONFIG.rows; r++) {
      for (let c = 0; c < CONFIG.colsDesktop; c++) {
        cells.push({
          wrap: wraps[idx],
          el: wraps[idx].firstElementChild,
          r,
          c,
          cx: 0,
          cy: 0,
          busy: false,
        });
        idx++;
      }
    }
    cellsRef.current = cells;

    const S = { size: CONFIG.size, gap: CONFIG.gap, pitchX: 0, pitchY: 0, rPx: 0, rSq: 0 };
    let currentCols = CONFIG.colsDesktop;
    let hovering = false;
    let twTimer = null;
    const timeouts = new Set();

    const activeCells = () => cells.filter((cell) => cell.c < currentCols);

    function layout() {
      const targetCols =
        window.innerWidth >= CONFIG.breakpoint
          ? CONFIG.colsDesktop
          : CONFIG.colsMobile;

      if (targetCols !== currentCols) {
        currentCols = targetCols;
        cells.forEach((cell) => {
          cell.wrap.style.display = cell.c < currentCols ? "grid" : "none";
        });
      }

      const avail = root.clientWidth || root.getBoundingClientRect().width;
      const baseWidth =
        currentCols * CONFIG.size + (currentCols - 1) * CONFIG.gap;
      // scale down when the container is smaller; cap at 1 (no upscale)
      const scale = Math.max(0.5, Math.min(1, avail / baseWidth));

      S.size = Math.round(CONFIG.size * scale);
      S.gap = Math.round(CONFIG.gap * scale);
      S.pitchX = S.size + S.gap;
      S.pitchY = S.size + S.gap;

      root.style.gridTemplateColumns = `repeat(${currentCols}, ${S.size}px)`;
      root.style.gridAutoRows = `${S.size}px`;
      root.style.gap = `${S.gap}px`;

      const active = activeCells();
      let i = 0;
      for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < currentCols; c++) {
          const item = active[i++];
          item.wrap.style.width = `${S.size}px`;
          item.wrap.style.height = `${S.size}px`;
          item.cx = c * S.pitchX + S.size / 2;
          item.cy = r * S.pitchY + S.size / 2;
        }
      }

      S.rPx = S.pitchX * CONFIG.hoverRadiusCells;
      S.rSq = S.rPx * S.rPx;
    }

    function glowColors() {
      const cs = getComputedStyle(root);
      return {
        g1: cs.getPropertyValue("--pg-glow1").trim() || "rgba(255,255,255,.45)",
        g2: cs.getPropertyValue("--pg-glow2").trim() || "rgba(255,255,255,.18)",
      };
    }

    function brightNow(cell, ms) {
      if (cell.busy) return;
      cell.busy = true;
      cell.el.style.opacity = 1;
      if (CONFIG.glow) {
        const { g1, g2 } = glowColors();
        cell.el.style.filter = `drop-shadow(0 0 10px ${g1}) drop-shadow(0 0 16px ${g2})`;
        cell.el.style.transform = "scale(1.04)";
      }
      const t = setTimeout(() => {
        if (!hovering) cell.el.style.opacity = CONFIG.baseDim;
        cell.el.style.filter = "";
        cell.el.style.transform = "";
        cell.busy = false;
        timeouts.delete(t);
      }, ms);
      timeouts.add(t);
    }

    function twinkleTick() {
      const active = activeCells();
      const n = Math.max(1, Math.round(active.length * CONFIG.twinkleRate));
      for (let i = 0; i < n; i++) {
        brightNow(
          active[Math.floor(Math.random() * active.length)],
          rand(CONFIG.twinkleDurMin, CONFIG.twinkleDurMax)
        );
      }
      twTimer = setTimeout(twinkleTick, rand(CONFIG.tickMin, CONFIG.tickMax));
    }

    function startTwinkle() {
      if (reduceMotion) return;
      if (!twTimer) twTimer = setTimeout(twinkleTick, 200);
    }

    function stopTwinkle() {
      if (twTimer) {
        clearTimeout(twTimer);
        twTimer = null;
      }
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
      cells.forEach((c) => {
        c.busy = false;
        c.el.style.filter = "";
        c.el.style.transform = "";
        c.el.style.opacity = hovering ? CONFIG.hoverBaseDim : CONFIG.baseDim;
      });
    }

    function updateHalo(e) {
      const rect = root.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { g1, g2 } = glowColors();
      const active = activeCells();

      for (let i = 0; i < active.length; i++) {
        const c = active[i];
        const dx = px - c.cx;
        const dy = py - c.cy;
        const d2 = dx * dx + dy * dy;

        if (d2 <= S.rSq) {
          const d = Math.sqrt(d2);
          const eased = smooth01(1 - d / S.rPx);
          const target =
            CONFIG.hoverBaseDim + eased * (1 - CONFIG.hoverBaseDim);
          const current = parseFloat(c.el.style.opacity) || CONFIG.baseDim;
          c.el.style.opacity = Math.max(current, target);
          if (CONFIG.glow) {
            c.el.style.filter = `drop-shadow(0 0 ${10 * eased}px ${g1}) drop-shadow(0 0 ${16 * eased}px ${g2})`;
            c.el.style.transform = `scale(${1 + 0.04 * eased})`;
          }
        } else if (!c.busy) {
          c.el.style.opacity = CONFIG.hoverBaseDim;
          if (CONFIG.glow) {
            c.el.style.filter = "";
            c.el.style.transform = "";
          }
        }
      }
    }

    const onPointerEnter = (e) => {
      hovering = true;
      stopTwinkle();
      cells.forEach((c) => {
        if (!c.busy) c.el.style.opacity = CONFIG.hoverBaseDim;
      });
      updateHalo(e);
    };

    const onPointerMove = (e) => {
      if (hovering) updateHalo(e);
    };

    const onPointerLeave = () => {
      hovering = false;
      cells.forEach((c) => {
        c.el.style.opacity = CONFIG.baseDim;
        c.el.style.filter = "";
        c.el.style.transform = "";
      });
      startTwinkle();
    };

    root.addEventListener("pointerenter", onPointerEnter, { passive: true });
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);

    // Re-layout on container resize (covers most window resizes too)
    let rAF = null;
    const scheduleLayout = () => {
      if (rAF) return;
      rAF = requestAnimationFrame(() => {
        rAF = null;
        layout();
      });
    };
    const ro = new ResizeObserver(scheduleLayout);
    ro.observe(root);
    // Column count depends on viewport width, which can cross the breakpoint
    // without the container width changing.
    window.addEventListener("resize", scheduleLayout);

    layout();
    startTwinkle();

    return () => {
      root.removeEventListener("pointerenter", onPointerEnter);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", scheduleLayout);
      ro.disconnect();
      if (rAF) cancelAnimationFrame(rAF);
      if (twTimer) clearTimeout(twTimer);
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
    };
  }, []);

  // When the theme flips, clear inline glow filters so the new colors apply.
  useEffect(() => {
    cellsRef.current.forEach((c) => {
      if (!c.busy) c.el.style.filter = "";
    });
  }, [theme]);

  const items = [];
  for (let r = 0; r < CONFIG.rows; r++) {
    for (let c = 0; c < CONFIG.colsDesktop; c++) {
      items.push(
        <div key={`${r}-${c}`} className="pg-cell">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 35 35"
            fill="none"
            aria-hidden="true"
            style={{ opacity: CONFIG.baseDim }}
          >
            <path d="M35.0001 14.5714H20.4286V0H15.2858V14.5714H0.714355V19.7143H15.2858V34.2857H20.4286V19.7143H35.0001V14.5714Z" />
          </svg>
        </div>
      );
    }
  }

  return (
    <div
      ref={rootRef}
      className="plus-grid"
      style={{
        gridTemplateColumns: `repeat(${CONFIG.colsDesktop}, ${CONFIG.size}px)`,
        gridAutoRows: `${CONFIG.size}px`,
        gap: `${CONFIG.gap}px`,
      }}
      aria-hidden="true"
    >
      {items}
    </div>
  );
}
