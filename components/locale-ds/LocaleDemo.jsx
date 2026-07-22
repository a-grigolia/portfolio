'use client';

import { useEffect, useRef, useState } from 'react';
import './styles/tokens.css';
import {
  IconMinus,
  IconPlus,
  IconTrash,
  IconSoldOut,
  IconCart,
} from './buttons/Button.jsx';
import './LocaleDemo.css';

const ASSETS = '/work/locale-3/demo';

// Regular / Light variants for the bulgogi bowl. The right-panel DV rings and
// the card macros both read from here so the toggle drives everything at once.
const VARIANTS = {
  regular: { calories: 841, protein: 45, carbs: 64, fat: 45, caloriesDV: 43, proteinDV: 33 },
  light: { calories: 662, protein: 42, carbs: 29, fat: 42, caloriesDV: 34, proteinDV: 30 },
};

const MEAL_GOAL = 4;

/* DV ring — same geometry as the Figma export (r24 / 5px stroke in a 53 viewBox).
 * Draws from 0 on mount, then eases to the new value whenever percent changes. */
function Ring({ percent, color }) {
  const R = 24;
  const C = 2 * Math.PI * R;
  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    let raf2;
    // Double rAF so the initial 0-state paints before the transition kicks in.
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setDrawn(percent));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [percent]);

  return (
    <span className="ld3-ring">
      <svg viewBox="0 0 53 53" fill="none">
        <circle cx="26.5" cy="26.5" r={R} stroke="rgba(0,0,0,0.05)" strokeWidth="5" />
        <circle
          className="ld3-ring-progress"
          cx="26.5"
          cy="26.5"
          r={R}
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - drawn / 100)}
          transform="rotate(-90 26.5 26.5)"
        />
      </svg>
      <span className="ld3-ring-label">
        <span className="ld3-ring-value">{percent}%</span>
        <span className="ld3-ring-unit">DV</span>
      </span>
    </span>
  );
}

/* Pill stepper — decrement swaps to a trash can at qty 1 and the increment
 * swaps to the "stop" glyph at max, matching the three states in the Figma. */
function Stepper({ initial, max = 8 }) {
  const [qty, setQty] = useState(initial);
  const atMax = qty >= max;

  return (
    <div className="ld3-stepper">
      <button
        type="button"
        className="ld3-stepper-btn"
        disabled={qty === 0}
        onClick={() => setQty((q) => Math.max(0, q - 1))}
        aria-label={qty <= 1 ? 'Remove' : 'Decrease quantity'}
      >
        {qty <= 1 ? <IconTrash /> : <IconMinus />}
      </button>
      <span className="ld3-stepper-count">{qty}</span>
      <button
        type="button"
        className={`ld3-stepper-btn${atMax ? ' is-max' : ''}`}
        onClick={() => !atMax && setQty((q) => q + 1)}
        aria-label={atMax ? 'Maximum reached' : 'Increase quantity'}
      >
        {atMax ? <IconSoldOut /> : <IconPlus />}
      </button>
    </div>
  );
}

/* Button that plays a spinner for a moment on every click. */
function LoaderButton({ className, disabled, onClick, children }) {
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = (e) => {
    if (loading) return;
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 1200);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      className={`${className}${loading ? ' is-loading' : ''}`}
      disabled={disabled}
      onClick={handleClick}
    >
      <span className="ld3-btn-label">{children}</span>
      <span className="ld3-loader" aria-hidden="true" />
    </button>
  );
}

function VariantToggle({ value, counts, onChange }) {
  const isLight = value === 'light';
  return (
    <div className="ld3-toggle">
      <span
        className="ld3-toggle-thumb"
        style={{ transform: `translateX(${isLight ? '100%' : '0%'})` }}
        aria-hidden="true"
      />
      {/* The count only shows on the inactive option — the active variant's
          quantity is already visible in the add-to-cart control below. */}
      <button
        type="button"
        className={`ld3-toggle-option${!isLight ? ' is-active' : ''}`}
        onClick={() => onChange('regular')}
      >
        {isLight && counts.regular > 0 && (
          <span className="ld3-toggle-count">{counts.regular}</span>
        )}
        Regular
      </button>
      <button
        type="button"
        className={`ld3-toggle-option${isLight ? ' is-active' : ''}`}
        onClick={() => onChange('light')}
      >
        {!isLight && counts.light > 0 && (
          <span className="ld3-toggle-count">{counts.light}</span>
        )}
        Light
      </button>
    </div>
  );
}

