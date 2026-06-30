'use client';

import Button from '../../buttons/Button.jsx';
import SidecartItem from '../SidecartItem/SidecartItem.jsx';
import './Sidecart.css';

/* Sidecart
 * Fullscreen overlay + right-side 420px slide-in panel.
 * Contains its own header, item list (or empty state), and footer — the only
 * external piece is SidecartItem which is rendered per-row and owns the
 * meal-row states.
 *
 * All data is supplied as props. No cart state, no API, no side effects.
 *
 * Props:
 *   isOpen?:             boolean
 *   deliveryDate?:       string
 *   itemCount?:          number                  — defaults to sum of item quantities
 *   planSize?:           number | null
 *   items?:              SidecartItemProps[]     — see SidecartItem
 *   paymentSummary?:     { meals?, glassDeposit?, delivery?, credit?, total? }   all strings
 *   showDiscountInput?:  boolean                 — defaults to isLoggedIn
 *   isLoggedIn?:         boolean                 — drives summary, discount row, checkout label
 *   defaultSummaryOpen?: boolean
 *   emptyMessage?:       string
 *   onClose?, onClear?, onContinue?, onChangePlan?, onApplyDiscount?
 */
export default function Sidecart({
  isOpen = false,
  deliveryDate = '',
  itemCount,
  planSize = null,
  items = [],
  paymentSummary = {},
  showDiscountInput,
  isLoggedIn = false,
  defaultSummaryOpen = false,
  emptyMessage = 'Your cart is empty',
  onClose = () => {},
  onClear = () => {},
  onContinue = () => {},
  onChangePlan = () => {},
  onApplyDiscount = () => {},
}) {
  const count =
    typeof itemCount === 'number'
      ? itemCount
      : items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  const hasPlan = planSize != null && planSize > 0;
  const progressPct = hasPlan ? Math.round(Math.min(count / planSize, 1) * 100) : 0;
  const showDiscount = showDiscountInput ?? isLoggedIn;
  const checkoutLabel = isLoggedIn ? 'Save' : 'Checkout';
  const isCheckoutDisabled = hasPlan ? count < planSize : false;

  const className = ['sidecart', isOpen && 'is-open'].filter(Boolean).join(' ');
  const { meals, glassDeposit, delivery, credit, total } = paymentSummary;

  return (
    <div
      className={className}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div className="sidecart-overlay" onClick={onClose} />

      <div className="sidecart-panel">
        {/* Header */}
        <div className="sidecart-header">
          <div className="sidecart-header-row">
            <h2 className="sidecart-header-title">
              Your Cart
              {deliveryDate ? ' for ' : ''}
              {deliveryDate ? (
                <span className="sidecart-header-date">{deliveryDate}</span>
              ) : null}
            </h2>
            <button
              type="button"
              className="sidecart-header-close"
              aria-label="Close cart"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="sidecart-header-row">
            <span className="sidecart-header-count">{count} meals</span>
            <button
              type="button"
              className="sidecart-header-clear"
              onClick={onClear}
            >
              Clear
            </button>
          </div>

          {hasPlan ? (
            <div className="sidecart-header-progress">
              <div className="sidecart-header-progress-track">
                <div
                  className="sidecart-header-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="sidecart-header-progress-text">
                {count} of {planSize} meals selected
              </div>
            </div>
          ) : null}
        </div>

        {/* Items or Empty */}
        {items.length > 0 ? (
          <ul className="sidecart-items">
            {items.map((item, i) => (
              <li key={item.id ?? i} className="sidecart-items-row">
                <SidecartItem {...item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="sidecart-empty">{emptyMessage}</div>
        )}

        {/* Footer */}
        <div className="sidecart-footer">
          {isLoggedIn ? (
            <details
              className="sidecart-footer-summary"
              open={defaultSummaryOpen}
            >
              <summary className="sidecart-footer-summary-toggle">
                <span>Payment Summary:</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="sidecart-footer-chevron"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.5303 15.591C18.2374 15.8839 17.7626 15.8839 17.4697 15.591L12 10.1213L6.53033 15.591C6.23744 15.8839 5.76256 15.8839 5.46967 15.591C5.17678 15.2981 5.17678 14.8232 5.46967 14.5303L12 8L18.5303 14.5303C18.8232 14.8232 18.8232 15.2981 18.5303 15.591Z"
                    fill="currentColor"
                  />
                </svg>
              </summary>

              <div className="sidecart-footer-summary-body">
                {meals != null ? (
                  <div className="sidecart-footer-row">
                    <span>Meals</span>
                    <span>{meals}</span>
                  </div>
                ) : null}

                {glassDeposit != null ? (
                  <div className="sidecart-footer-row">
                    <span className="sidecart-footer-glass">
                      Glass Deposit
                      <span
                        className="sidecart-footer-info"
                        tabIndex={0}
                        aria-label="Glass deposit info"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 10.6667V8"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 5.33333H8.00667"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="sidecart-footer-tooltip">
                          Glass deposits are refunded when you return your
                          containers. Simply leave them out during your next
                          delivery and we'll credit your account.
                        </span>
                      </span>
                    </span>
                    <span>{glassDeposit}</span>
                  </div>
                ) : null}

                {delivery != null ? (
                  <div className="sidecart-footer-row">
                    <span>Delivery</span>
                    <span>{delivery}</span>
                  </div>
                ) : null}

                {credit != null ? (
                  <div className="sidecart-footer-row">
                    <span>Account Credit</span>
                    <span>{credit}</span>
                  </div>
                ) : null}

                {total != null ? (
                  <div className="sidecart-footer-row sidecart-footer-total">
                    <span>Total</span>
                    <span>{total}</span>
                  </div>
                ) : null}
              </div>
            </details>
          ) : null}

          {showDiscount ? (
            <form
              className="sidecart-footer-discount"
              onSubmit={(e) => {
                e.preventDefault();
                const code = e.currentTarget.elements.discount.value;
                onApplyDiscount(code);
              }}
            >
              <input
                type="text"
                name="discount"
                placeholder="Enter Discount Code"
                className="sidecart-footer-discount-input"
              />
              <button type="submit" className="sidecart-footer-discount-apply">
                Apply
              </button>
            </form>
          ) : null}

          <div className="sidecart-footer-actions">
            <div className="sidecart-footer-plan">
              {planSize != null ? (
                <span className="sidecart-footer-plan-size">
                  Plan size: {planSize} meals
                </span>
              ) : null}
              <button
                type="button"
                className="sidecart-footer-change-plan"
                onClick={onChangePlan}
              >
                Change Plan
              </button>
            </div>
            <div className="sidecart-footer-checkout">
              <Button
                variant="checkout"
                disabled={isCheckoutDisabled}
                onClick={onContinue}
              >
                {checkoutLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
