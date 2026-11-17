'use client';

import { useId, useState } from 'react';
import { CONTROLS, CUSTOM_FINISH, FINISHES } from './config.js';

const SLIDERS = CONTROLS.flatMap((g) => g.items);
const digits = (step) => (step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0);
const swatch = (hex) =>
  `linear-gradient(135deg, color-mix(in srgb, ${hex} 50%, white), ${hex} 55%, color-mix(in srgb, ${hex} 65%, black))`;

/** The Adjust panel. Stateless apart from open/closed: values come in, changes go out. */
export default function StrataPanel({ params, onChange, onFinish, onReset }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className="strata__tuner">
      <button
        type="button" className="strata__pill" data-glass
        aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen((o) => !o)}
      >
        Adjust
        <span className="strata__sign" aria-hidden="true" />
      </button>
      <div className="strata__panel" id={`${id}-panel`} data-glass hidden={!open}>
        <div className="strata__body">
          {SLIDERS.map(({ key, label, min, max, step, unit }) => (
            <div className="strata__row" key={key}>
              <label className="strata__line" htmlFor={`${id}-${key}`}>
                <span>{label}</span>
                <output>{Number(params[key]).toFixed(digits(step))}{unit}</output>
              </label>
              <input
                id={`${id}-${key}`} type="range" min={min} max={max} step={step}
                value={params[key]} onChange={(e) => onChange(key, Number(e.target.value))}
              />
            </div>
          ))}
          <div className="strata__row">
            <label className="strata__line" htmlFor={`${id}-drift`}>
              <span>Play loop</span>
              <input
                id={`${id}-drift`} type="checkbox"
                checked={params.drift} onChange={(e) => onChange('drift', e.target.checked)}
              />
            </label>
          </div>
          <div className="strata__row strata__row--color">
            <div className="strata__line">
              <span>Color</span>
              <input
                type="color" value={params.color} title="Any color, as a metal" aria-label="Any color, as a metal"
                onChange={(e) => onFinish({ color: e.target.value, ...CUSTOM_FINISH })}
              />
            </div>
            <div className="strata__swatches">
              {FINISHES.map((f) => (
                <button
                  key={f.name} type="button" title={f.name} aria-label={f.name}
                  aria-pressed={params.color === f.color} style={{ background: swatch(f.color) }}
                  onClick={() => onFinish({ color: f.color, metal: f.metal, rough: f.rough })}
                />
              ))}
            </div>
          </div>
          <div className="strata__row">
            <button type="button" className="strata__reset" onClick={onReset}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
