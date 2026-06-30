'use client';

import Badge from '../Badge/Badge.jsx';
import { QtyStepper } from '../../buttons/Button.jsx';
import './SidecartItem.css';

/* SidecartItem
 * One row in the sidecart list. Composes: Badge ("Low Cal Version") + QtyStepper.
 * All data is passed in via props — no fetching, no cart state.
 *
 * Props:
 *   image: string            — product image URL
 *   imageAlt?: string        — alt text (defaults to title)
 *   title: string            — meal title
 *   calories?: number|string — shown in macros row
 *   protein?: number|string  — shown in macros row (e.g. 35 → "35g protein")
 *   quantity?: number        — initial quantity (default 1)
 *   isSoldOut?: boolean      — toggles sold-out icon on the +
 *   hasConflict?: boolean    — shows "Dietary conflict" chip + dims the row
 *   isLowCal?: boolean       — shows the "Low Cal Version" badge
 *   shelfLifeDays?: number   — shows green "Eat within N days"
 *   onIncrement?, onDecrement?, onQuantityChange? — QtyStepper callbacks
 */
export default function SidecartItem({
  image,
  imageAlt,
  title,
  calories,
  protein,
  quantity = 1,
  isSoldOut = false,
  hasConflict = false,
  isLowCal = false,
  shelfLifeDays,
  onIncrement,
  onDecrement,
  onQuantityChange,
}) {
  const className = ['sidecart-item', hasConflict && 'is-conflict']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <div className="sidecart-item-image">
        {image ? <img src={image} alt={imageAlt || title} /> : null}
      </div>

      <div className="sidecart-item-content">
        {hasConflict ? (
          <div className="sidecart-item-conflict">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.1338 4.67991C11.5187 4.01324 12.4809 4.01325 12.8658 4.67991L20.741 18.3201C21.1259 18.9868 20.6448 19.8201 19.875 19.8201H4.12463C3.35483 19.8201 2.87371 18.9868 3.25861 18.3201L11.1338 4.67991ZM11.1075 8.94181C11.0706 8.42399 11.4807 7.98353 11.9998 7.98353C12.519 7.98353 12.9291 8.42399 12.8921 8.94181L12.5144 14.2295C12.4951 14.4994 12.2705 14.7086 11.9998 14.7086C11.7292 14.7086 11.5045 14.4994 11.4852 14.2295L11.1075 8.94181ZM11.9998 17.5908C12.5304 17.5908 12.9605 17.1606 12.9605 16.63C12.9605 16.0994 12.5304 15.6693 11.9998 15.6693C11.4692 15.6693 11.0391 16.0994 11.0391 16.63C11.0391 17.1606 11.4692 17.5908 11.9998 17.5908Z"
                fill="#EACB7A"
              />
            </svg>
            <p>Dietary conflict</p>
          </div>
        ) : null}

        <div className="sidecart-item-title">{title}</div>

        {isLowCal ? <Badge variant="default">Low Cal Version</Badge> : null}

        {shelfLifeDays != null ? (
          <div className="sidecart-item-shelf-life">
            Eat within {shelfLifeDays} days
          </div>
        ) : null}

        {(calories != null || protein != null) && (
          <div className="sidecart-item-macros">
            <span>
              {calories != null ? `${calories} cal` : null}
              {calories != null && protein != null ? ', ' : null}
              {protein != null ? `${protein}g protein` : null}
            </span>
          </div>
        )}
      </div>

      <div className="sidecart-item-cta">
        <QtyStepper
          initialQuantity={quantity}
          isSoldOut={isSoldOut}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onQuantityChange={onQuantityChange}
        />
      </div>
    </div>
  );
}
