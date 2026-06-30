'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import './MealPopup.css';

function stripTitle(title) {
  if (!title) return '';
  return String(title).replace(/LOWCAL version\s*-\s*/gi, '').trim();
}

function formatMoney(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function clampDv(raw, dailyValue) {
  const pct = Math.ceil((raw / dailyValue) * 100);
  return Math.min(pct, 100);
}

function DvRing({ percent, color }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = (100 - clamped) * 1.52;
  return (
    <div className="popup-nutrition-dv-ring">
      <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54" fill="none">
        <circle cx="27" cy="27" r="24" stroke="#E7E7E7" strokeWidth="5" />
        <circle cx="27" cy="27" r="24" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray="152" strokeDashoffset={offset} />
      </svg>
      <p className="popup-nutrition-percent">{clamped}%</p>
      <p className="nutrition-dv-text">DV</p>
    </div>
  );
}

function formatGoalsList(goals) {
  if (!goals || goals.length === 0) return '';
  if (goals.length === 1) return goals[0];
  if (goals.length === 2) return `${goals[0]} and ${goals[1]}`;
  return `${goals[0]}, ${goals[1]}, and ${goals[2]}`;
}

function spiceLevelLabel(level) {
  if (level === 'spice 1') return 'Mild';
  if (level === 'spice 2') return 'Medium';
  if (level === 'spice 3') return 'Spicy';
  return '';
}

export default function MealPopup({
  title = '',
  subtitle = '',
  image = '',
  calories = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  fiber = 0,
  totalSugars = 0,
  addedSugars = 0,
  saturatedFat = 0,
  omega3 = null,
  magnesium = null,
  vitaminB12 = null,
  vitaminD = null,
  calcium = null,
  iron = null,
  potassium = null,
  sodium = null,
  spiceLevel = 'spice 0',
  heatingInstructions = '',
  ingredients = '',
  allergens = [],
  highlights = [],
  suppliers = [],
  hasGoals = false,
  matchScore = 100,
  matchedGoals = [],
  hasConflict = false,
  conflictDetails = '',
  isFavorite = false,
  isInCart = false,
  cartQuantity = 0,
  addToCart = true,
  isSide = false,
  upcharge = null,
  mealPrice = null,
  isOpen = false,
  productId = '',
  onClose = () => {},
  onAddToCart = () => {},
  onRemove = () => {},
  onFavorite = () => {},
}) {
  const [expandedSuppliers, setExpandedSuppliers] = useState({});
  const [microsOpen, setMicrosOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  if (!isOpen) return null;

  const displayTitle = stripTitle(title);
  const isLowCal = String(title).includes('LOWCAL');

  const toggleSupplier = (idx) => {
    setExpandedSuppliers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const atcLabel = () => {
    if (isSide) {
      const price = mealPrice != null ? (upcharge != null ? mealPrice + upcharge : mealPrice) : null;
      return price != null ? `Add Side (${formatMoney(price)})` : 'Add Side';
    }
    if (upcharge != null) return `Add Meal +${formatMoney(upcharge)}`;
    return 'Add Meal';
  };

  const micronutrients = [
    { label: 'Omega 3', ...(omega3 || {}) },
    { label: 'Magnesium', ...(magnesium || {}) },
    { label: 'Vitamin B12', ...(vitaminB12 || {}) },
    { label: 'Vitamin D', ...(vitaminD || {}) },
    { label: 'Calcium', ...(calcium || {}) },
    { label: 'Iron', ...(iron || {}) },
    { label: 'Potassium', ...(potassium || {}) },
    { label: 'Sodium', ...(sodium || {}) },
    { label: 'Added Sugars', value: `${addedSugars}g`, dvPercent: clampDv(addedSugars, 50) },
    { label: 'Saturated Fat', value: `${saturatedFat}g`, dvPercent: clampDv(saturatedFat, 20) },
  ];

  const renderQuantityControls = () => (
    <div className="popup-qty-controls" style={{ display: isInCart ? 'flex' : 'none' }}>
      <button type="button" className="popup-qty-btn minus" onClick={onRemove} aria-label={`Remove one ${displayTitle} from cart`}>
        <span className="quantity-button-svg minus">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12.3667 7.3667C5.30021 7.3667 10.6998 7.3667 3.63333 7.3667C3.28 7.3667 3 7.65337 3 8.00003C3 8.35337 3.28667 8.63337 3.63333 8.63337C10.6998 8.63337 5.30018 8.63337 12.3667 8.63337C12.72 8.63337 13 8.3467 13 8.00003C13 7.6467 12.7133 7.3667 12.3667 7.3667Z" fill="#F7F4F0" />
          </svg>
        </span>
      </button>
      <div className="popup-qty-display">{cartQuantity}</div>
      <button type="button" className="popup-qty-btn plus" onClick={onAddToCart} aria-label={`Add one ${displayTitle} to cart`}>
        <span className="quantity-button-svg plus">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12.3667 7.36667H8.63333V3.63333C8.63333 3.28 8.34667 3 8 3C7.65333 3 7.36667 3.28667 7.36667 3.63333V7.36667H3.63333C3.28 7.36667 3 7.65333 3 8C3 8.35333 3.28667 8.63333 3.63333 8.63333H7.36667V12.3667C7.36667 12.72 7.65333 13 8 13C8.34667 13 8.63333 12.7133 8.63333 12.3667V8.63333H12.3667C12.72 8.63333 13 8.34667 13 8C13 7.64667 12.7133 7.36667 12.3667 7.36667Z" fill="#F7F4F0" />
          </svg>
        </span>
      </button>
    </div>
  );

  const renderAtcButton = () => (
    <button type="button" className="popup-atc-btn" onClick={onAddToCart} style={{ display: isInCart ? 'none' : 'flex' }} aria-label={`Add ${displayTitle} to cart`}>
      {atcLabel()}
    </button>
  );

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-panel longevity">

          {/* Header */}
          <div className="popup-header">
            <button className="popup-close-btn" onClick={onClose} type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.3536 7.35355C17.5488 7.15829 17.5488 6.84171 17.3536 6.64645C17.1583 6.45118 16.8417 6.45118 16.6464 6.64645L12 11.2929L7.35355 6.64645C7.15829 6.45118 6.84171 6.45118 6.64645 6.64645C6.45118 6.84171 6.45118 7.15829 6.64645 7.35355L11.2929 12L6.64645 16.6464C6.45118 16.8417 6.45118 17.1583 6.64645 17.3536C6.84171 17.5488 7.15829 17.5488 7.35355 17.3536L12 12.7071L16.6464 17.3536C16.8417 17.5488 17.1583 17.5488 17.3536 17.3536C17.5488 17.1583 17.5488 16.8417 17.3536 16.6464L12.7071 12L17.3536 7.35355Z" fill="#1E1E20" />
              </svg>
            </button>
            <div className="popup-header-title">{displayTitle}</div>
            <div className={`favorite-button${isFavorite ? ' active' : ''}`} onClick={onFavorite}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19.8082 12.3432L12 20.1513L4.19182 12.3432C3.17182 11.3231 2.6 9.94087 2.6 8.4999C2.6 5.79383 4.79387 3.6 7.4999 3.6C8.85461 3.6 10.0787 4.14726 10.9656 5.03415L11.5756 5.64413L11.9999 6.0684L12.4241 5.64413L13.0341 5.03418C13.0341 5.03417 13.0341 5.03416 13.0341 5.03415C13.9211 4.14739 15.1452 3.6 16.4998 3.6H16.5001C19.2062 3.6 21.4 5.79387 21.4 8.4999C21.4 9.94085 20.828 11.3233 19.8082 12.3432Z" strokeWidth="1.2" />
              </svg>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="popup-body">

            {/* Intro section: image + info */}
            <div className="popup-intro">
              <img src={image} alt={displayTitle} width="auto" height="auto" />
              <div className="popup-info">

                <div className="popup-name-wrapper">
                  <span className="popup-meal-name">{displayTitle}</span>
                  <span className="popup-meal-subtitle">{subtitle}</span>
                </div>

                {/* Conflict warning */}
                {hasConflict ? (
                  <div className="popup-conflict">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.1338 4.67991C11.5187 4.01324 12.4809 4.01325 12.8658 4.67991L20.741 18.3201C21.1259 18.9868 20.6448 19.8201 19.875 19.8201H4.12463C3.35483 19.8201 2.87371 18.9868 3.25861 18.3201L11.1338 4.67991ZM11.1075 8.94181C11.0706 8.42399 11.4807 7.98353 11.9998 7.98353C12.519 7.98353 12.9291 8.42399 12.8921 8.94181L12.5144 14.2295C12.4951 14.4994 12.2705 14.7086 11.9998 14.7086C11.7292 14.7086 11.5045 14.4994 11.4852 14.2295L11.1075 8.94181ZM11.9998 17.5908C12.5304 17.5908 12.9605 17.1606 12.9605 16.63C12.9605 16.0994 12.5304 15.6693 11.9998 15.6693C11.4692 15.6693 11.0391 16.0994 11.0391 16.63C11.0391 17.1606 11.4692 17.5908 11.9998 17.5908Z" fill="#EACB7A" />
                    </svg>
                    <div>
                      <p className="conflict-title">Dietary Conflict</p>
                      <p className="conflict-details">{conflictDetails}</p>
                    </div>
                  </div>
                ) : null}

                {/* Goal match */}
                {hasGoals ? (
                  <div className="popup-goal-match" style={{ display: 'flex' }}>
                    <div className="popup-match-ring" style={{ '--percent': String(matchScore) }}>
                      <span className="popup-match-value">{matchScore}%</span>
                      <span className="popup-match-label">match</span>
                    </div>
                    <p className="popup-match-text">
                      Supports your goals of: <span className="biomarker-list">{formatGoalsList(matchedGoals)}</span>
                    </p>
                  </div>
                ) : null}

                {/* Highlight chips */}
                <div className="product-highlights-wrapper">
                  {isLowCal ? <div className="meal-popup-highlight">Low Cal Version</div> : null}
                  {upcharge != null ? <div className="meal-popup-highlight premium">Premium</div> : null}
                  {spiceLevel !== 'spice 0' ? (
                    <div className="meal-popup-highlight spicy">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.2471 5.78996C5.02007 5.59523 4.73845 5.35369 4.34408 5.26853H4.34574C3.99608 5.19296 3.69709 5.24196 3.45209 5.34079C3.71121 4.47538 4.36733 3.96958 5.10069 3.81261C5.08076 3.65731 4.95203 2.38825 5.84401 1.43813C5.96942 1.30441 6.17955 1.29777 6.31326 1.42318C6.44698 1.54859 6.45362 1.75871 6.32821 1.89243C5.61977 2.64572 5.75847 3.72126 5.76013 3.73205C5.76096 3.74202 5.76096 3.75282 5.76096 3.76278C6.44947 3.8068 7.12386 4.14067 7.53747 4.75776C7.1712 4.73533 6.77587 4.83666 6.42788 5.18465C6.29027 5.32309 6.19403 5.48635 6.10117 5.64388L6.10065 5.64476C5.94119 5.91635 5.84983 6.04591 5.70282 6.06335C5.58904 6.07664 5.45616 5.9695 5.25019 5.7926L5.2471 5.78996ZM7.9386 5.96535C8.22597 9.64875 11.2989 12.5066 12.519 13.3164L12.5198 13.3155C13.3063 13.8379 13.3553 14.3828 12.4434 14.6278C10.8405 15.058 4.33244 11.711 3.41387 6.99355C3.35906 6.712 3.33414 6.45038 3.33331 6.20621C3.48032 6.05505 3.78346 5.82582 4.20454 5.91635C4.4329 5.96564 4.61658 6.12298 4.81101 6.28954L4.81747 6.29507C5.055 6.49938 5.32077 6.72778 5.67956 6.72778C5.71195 6.72778 5.746 6.72612 5.78089 6.72197C6.27173 6.66383 6.50428 6.26933 6.67371 5.9803L6.67759 5.97373C6.75171 5.84828 6.82122 5.73064 6.89795 5.6539C7.2202 5.33166 7.60307 5.39727 7.86469 5.5069C7.9004 5.65141 7.92615 5.8034 7.9386 5.96535Z" fill="white" />
                      </svg>
                      <span>{spiceLevelLabel(spiceLevel)}</span>
                    </div>
                  ) : null}
                  {highlights.map((h, i) => (
                    <div className="meal-popup-highlight" key={i}>{h.label}</div>
                  ))}
                </div>

                {isLowCal ? (
                  <p className="premium-description">Our lower calorie meals swap some carbs for extra veggies, creating a lighter, nutrient-dense option.</p>
                ) : null}

                {/* Desktop ATC */}
                {addToCart ? (
                  <div className="popup-atc-wrapper">
                    {renderQuantityControls()}
                    {renderAtcButton()}
                  </div>
                ) : null}

              </div>
            </div>

            {/* Details grid */}
            <div className="popup-details-grid">
              <div className="popup-details-left">

                {/* Ingredients */}
                {ingredients ? (
                  <div className="popup-ingredients">
                    <h6>Ingredients</h6>
                    <p>{ingredients}</p>

                    {/* Supplier cards */}
                    {suppliers.length > 0 ? (
                      <div className="popup-suppliers">
                        {suppliers.map((vendor, idx) => (
                          <div className={`popup-supplier-card${expandedSuppliers[idx] ? ' active' : ''}`} key={idx}>
                            <div className="popup-supplier-toggle" onClick={() => toggleSupplier(idx)}>
                              <div className="vendor-header-wrapper">
                                {vendor.logo ? (
                                  <div className="popup-supplier-logo">
                                    <img src={vendor.logo} alt={vendor.name} width="100" height="100" />
                                  </div>
                                ) : (
                                  <div className="popup-supplier-logo">
                                    <span style={{ fontSize: 24 }}>{vendor.name.charAt(0)}</span>
                                  </div>
                                )}
                                <div className="popup-supplier-info">
                                  <h3>{vendor.name}</h3>
                                  <p>{vendor.role}</p>
                                </div>
                              </div>
                              <div className="vendor-toggle-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M12.3667 7.36667H8.63333V3.63333C8.63333 3.28 8.34667 3 8 3C7.65333 3 7.36667 3.28667 7.36667 3.63333V7.36667H3.63333C3.28 7.36667 3 7.65333 3 8C3 8.35333 3.28667 8.63333 3.63333 8.63333H7.36667V12.3667C7.36667 12.72 7.65333 13 8 13C8.34667 13 8.63333 12.7133 8.63333 12.3667V8.63333H12.3667C12.72 8.63333 13 8.34667 13 8C13 7.64667 12.7133 7.36667 12.3667 7.36667Z" fill="#1E1E20" />
                                </svg>
                              </div>
                            </div>
                            <div className="popup-supplier-description" style={{ display: expandedSuppliers[idx] ? 'block' : 'none' }}>
                              <p>{vendor.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Allergens */}
                <div className="popup-allergens">
                  <h6>Allergens</h6>
                  {allergens.length > 0 ? (
                    <div className="allergen-wrapper">
                      {allergens.map((a, i) => (
                        <div className="allergen" key={i}>{a}</div>
                      ))}
                    </div>
                  ) : null}
                  <p>Produced in a facility that processes eggs, fish, milk, peanuts, sesame, shellfish, soy, tree nuts, and wheat.</p>
                </div>

                {/* Spice */}
                {spiceLevel !== 'spice 0' ? (
                  <div className="popup-spice">
                    <h6>Spice Level</h6>
                    <div className="spice-wrapper">
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16" fill="none">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.2471 5.78996C5.02007 5.59523 4.73845 5.35369 4.34408 5.26853H4.34574C3.99608 5.19296 3.69709 5.24196 3.45209 5.34079C3.71121 4.47538 4.36733 3.96958 5.10069 3.81261C5.08076 3.65731 4.95203 2.38825 5.84401 1.43813C5.96942 1.30441 6.17955 1.29777 6.31326 1.42318C6.44698 1.54859 6.45362 1.75871 6.32821 1.89243C5.61977 2.64572 5.75847 3.72126 5.76013 3.73205C5.76096 3.74202 5.76096 3.75282 5.76096 3.76278C6.44947 3.8068 7.12386 4.14067 7.53747 4.75776C7.1712 4.73533 6.77587 4.83666 6.42788 5.18465C6.29027 5.32309 6.19403 5.48635 6.10117 5.64388L6.10065 5.64476C5.94119 5.91635 5.84983 6.04591 5.70282 6.06335C5.58904 6.07664 5.45616 5.9695 5.25019 5.7926L5.2471 5.78996ZM7.9386 5.96535C8.22597 9.64875 11.2989 12.5066 12.519 13.3164L12.5198 13.3155C13.3063 13.8379 13.3553 14.3828 12.4434 14.6278C10.8405 15.058 4.33244 11.711 3.41387 6.99355C3.35906 6.712 3.33414 6.45038 3.33331 6.20621C3.48032 6.05505 3.78346 5.82582 4.20454 5.91635C4.4329 5.96564 4.61658 6.12298 4.81101 6.28954L4.81747 6.29507C5.055 6.49938 5.32077 6.72778 5.67956 6.72778C5.71195 6.72778 5.746 6.72612 5.78089 6.72197C6.27173 6.66383 6.50428 6.26933 6.67371 5.9803L6.67759 5.97373C6.75171 5.84828 6.82122 5.73064 6.89795 5.6539C7.2202 5.33166 7.60307 5.39727 7.86469 5.5069C7.9004 5.65141 7.92615 5.8034 7.9386 5.96535Z" fill="#C76A6A" />
                        </svg>
                        <span>{spiceLevelLabel(spiceLevel)}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Heating instructions */}
                {heatingInstructions ? (
                  <div className="popup-heating">
                    <h6>Heating Instructions</h6>
                    <p>{heatingInstructions}</p>
                  </div>
                ) : null}
              </div>

              {/* Right column: nutrition */}
              <div className="popup-details-right">
                <div className="popup-nutrition">

                  {/* Macronutrients */}
                  <div className="popup-macros-panel">
                    <h6>Macronutrients</h6>
                    <div className="nutrition-macro-disclaimer">Per Serving</div>
                    <div className="nutrition-macros-list">
                      <div className="popup-nutrition-row">
                        <div className="popup-nutrition-label">Number of Servings</div>
                        <div className="nutrition-details">
                          <div className="popup-nutrition-value">1</div>
                        </div>
                      </div>
                      <div className="popup-nutrition-row">
                        <div className="popup-nutrition-label">Calories</div>
                        <div className="nutrition-details">
                          <div className="popup-nutrition-value">{calories}cal</div>
                          <DvRing percent={clampDv(calories, 2000)} color="#5DA5D5" />
                        </div>
                      </div>
                      <div className="popup-nutrition-row">
                        <div className="popup-nutrition-label">Fat</div>
                        <div className="nutrition-details">
                          <div className="popup-nutrition-value">{fat}g</div>
                          <DvRing percent={clampDv(fat, 78)} color="#80C07B" />
                        </div>
                      </div>
                      <div className="popup-nutrition-row">
                        <div className="popup-nutrition-label">Carbs</div>
                        <div className="nutrition-details">
                          <div className="popup-nutrition-value">{carbs}g</div>
                          <DvRing percent={clampDv(carbs, 275)} color="#F8E269" />
                        </div>
                      </div>
                      <div className="popup-nutrition-row">
                        <div className="popup-nutrition-label">Protein</div>
                        <div className="nutrition-details">
                          <div className="popup-nutrition-value">{protein}g</div>
                          <DvRing percent={clampDv(protein, 140)} color="#FF7F66" />
                        </div>
                      </div>
                      <div className="popup-nutrition-row">
                        <div className="nutrition-label-wrapper">
                          <div className="popup-nutrition-label">Fiber</div>
                        </div>
                        <div className="nutrition-details">
                          <div className="popup-nutrition-value">{fiber}g</div>
                          <DvRing percent={clampDv(fiber, 25)} color="#B266FF" />
                        </div>
                      </div>
                      <div className="popup-nutrition-row">
                        <div className="nutrition-label-wrapper">
                          <div className="popup-nutrition-label">Total Sugars</div>
                        </div>
                        <div className="nutrition-details">
                          <div className="popup-nutrition-value">{totalSugars}g</div>
                          <DvRing percent={clampDv(totalSugars, 50)} color="#D55DB5" />
                        </div>
                      </div>
                    </div>
                    <p className="nutrition-dv-disclaimer">The % Daily Value (DV) tells you how nutrients from this meal contribute to a daily diet of 2,000 calories a day. Your daily values might be higher or lower depending on your calorie needs</p>
                  </div>

                  {/* Micronutrients (collapsible) */}
                  <div className="popup-macros-panel">
                    <div className="nutrition-macros-header" style={{ cursor: 'pointer' }} onClick={() => setMicrosOpen((v) => !v)}>
                      <h6>Micronutrients</h6>
                      <svg className={`toggle-arrow${microsOpen ? ' active' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.46967 8.46967C5.76256 8.17678 6.23744 8.17678 6.53033 8.46967L12 13.9393L17.4697 8.46967C17.7626 8.17678 18.2374 8.17678 18.5303 8.46967C18.8232 8.76256 18.8232 9.23744 18.5303 9.53033L12 16.0607L5.46967 9.53033C5.17678 9.23744 5.17678 8.76256 5.46967 8.46967Z" fill="#1E1E20" />
                      </svg>
                    </div>
                    <div className="nutrition-micros-list" style={{ display: microsOpen ? 'flex' : 'none', flexDirection: 'column' }}>
                      {micronutrients.map((micro) => (
                        <div className="popup-nutrition-row" key={micro.label}>
                          <div className="nutrition-label-wrapper">
                            <div className="popup-nutrition-label">{micro.label}</div>
                          </div>
                          <div className="nutrition-details">
                            <div className="popup-nutrition-value">{micro.value || '—'}</div>
                            <DvRing percent={micro.dvPercent || 0} color="#59DBDB" />
                          </div>
                        </div>
                      ))}
                      <p className="nutrition-dv-disclaimer" style={{ marginTop: 16 }}>The % Daily Value (DV) tells you how nutrients from this meal contribute to a daily diet of 2,000 calories a day. Your daily values might be higher or lower depending on your calorie needs</p>
                    </div>
                  </div>

                  {/* Nutritional disclaimer dropdown */}
                  <div className="rounded-container" onClick={() => setDisclaimerOpen((v) => !v)}>
                    <div className="dropdown-title">
                      Nutritional info may vary slightly by week of delivery
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.6673 7.99967C14.6673 11.6816 11.6826 14.6663 8.00065 14.6663C4.31875 14.6663 1.33398 11.6816 1.33398 7.99967C1.33398 4.31778 4.31875 1.33301 8.00065 1.33301C11.6826 1.33301 14.6673 4.31778 14.6673 7.99967ZM7.00065 7.66634C7.00065 7.11406 7.44837 6.66634 8.00065 6.66634C8.55294 6.66634 9.00065 7.11406 9.00065 7.66634V10.9997C9.00065 11.552 8.55294 11.9997 8.00065 11.9997C7.44837 11.9997 7.00065 11.552 7.00065 10.9997V7.66634ZM8.00065 3.99967C7.44837 3.99967 7.00065 4.44739 7.00065 4.99967C7.00065 5.55196 7.44837 5.99967 8.00065 5.99967C8.55294 5.99967 9.00065 5.55196 9.00065 4.99967C9.00065 4.44739 8.55294 3.99967 8.00065 3.99967Z" fill="#77777E" />
                      </svg>
                    </div>
                    <p className="dropdown-more-info" style={{ display: disclaimerOpen ? 'block' : 'none' }}>Due to the local suppliers that we purchase from, nutritional facts per meal may vary from the facts on our website and packaging.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile sticky ATC */}
          {addToCart ? (
            <div className="popup-atc-wrapper mobile">
              {renderQuantityControls()}
              {renderAtcButton()}
            </div>
          ) : null}

        </div>
        <div className="popup-backdrop" onClick={onClose} />
      </div>
    </div>
  );
}
