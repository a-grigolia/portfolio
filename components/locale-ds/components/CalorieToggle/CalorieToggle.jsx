'use client';

import { useState } from 'react';
import './CalorieToggle.css';

export default function CalorieToggle({
  value,
  defaultValue = 0,
  onChange,
  options = ['Regular', 'Low Calorie'],
  ...rest
}) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internal;

  const setActive = (idx) => {
    if (!isControlled) setInternal(idx);
    onChange?.(idx);
  };

  const toggle = () => setActive(active === 0 ? 1 : 0);

  return (
    <button
      type="button"
      className="calorie-toggle"
      onClick={toggle}
      aria-label="Toggle calorie mode"
      {...rest}
    >
      <div
        className="calorie-toggle-slider"
        style={{ transform: `translateX(${active * 100}%)` }}
      />
      {options.map((opt, i) => (
        <span
          key={opt}
          className={`calorie-toggle-option${active === i ? ' active' : ''}`}
        >
          {opt}
        </span>
      ))}
    </button>
  );
}
