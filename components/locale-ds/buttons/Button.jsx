'use client';

import { useState, useCallback, useRef } from 'react';
import './Button.css';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  cart: 'btn-cart',
  checkout: 'btn-checkout',
};

export default function Button({
  variant = 'primary',
  className: externalClass,
  children,
  ...rest
}) {
  const className = ['btn', VARIANT_CLASS[variant], externalClass].filter(Boolean).join(' ');

  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
}

export function CartButton({ count = 0, onClick, ...rest }) {
  return (
    <button className="btn btn-cart" onClick={onClick} {...rest}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4.67429C4.89753 6 5.09372 6.14799 5.15505 6.36264L7.31203 13.9121L8.13069 16.7774C7.74896 17.0494 7.5 17.4956 7.5 18C7.5 18.8284 8.17157 19.5 9 19.5C9.82843 19.5 10.5 18.8284 10.5 18C10.5 17.8247 10.4699 17.6564 10.4146 17.5H15.0854C15.0301 17.6564 15 17.8247 15 18C15 18.8284 15.6716 19.5 16.5 19.5C17.3284 19.5 18 18.8284 18 18C18 17.1716 17.3284 16.5 16.5 16.5H9.09144L8.66206 14.9972H17.2457C17.9154 14.9972 18.504 14.556 18.688 13.9121L20.4444 7.76483C20.5539 7.38154 20.2661 7 19.8674 7H6.37717L6.11657 6.08792C5.93259 5.44397 5.34401 5 4.67429 5H3.5Z"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}

/* Icons for QtyStepper */
function IconMinus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12.3667 7.3667C5.30021 7.3667 10.6998 7.3667 3.63333 7.3667C3.28 7.3667 3 7.65337 3 8.00003C3 8.35337 3.28667 8.63337 3.63333 8.63337C10.6998 8.63337 5.30018 8.63337 12.3667 8.63337C12.72 8.63337 13 8.3467 13 8.00003C13 7.6467 12.7133 7.3667 12.3667 7.3667Z" fill="currentColor"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12.3667 7.36667H8.63333V3.63333C8.63333 3.28 8.34667 3 8 3C7.65333 3 7.36667 3.28667 7.36667 3.63333V7.36667H3.63333C3.28 7.36667 3 7.65333 3 8C3 8.35333 3.28667 8.63333 3.63333 8.63333H7.36667V12.3667C7.36667 12.72 7.65333 13 8 13C8.34667 13 8.63333 12.7133 8.63333 12.3667V8.63333H12.3667C12.72 8.63333 13 8.34667 13 8C13 7.64667 12.7133 7.36667 12.3667 7.36667Z" fill="currentColor"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.24661 7L14.7534 7L14.5312 6L9.46883 6L9.24661 7ZM15.7538 7C15.7536 6.92873 15.7458 6.85612 15.7296 6.78307L15.5073 5.78307C15.4057 5.32553 14.9999 5 14.5312 5H9.46883C9.00013 5 8.59432 5.32553 8.49265 5.78307L8.27042 6.78307C8.25419 6.85612 8.24636 6.92873 8.24621 7H6C5.44772 7 5 7.44772 5 8C5 8.55228 5.44772 9 6 9H6.09497C6.09502 9.02992 6.09639 9.06012 6.09916 9.09054L6.91734 18.0905C6.96417 18.6056 7.39603 19 7.91323 19H16.0868C16.604 19 17.0359 18.6056 17.0827 18.0905L17.9009 9.09054C17.9036 9.06012 17.905 9.02992 17.9051 9H18C18.5523 9 19 8.55228 19 8C19 7.44772 18.5523 7 18 7H15.7538ZM16.905 9H7.09505L7.91323 18L16.0868 18L16.905 9Z" fill="currentColor"/>
    </svg>
  );
}

function IconSoldOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M19 12C19 15.866 15.866 19 12 19C10.247 19 8.64445 18.3556 7.4164 17.2908L17.2908 7.4164C18.3556 8.64445 19 10.247 19 12ZM6.70929 16.5837L16.5837 6.70929C15.3556 5.64442 13.753 5 12 5C8.13401 5 5 8.13401 5 12C5 13.753 5.64442 15.3556 6.70929 16.5837ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" fill="currentColor"/>
    </svg>
  );
}

/* QtyStepper — 100×32 outlined pill with 24px circular +/- buttons.
 * Uncontrolled — manages its own quantity via initialQuantity.
 * Minus swaps to trash icon when quantity === 1.
 * Plus swaps to sold-out icon when isSoldOut. */
export function QtyStepper({
  initialQuantity = 1,
  isSoldOut = false,
  onIncrement,
  onDecrement,
  onQuantityChange,
}) {
  const [qty, setQty] = useState(initialQuantity);

  const decrement = useCallback(() => {
    setQty((prev) => {
      const next = Math.max(0, prev - 1);
      onDecrement?.(next);
      onQuantityChange?.(next);
      return next;
    });
  }, [onDecrement, onQuantityChange]);

  const increment = useCallback(() => {
    if (isSoldOut) return;
    setQty((prev) => {
      const next = prev + 1;
      onIncrement?.(next);
      onQuantityChange?.(next);
      return next;
    });
  }, [isSoldOut, onIncrement, onQuantityChange]);

  return (
    <div className="btn-qty-stepper">
      <button
        type="button"
        className="btn-qty-stepper-btn"
        onClick={decrement}
        aria-label={qty === 1 ? 'Remove from cart' : 'Decrease quantity'}
      >
        {qty === 1 ? <IconTrash /> : <IconMinus />}
      </button>
      <span className="btn-qty-stepper-val">{qty}</span>
      <button
        type="button"
        className={`btn-qty-stepper-btn${isSoldOut ? ' is-soldout' : ''}`}
        onClick={increment}
        aria-label={isSoldOut ? 'Sold out' : 'Increase quantity'}
      >
        {isSoldOut ? <IconSoldOut /> : <IconPlus />}
      </button>
    </div>
  );
}

export function AddToCartButton({
  onAdd,
  onRemove,
  onQuantityChange,
  initialQuantity = 0,
}) {
  const [qty, setQty] = useState(initialQuantity);
  const timerRef = useRef(null);

  const add = useCallback(() => {
    setQty(1);
    onAdd?.();
    onQuantityChange?.(1);
  }, [onAdd, onQuantityChange]);

  const change = useCallback((delta) => {
    setQty((prev) => {
      const next = Math.max(0, prev + delta);
      if (next === 0) {
        onRemove?.();
        clearTimeout(timerRef.current);
      }
      onQuantityChange?.(next);
      return next;
    });
  }, [onRemove, onQuantityChange]);

  const inCart = qty > 0;

  return (
    <div className="btn-add-to-cart-wrap">
      <button
        className={`btn-add-to-cart${inCart ? ' hidden' : ''}`}
        onClick={(e) => { e.stopPropagation(); add(); }}
      >
        Add meal
      </button>
      <div className={`btn-qty-control${inCart ? ' visible' : ''}`}>
        <button className="btn-qty-btn" onClick={(e) => { e.stopPropagation(); change(-1); }}>−</button>
        <span className="btn-qty-val">{qty}</span>
        <button className="btn-qty-btn" onClick={(e) => { e.stopPropagation(); change(1); }}>+</button>
      </div>
    </div>
  );
}
