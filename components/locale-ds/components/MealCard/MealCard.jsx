'use client';

/* eslint-disable @next/next/no-img-element */
import Badge from '../Badge/Badge.jsx';
import MacroChip from '../MacroChip/MacroChip.jsx';
import CalorieToggle from '../CalorieToggle/CalorieToggle.jsx';
import { AddToCartButton } from '../../buttons/Button.jsx';
import './MealCard.css';

function formatUpcharge(upcharge) {
  const n = Number(upcharge);
  if (Number.isNaN(n) || n === 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

const MACRO_KEYS = ['calories', 'protein', 'carbs', 'fat'];
const MACRO_LABELS = { calories: 'Cal', protein: 'Protein', carbs: 'Carbs', fat: 'Fat' };

function BadgeList({ badges, premiumUpcharge }) {
  if (!badges?.length) return null;
  return (
    <div className="meal-card-badges">
      {badges.map((b) => {
        if (b === 'premium') {
          return (
            <Badge key={b} variant="premium">
              {premiumUpcharge ? `Premium +${formatUpcharge(premiumUpcharge)}` : 'Premium'}
            </Badge>
          );
        }
        if (b === 'vegetarian') return <Badge key={b} variant="vegetarian" icon="🌿">Veg</Badge>;
        if (b === 'spicy') return <Badge key={b} variant="spicy" icon="🌶" />;
        const labels = {
          new: 'New',
          'new-recipe': 'New Recipe',
          'early-access': 'Early Access',
          signature: 'Locale Signature',
        };
        return <Badge key={b} variant={b}>{labels[b] ?? b}</Badge>;
      })}
    </div>
  );
}

function PercentageMatch({ score = 100 }) {
  const isLow = score <= 65;
  return (
    <div
      className={`meal-card-match${isLow ? ' meal-card-match-low' : ''}`}
      style={{ '--percent': String(score) }}
    >
      <span className="meal-card-match-value">{score}%</span>
      <span className="meal-card-match-label">match</span>
    </div>
  );
}

function ConflictChip({ message }) {
  return (
    <div className="meal-card-conflict-overlay">
      <div className="meal-card-conflict-chip">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.1338 4.67991C11.5187 4.01324 12.4809 4.01325 12.8658 4.67991L20.741 18.3201C21.1259 18.9868 20.6448 19.8201 19.875 19.8201H4.12463C3.35483 19.8201 2.87371 18.9868 3.25861 18.3201L11.1338 4.67991ZM11.1075 8.94181C11.0706 8.42399 11.4807 7.98353 11.9998 7.98353C12.519 7.98353 12.9291 8.42399 12.8921 8.94181L12.5144 14.2295C12.4951 14.4994 12.2705 14.7086 11.9998 14.7086C11.7292 14.7086 11.5045 14.4994 11.4852 14.2295L11.1075 8.94181ZM11.9998 17.5908C12.5304 17.5908 12.9605 17.1606 12.9605 16.63C12.9605 16.0994 12.5304 15.6693 11.9998 15.6693C11.4692 15.6693 11.0391 16.0994 11.0391 16.63C11.0391 17.1606 11.4692 17.5908 11.9998 17.5908Z"
            fill="#EACB7A"
          />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
}

function ServingSizeDivider() {
  return (
    <div className="meal-card-serving">
      <div className="meal-card-divider" />
      <div className="meal-card-serving-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.1053 4.77201C10.1053 5.93472 9.16272 6.87727 8.00002 6.87727C6.83731 6.87727 5.89475 5.93472 5.89475 4.77201C5.89475 3.60931 6.83731 2.66675 8.00002 2.66675C9.16272 2.66675 10.1053 3.60931 10.1053 4.77201ZM3.78949 11.1247C3.78949 13.1808 12.2053 13.1808 12.2053 11.1247H12.2105C12.2105 9.06856 10.3269 7.40359 8.00002 7.40359C5.67315 7.40359 3.78949 9.06856 3.78949 11.1247Z"
            fill="currentColor"
          />
        </svg>
        <span>Per serving</span>
      </div>
      <div className="meal-card-divider" />
    </div>
  );
}

export default function MealCard({
  title,
  subtitle,
  image,
  imageEmoji,
  calories = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  macroHighlight = 'protein',
  badges = [],
  premiumUpcharge,
  initialQuantity = 0,
  onQuantityChange,
  showCheckoutQuantity = false,
  showCalorieToggle = false,
  initialLowCal = false,
  onLowCalToggle,
  // Toggleable features
  hasConflict = false,
  conflictMessage = 'Conflicts with dietary preferences',
  shelfLifeDays,
  showServingSize = false,
  hasGoalMatch = false,
  matchScore = 100,
  // Mode
  mode = 'default', // 'default' | 'dashboard' | 'orderHistory'
  orderQuantity = 0,
  isCutoff = false,
  onClick,
}) {
  const isDashboard = mode === 'dashboard' || mode === 'orderHistory';
  const cardClass = [
    'meal-card',
    isDashboard && 'meal-card-dashboard',
    hasConflict && 'meal-card-conflict',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} onClick={onClick}>
      <div className="meal-card-image-container">
        {image ? (
          <img src={image} alt={title} className="meal-card-image" />
        ) : (
          <div className="meal-card-image meal-card-image-placeholder">
            {imageEmoji || '🍽️'}
          </div>
        )}

        <div className="meal-card-image-overlay">
          <BadgeList badges={badges} premiumUpcharge={premiumUpcharge} />
          {hasGoalMatch ? <PercentageMatch score={matchScore} /> : null}
        </div>

        {showCheckoutQuantity && initialQuantity > 0 ? (
          <div className="meal-card-checkout-qty">{initialQuantity}</div>
        ) : null}

        {hasConflict ? <ConflictChip message={conflictMessage} /> : null}
      </div>

      <div className="meal-card-content">
        <div>
          {shelfLifeDays != null ? (
            <div className="meal-card-shelf-life">Eat within {shelfLifeDays} days</div>
          ) : null}
          <h3 className="meal-card-title">{title}</h3>
          {subtitle ? <div className="meal-card-subtitle">{subtitle}</div> : null}
        </div>

        <div className="meal-card-bottom">
          {showCalorieToggle ? (
            <CalorieToggle
              defaultValue={initialLowCal ? 1 : 0}
              onChange={(idx) => onLowCalToggle?.(idx === 1)}
            />
          ) : null}

          {showServingSize ? <ServingSizeDivider /> : null}

          <div className="meal-card-macros">
            {(() => {
              const values = { calories, protein: `${protein}g`, carbs: `${carbs}g`, fat: `${fat}g` };
              return MACRO_KEYS.map((key) => (
                <MacroChip
                  key={key}
                  value={values[key]}
                  label={MACRO_LABELS[key]}
                  highlighted={macroHighlight === key}
                />
              ));
            })()}
          </div>

          {isDashboard ? (
            <div
              className={`meal-card-checkout-display${isCutoff ? ' meal-card-checkout-display-cutoff' : ''}`}
            >
              {orderQuantity}
            </div>
          ) : (
            <AddToCartButton
              initialQuantity={initialQuantity}
              onQuantityChange={onQuantityChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
