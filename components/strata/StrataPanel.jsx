'use client';

import { useEffect, useId, useState } from 'react';
import { CONTROLS, CUSTOM_FINISH, FINISHES } from './config.js';

const digits = (step) => (step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0);
const swatch = (hex) =>
  `linear-gradient(135deg, color-mix(in srgb, ${hex} 50%, white), ${hex} 55%, color-mix(in srgb, ${hex} 65%, black))`;

/** The Adjust panel. Stateless apart from open/closed: values come in, changes go out. */
export default function StrataPanel({ params, onChange, onFinish, onReset }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  // open by default on wide screens only, decided after mount so server and client HTML match
  useEffect(() => { setOpen(window.innerWidth > 720); }, []);

  return (
    <div className="strata__tuner">
      <button type="button" aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen((o) => !o)}>
        Adjust
      </button>
      <div className="strata__panel" id={`${id}-panel`} hidden={!open}>
        {CONTROLS.map(({ group, items }) => (
          <div className="strata__group" key={group}>
            <p>{group}</p>
            {items.map(({ key, label, min, max, step, unit }) => (
              <div className="strata__row" key={key}>
                <label htmlFor={`${id}-${key}`}>
                  <span>{label}</span>
                  <output>{Number(params[key]).toFixed(digits(step))}{unit}</output>
                </label>
                <input
                  id={`${id}-${key}`} type="range" min={min} max={max} step={step}
                  value={params[key]} onChange={(e) => onChange(key, Number(e.target.value))}
                />
              </div>
            ))}
            {group === 'Loop' && (
              <label className="strata__check">
                <input type="checkbox" checked={params.drift} onChange={(e) => onChange('drift', e.target.checked)} />
                Play loop
              </label>
            )}
          </div>
        ))}
        <div className="strata__group">
          <p>Color</p>
          <div className="strata__swatches">
            {FINISHES.map((f) => (
              <button
                key={f.name} type="button" title={f.name} aria-label={f.name}
                aria-pressed={params.color === f.color} style={{ background: swatch(f.color) }}
                onClick={() => onFinish({ color: f.color, metal: f.metal, rough: f.rough })}
              />
            ))}
            <input
              type="color" value={params.color} title="Any color, as a metal" aria-label="Any color, as a metal"
              onChange={(e) => onFinish({ color: e.target.value, ...CUSTOM_FINISH })}
            />
          </div>
        </div>
        <div className="strata__actions">
          <button type="button" onClick={onReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}
