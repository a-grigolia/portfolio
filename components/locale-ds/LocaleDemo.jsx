'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './styles/tokens.css';
import Button, { CartButton } from './buttons/Button.jsx';
import MealCard from './components/MealCard/MealCard.jsx';
import MealPopup from './components/MealPopup/MealPopup.jsx';
import Sidecart from './components/Sidecart/Sidecart.jsx';
import './LocaleDemo.css';

const STEAK =
  'https://www.shoplocale.com/cdn/shop/files/steak-shawarma-reg_e3664688-b187-42ef-90e9-739383035c73.png';
const LOMO =
  'https://www.shoplocale.com/cdn/shop/files/lomo-saltado_afc86f13-ba2a-413b-87ed-78ca15d13fe8.png';
const GLOWBOWL = 'https://www.shoplocale.com/cdn/shop/files/glow_bowl_chicken.png';

// Sample meals drawn from the design-system stories. Each object carries both the
// MealCard fields and the richer MealPopup fields; the components read what they need.
const MEALS = [
  {
    id: 'steak',
    title: 'Grass Fed Steak Shawarma',
    subtitle: 'with Turmeric Rice and Spiced Chickpeas',
    image: STEAK,
    calories: 833,
    protein: 50,
    carbs: 75,
    fat: 37,
    fiber: 11,
    totalSugars: 7,
    addedSugars: 0,
    saturatedFat: 7,
    omega3: { value: '0.25g', dvPercent: 25 },
    magnesium: { value: '140mg', dvPercent: 35 },
    vitaminB12: { value: '2.4mcg', dvPercent: 71 },
    vitaminD: { value: '40IU', dvPercent: 7 },
    calcium: { value: '140mg', dvPercent: 14 },
    iron: { value: '4.2mg', dvPercent: 24 },
    potassium: { value: '1050mg', dvPercent: 23 },
    sodium: { value: '900mg', dvPercent: 40 },
    macroHighlight: 'protein',
    badges: ['signature'],
    spiceLevel: 'spice 0',
    heatingInstructions:
      'Remove sauce and pickled onions. Microwave: add 1 tsp water to rice, heat for 3 min.',
    ingredients:
      'Grass-fed flank steak, EVOO/avocado oil blend, lemon juice, garlic, turmeric rice, spiced chickpeas, pickled onions, tahini sauce.',
    allergens: ['Beef', 'Dairy'],
    highlights: [],
    suppliers: [
      {
        name: 'Creekstone Organic Farms',
        role: 'Our grass fed beef supplier',
        logo: '',
        description:
          'Creekstone Farms is a renowned producer known for premium Black Angus beef raised with a focus on animal welfare and nutrition.',
      },
      {
        name: 'Lakeside Organic Farms',
        role: 'Our organic produce supplier',
        logo: '',
        description:
          'Lakeside Organic Gardens is a family-owned farm dedicated to 100% organic, pesticide-free produce for over 25 years.',
      },
    ],
  },
  {
    id: 'lomo',
    title: 'Peruvian Lomo Saltado',
    subtitle: 'with Jasmine Rice and Crispy Potatoes',
    image: LOMO,
    calories: 620,
    protein: 44,
    carbs: 58,
    fat: 24,
    fiber: 6,
    totalSugars: 8,
    addedSugars: 2,
    saturatedFat: 6,
    omega3: { value: '0.2g', dvPercent: 18 },
    magnesium: { value: '85mg', dvPercent: 20 },
    macroHighlight: 'protein',
    badges: ['new'],
    spiceLevel: 'spice 0',
    heatingInstructions: 'Microwave: 3 min, stirring halfway through.',
    ingredients:
      'Grass-fed sirloin, red onion, tomato, soy-vinegar sauce, crispy potatoes, jasmine rice, cilantro.',
    allergens: ['Beef', 'Soy'],
    highlights: [],
    suppliers: [],
  },
  {
    id: 'glowbowl',
    title: 'Chicken Glow Bowl',
    subtitle: 'with Quinoa, Greens and Tahini',
    image: GLOWBOWL,
    calories: 480,
    protein: 40,
    carbs: 42,
    fat: 16,
    fiber: 9,
    totalSugars: 6,
    addedSugars: 0,
    saturatedFat: 3,
    macroHighlight: 'calories',
    badges: ['spicy'],
    spiceLevel: 'spice 2',
    heatingInstructions: 'Microwave: 2.5 min.',
    ingredients:
      'Free-range chicken, quinoa, kale, roasted sweet potato, chickpeas, tahini-lemon dressing.',
    allergens: ['Sesame'],
    highlights: [],
    suppliers: [],
  },
];

