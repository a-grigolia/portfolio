# Portfolio

A minimal, text-forward designer portfolio built with Next.js (App Router), JavaScript, and Tailwind CSS. Editorial typography, generous whitespace, and a light/dark toggle in the footer.

## Stack

- **Next.js 16** (App Router, JavaScript — no TypeScript)
- **React 19**
- **Tailwind CSS 4** (utility classes only)
- Deployable to **Vercel** with zero extra config

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build

## Structure

```
app/
  layout.js              Root layout, fonts, theme provider, footer
  page.js                Homepage (name, positioning, about, work rows, connect)
  globals.css            Tailwind + theme tokens (light/dark via .dark class)
  theme-provider.js      In-memory theme state (defaults to light, no storage)
  work/[slug]/page.js    Case study route (/work/locale-1, -2, -3)
components/
  Footer, ThemeToggle    Footer with a text-based [light/dark] toggle
  WorkRow                Typographic homepage row
  CaseStudyLayout        Reusable case study shell
  Hero, StatsStrip
  SectionNav             Sticky scroll-spy anchor nav
  ProseBlock
  ImageBlock, Gallery    Clickable placeholders with a lightbox
  Lightbox, Placeholder
content/
  site.js                Profile + homepage work rows
  case-studies.js        Case study content (data-driven)
```

## Customizing

- **Profile & work rows:** `content/site.js`
- **Case study content:** `content/case-studies.js` (data-driven blocks: `prose`, `image`, `gallery`)
- **Colors / theme:** CSS variables in `app/globals.css`
- **Real images:** replace `<Placeholder>` usage inside `ImageBlock` / `Gallery` with real `<img>` or `next/image`.

## Theme

Defaults to light and can be toggled via the text-based `[light/dark]` control in the footer. Per the project constraints, the choice is kept in React state only — it is **not** persisted to `localStorage`/`sessionStorage`.

## License

Released under the [MIT License](./LICENSE).