export default function LocaleDemo() {
  const [variant, setVariant] = useState('regular');
  // Regular and Light are separate products, each with its own quantity.
  const [quantities, setQuantities] = useState({ regular: 0, light: 0 });
  const [note, setNote] = useState('');
  const [thanks, setThanks] = useState(false);
  // Remount key so uncontrolled children (the pill steppers) reset too.
  const [resetKey, setResetKey] = useState(0);
  const thanksTimer = useRef(null);
  const noteTimer = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(thanksTimer.current);
      clearTimeout(noteTimer.current);
    },
    []
  );

  const handleSubmitNote = () => {
    const text = note.trim();
    if (!text) return;
    // No backend yet — stash submissions in localStorage (and the console)
    // so they can be inspected. Swap for a real endpoint when one exists.
    try {
      const key = 'locale-demo-submissions';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.push({ text, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prev));
      console.log('[locale-demo] submission:', text);
    } catch {
      /* storage unavailable — ignore */
    }
    // Clear once the button's loader finishes.
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(''), 1200);
  };

  const handleSave = () => {
    setThanks(true);
    // Reset the demo behind the overlay so it's fresh when the overlay clears.
    setVariant('regular');
    setQuantities({ regular: 0, light: 0 });
    setNote('');
    setResetKey((k) => k + 1);
    clearTimeout(thanksTimer.current);
    thanksTimer.current = setTimeout(() => setThanks(false), 3000);
  };

  const m = VARIANTS[variant];
  const cardQty = quantities[variant];
  const setCardQty = (next) =>
    setQuantities((prev) => ({
      ...prev,
      [variant]: Math.max(0, typeof next === 'function' ? next(prev[variant]) : next),
    }));

  const mealCount = quantities.regular + quantities.light;
  const fillPct = Math.min(mealCount / MEAL_GOAL, 1) * 100;
  const inCart = cardQty > 0;
  const cartFull = mealCount >= MEAL_GOAL;

  return (
    <div className="locale-ds">
      <div className="ld3-frame" key={resetKey}>
        {thanks && (
          <div className="ld3-thanks" role="status">
            <img
              className="ld3-thanks-jar"
              src="/work/locale-3/spinny-jar.gif"
              alt="Locale jar spinning"
            />
            <p className="ld3-thanks-text">Thanks for trying out the demo!</p>
          </div>
        )}
        {/* ── Meal card ── */}
        <div className="ld3-card">
          <div className="ld3-card-media">
            <img
              className="ld3-card-img"
              src={`${ASSETS}/${variant === 'light' ? 'bulgogi-bowl-light.png' : 'bulgogi-bowl.png'}`}
              alt="Grass-Fed Ground Beef Bulgogi Bowl"
            />
            <span className="ld3-badge-spicy">
              <img
                className="ld3-badge-chili"
                src={`${ASSETS}/icon-chili.svg`}
                alt=""
                aria-hidden="true"
              />
              Spicy
            </span>
          </div>

          <div className="ld3-card-meta">
            <p className="ld3-shelf">Eat within 6 days</p>
            <VariantToggle value={variant} counts={quantities} onChange={setVariant} />
          </div>

          <div className="ld3-card-titles">
            <p className="ld3-card-title">Grass-Fed Ground Beef Bulgogi Bowl</p>
            <p className="ld3-card-subtitle">
              With Bone Broth Brown Rice, Shiitake Mushrooms, Spinach, and Kimchi
            </p>
          </div>

          <div className="ld3-macros">
            <div className="ld3-macro">
              <p className="ld3-macro-value">{m.calories}</p>
              <p className="ld3-macro-label">Cal</p>
            </div>
            <div className="ld3-macro">
              <p className="ld3-macro-value">{m.protein}g</p>
              <p className="ld3-macro-label">Protein</p>
            </div>
            <div className="ld3-macro">
              <p className="ld3-macro-value">{m.carbs}g</p>
              <p className="ld3-macro-label">Carbs</p>
            </div>
            <div className="ld3-macro">
              <p className="ld3-macro-value">{m.fat}g</p>
              <p className="ld3-macro-label">Fat</p>
            </div>
          </div>

          {/* Add Meal morphs into the design-system qty control once added */}
          <div className="ld3-add-wrap">
            <button
              type="button"
              className={`ld3-add-btn${inCart ? ' is-hidden' : ''}`}
              onClick={() => setCardQty(1)}
            >
              Add Meal
            </button>
            <div className={`ld3-add-qty${inCart ? ' is-visible' : ''}`}>
              <button
                type="button"
                className="ld3-add-qty-btn"
                onClick={() => setCardQty((q) => Math.max(0, q - 1))}
                aria-label="Decrease quantity"
              >
                <IconMinus />
              </button>
              <span className="ld3-add-qty-val">{cardQty}</span>
              <button
                type="button"
                className="ld3-add-qty-btn"
                onClick={() => setCardQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <IconPlus />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="ld3-panel">
          <div className="ld3-btn-row">
            <LoaderButton className="ld3-btn ld3-btn-primary">Edit order</LoaderButton>
            <LoaderButton className="ld3-btn ld3-btn-text">Skip delivery</LoaderButton>
          </div>

          <div className="ld3-stepper-row">
            <Stepper initial={1} />
            <Stepper initial={4} />
            <Stepper initial={8} />
          </div>

          <button
            type="button"
            className={`ld3-progress${cartFull ? ' is-full' : ''}`}
            onClick={() => cartFull && handleSave()}
            tabIndex={cartFull ? 0 : -1}
          >
            {cartFull ? (
              <span className="ld3-progress-save">Save {mealCount} meals</span>
            ) : (
              <>
                <span className="ld3-progress-top">
                  <span className="ld3-progress-cart">
                    <IconCart size={24} />
                  </span>
                  <span className="ld3-progress-label">
                    {mealCount}/{MEAL_GOAL} meals
                  </span>
                </span>
                <span className="ld3-progress-track">
                  <span className="ld3-progress-fill" style={{ width: `${fillPct}%` }} />
                </span>
              </>
            )}
          </button>

          <div className="ld3-stat">
            <p className="ld3-stat-label">Calories</p>
            <div className="ld3-stat-right">
              <p className="ld3-stat-value">{m.calories}cal</p>
              <Ring percent={m.caloriesDV} color="#5DA5D5" />
            </div>
          </div>

          <div className="ld3-stat">
            <p className="ld3-stat-label">Protein</p>
            <div className="ld3-stat-right">
              <p className="ld3-stat-value">{m.protein}g</p>
              <Ring percent={m.proteinDV} color="#FF7F66" />
            </div>
          </div>

          <textarea
            className="ld3-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What type of meals would you like us to add?"
            aria-label="What type of meals would you like us to add?"
          />

          <LoaderButton
            className="ld3-btn ld3-btn-submit"
            disabled={!note.trim()}
            onClick={handleSubmitNote}
          >
            Submit
          </LoaderButton>
        </div>
      </div>
    </div>
  );
}