const MEALS_BY_ID = Object.fromEntries(MEALS.map((m) => [m.id, m]));
const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

export default function LocaleDemo() {
  const [quantities, setQuantities] = useState({});
  const [popupId, setPopupId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const totalQty = useMemo(() => sum(quantities), [quantities]);

  // Open the cart the first time something is added, then leave the user in control.
  const prevTotal = useRef(0);
  useEffect(() => {
    if (prevTotal.current === 0 && totalQty > 0) setCartOpen(true);
    prevTotal.current = totalQty;
  }, [totalQty]);

  const setQty = (id, nextVal) =>
    setQuantities((prev) => {
      const next = { ...prev };
      const v = Math.max(0, nextVal);
      if (v === 0) delete next[id];
      else next[id] = v;
      return next;
    });

  const adjustQty = (id, delta) =>
    setQuantities((prev) => {
      const next = { ...prev };
      const v = Math.max(0, (prev[id] || 0) + delta);
      if (v === 0) delete next[id];
      else next[id] = v;
      return next;
    });

  const items = MEALS.filter((m) => quantities[m.id] > 0).map((m) => ({
    id: m.id,
    image: m.image,
    title: m.title,
    calories: m.calories,
    protein: m.protein,
    quantity: quantities[m.id],
    onQuantityChange: (next) => setQty(m.id, next),
  }));

  const popupMeal = popupId ? MEALS_BY_ID[popupId] : null;
  const popupQty = popupId ? quantities[popupId] || 0 : 0;

  return (
    <div className="locale-ds locale-demo-bleed">
      <div className="locale-demo">
        <div className="locale-demo-bar">
          <div className="locale-demo-bar-left">
            <Button variant="primary">Browse meals</Button>
            <Button variant="secondary">Our story</Button>
          </div>
          <CartButton count={totalQty} onClick={() => setCartOpen(true)} />
        </div>

        <p className="locale-demo-hint">
          Live components from the production design system — click a meal to open its detail
          popup, add meals, and open the cart.
        </p>

        <div className="locale-demo-grid">
          {MEALS.map((m) => (
            <MealCard
              key={m.id}
              title={m.title}
              subtitle={m.subtitle}
              image={m.image}
              calories={m.calories}
              protein={m.protein}
              carbs={m.carbs}
              fat={m.fat}
              macroHighlight={m.macroHighlight}
              badges={m.badges}
              initialQuantity={quantities[m.id] || 0}
              onQuantityChange={(qty) => setQty(m.id, qty)}
              onClick={() => setPopupId(m.id)}
            />
          ))}
        </div>
      </div>

      <MealPopup
        {...(popupMeal || {})}
        isOpen={!!popupMeal}
        addToCart
        isInCart={popupQty > 0}
        cartQuantity={popupQty}
        onClose={() => setPopupId(null)}
        onAddToCart={() => popupId && adjustQty(popupId, 1)}
        onRemove={() => popupId && adjustQty(popupId, -1)}
      />

      <Sidecart
        isOpen={cartOpen}
        deliveryDate="Tue, 10/28"
        items={items}
        emptyMessage="Your cart is empty — add a meal to see it here."
        onClose={() => setCartOpen(false)}
        onClear={() => setQuantities({})}
        onContinue={() => setCartOpen(false)}
      />
    </div>
  );
}
