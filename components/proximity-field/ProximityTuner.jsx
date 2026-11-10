'use client';

/**
 * ProximityTuner
 * The "Tune" panel: sliders, toggles, reset view and copy settings.
 * Controlled component: pass the current settings and an onChange that receives the next settings.
 * This is the piece to replace with your own Figma slider design.
 */

import { useEffect, useRef, useState } from 'react';
import styles from './proximity.module.css';

const deg = (v) => `${Math.round((v * 180) / Math.PI)}°`;

export const SLIDERS = [
  { key: 'height', label: 'Height', min: 0.1, max: 10, step: 0.1, fmt: (v) => v.toFixed(1) },
  { key: 'tilt', label: 'Lean', min: 0, max: 1.2, step: 0.01, fmt: deg },
  { key: 'twist', label: 'Twist', min: 0, max: 2.5, step: 0.01, fmt: deg },
  { key: 'radius', label: 'Radius', min: 2, max: 14, step: 0.1, fmt: (v) => v.toFixed(1) },
  { key: 'rise', label: 'Rise speed', min: 0.02, max: 0.4, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: 'decay', label: 'Ease back', min: 0.005, max: 0.12, step: 0.005, fmt: (v) => v.toFixed(3) },
  { key: 'jitter', label: 'Jitter', min: 0, max: 1, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: 'gap', label: 'Gap', min: 0.05, max: 0.8, step: 0.01, fmt: (v) => v.toFixed(2) },
];

export default function ProximityTuner({ settings, onChange, onReset }) {
  const detailsRef = useRef(null);
  const [copyLabel, setCopyLabel] = useState('Copy settings');
  const [copyText, setCopyText] = useState(null);

  const set = (key, value) => onChange({ ...settings, [key]: value });

  // start collapsed on narrow screens
  useEffect(() => {
    if (window.innerWidth < 640 && detailsRef.current) detailsRef.current.open = false;
  }, []);

  function copySettings() {
    const keys = [...SLIDERS.map((s) => s.key), 'tint', 'accent', 'drift', 'autoRotate'];
    const snapshot = {};
    for (const k of keys) {
      const v = settings[k];
      snapshot[k] = typeof v === 'number' ? +v.toFixed(3) : v;
    }
    const text = JSON.stringify(snapshot, null, 2);
    const fallback = () => {
      setCopyText(text);
      setCopyLabel('Select & copy');
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopyLabel('Copied');
        setTimeout(() => setCopyLabel('Copy settings'), 1400);
      }, fallback);
    } else {
      fallback();
    }
  }

  return (
    <details ref={detailsRef} className={styles.panel} open>
      <summary className={styles.summary}>
        Tune <span className={styles.chev} aria-hidden="true" />
      </summary>

      <div className={styles.controls}>
        <div className={styles.group}>
          {SLIDERS.map((s) => (
            <div key={s.key} className={styles.ctl}>
              <label htmlFor={`pf-${s.key}`}>
                <span>{s.label}</span>
                <output>{s.fmt(settings[s.key])}</output>
              </label>
              <input
                id={`pf-${s.key}`}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={settings[s.key]}
                onChange={(e) => set(s.key, parseFloat(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className={styles.group}>
          <label className={styles.toggle} htmlFor="pf-tint">
            <span>Accent on peaks</span>
            <span className={styles.end}>
              <input
                type="color"
                aria-label="Accent color"
                value={settings.accent}
                onChange={(e) => set('accent', e.target.value)}
              />
              <input
                id="pf-tint"
                type="checkbox"
                checked={settings.tint}
                onChange={(e) => set('tint', e.target.checked)}
              />
            </span>
          </label>
          <label className={styles.toggle} htmlFor="pf-drift">
            <span>Idle drift</span>
            <input
              id="pf-drift"
              type="checkbox"
              checked={settings.drift}
              onChange={(e) => set('drift', e.target.checked)}
            />
          </label>
          <label className={styles.toggle} htmlFor="pf-auto">
            <span>Auto-rotate</span>
            <input
              id="pf-auto"
              type="checkbox"
              checked={settings.autoRotate}
              onChange={(e) => set('autoRotate', e.target.checked)}
            />
          </label>
        </div>

        <div className={styles.group}>
          <div className={styles.btns}>
            <button type="button" onClick={onReset}>Reset view</button>
            <button type="button" onClick={copySettings}>{copyLabel}</button>
          </div>
          {copyText && (
            <textarea
              className={styles.copyOut}
              readOnly
              value={copyText}
              aria-label="Settings JSON"
              onFocus={(e) => e.target.select()}
              autoFocus
            />
          )}
        </div>
      </div>
    </details>
  );
}
