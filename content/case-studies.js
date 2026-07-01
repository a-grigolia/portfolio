const IMG = "/work/locale-1";

export const caseStudies = {
  "locale-1": {
    eyebrow: "0 → 1",
    title: "Locale 1.0",
    subtitle: "Building a $74M marketplace without engineers.",
    stats: [
      { label: "Raised", value: "$14M" },
      { label: "Valuation", value: "$74M" },
      { label: "Backed by", value: "YC" },
      { label: "Markets", value: "3" },
    ],
    sections: [
      {
        id: "context",
        label: "Context",
        blocks: [
          {
            type: "prose",
            heading: "Context",
            paragraphs: [
              "When I joined Locale, it was called Organic on the Go — a Google Form collecting orders from family and friends for the local farmers market in Los Gatos, CA. I was originally contacted to make a quick logo for the form, but ended up on the founding team to own the entire design function: building out the platform, user experience, and conceptualizing the brand.",
              "Locale went on to become a full-blown marketplace, go through YC (S21), raise $14MM from a16z at a $74MM valuation, and expand nationwide — until we were forced to pivot after losing PMF.",
            ],
          },
          {
            type: "gallery",
            layout: "cols-2",
            caption: "The OG Google Form collecting orders (still exists)",
            items: [
              { src: `${IMG}/context-1.png`, label: "Organic on the Go order form", ratio: "348 / 218" },
              { src: `${IMG}/context-2.png`, label: "Order form responses", ratio: "348 / 218" },
            ],
          },
        ],
      },
      {
        id: "pmf-brand",
        label: "PMF & Branding",
        blocks: [
          {
            type: "prose",
            heading: "Establishing PMF & Brand",
            paragraphs: [
              "Due to COVID-19 restrictions, people were wary of leaving their homes but still wanted access to their neighborhood bakery and local farmer’s market.  If they did end up stepping out, they were forced to wait in lines that would sometimes wrap around the block. Because of this, the form began to gain healthy momentum.",
              "But, the name “Organic on the Go” was too literal to ever feel like a unicorn.",
              "We decided a name change was necessary, so I ran a branding exercise with the rest of the founding team that landed on Locale — the word for your local community, which was exactly who we were serving. We wanted Locale to be like a family friend who shows you all of the best eateries in the area, one that makes you feel like a local when you visit for the first time.",
              "Our tagline became “Eat Local, Shop Locale.”",
              "The brand's ethos rested on three things: put vendors first; stay accessible to as many people as possible; and be selective about what we put on the platform, curating only the best products.",
              "Several logo iterations, color palettes, and packaging designs later, I translated that identity into a complete visual system.",
            ],
          },
          {
            type: "image",
            src: `${IMG}/pmf-logo-progression.png`,
            label: "Logo progression",
            caption: "Evolution of the logo",
            ratio: "4096 / 819",
          },
          {
            type: "image",
            src: `${IMG}/pmf-graphics.png`,
            label: "Brand graphics and iconography",
            caption: "Colors, Graphics, and Iconography",
            ratio: "3220 / 1620",
            shadow: false,
            border: false,
            radius: false,
          },
          {
            type: "image",
            src: `${IMG}/pmf-delivery.png`,
            label: "A typical Locale delivery",
            caption: "This is what a typical delivery looked like",
            ratio: "3 / 2",
          },
        ],
      },
      {
        id: "the-build",
        label: "The build",
        blocks: [
          {
            type: "prose",
            heading: "The build",
            paragraphs: [
              "As momentum grew we needed to move off the Google Form fast, and it was up to me to decide how. With no prior coding knowledge and no technical co-founder, Webflow gave me the best ability to ship and iterate quickly without waiting on anyone.",
              "What resulted was a front end built entirely in Webflow, with Airtable acting as a working backend, glued together by a handful of third-party apps to make it hum.",
              "It wasn’t elegant, but that was the point. I could change anything on the site in an afternoon — test a layout, reorder a category, redesign a page — and see how customers responded by the weekend.",
              "Working without engineers meant I got to solve problems I had no business solving alone: geotagging subdomains so each region had its own storefront; building filters for better discoverability; implementing overengineered search engines.",
              "Having speed as a core tenet of our team, more than any single decision, is what got us through Y Combinator, helped us raise from a16z, and allowed us to go nationwide.",
              "Over three years, I designed and shipped every page in that same stack, carrying the marketplace from a scrappy first launch to a polished storefront.",
            ],
       
          },
          {
            type: "image",
            src: `${IMG}/build-system-diagram.png`,
            label: "System diagram",
            caption: "The system that made the marketplace work",
            ratio: "2580 / 928",
            fit: "contain",
            shadow: false,
            border: false,
          },
          {
            type: "image",
            src: `${IMG}/build-webflow-dashboard.png`,
            label: "Webflow dashboard",
            caption: "Webflow dashboard, where the magic happened",
            ratio: "720 / 451",
            fit: "cover",
          },
          {
            type: "gallery",
            layout: "cols-3",
            caption: "Home, Product & Vendor pages",
            items: [
              { src: `${IMG}/build-socal.jpg`, label: "SoCal regional homepage", ratio: "865 / 4096" },
              { src: `${IMG}/build-bibimbap.jpg`, label: "Product page for some bibimbap", ratio: "1335 / 4096" },
              { src: `${IMG}/build-pizzana.jpg`, label: "Vendor page for Pizzana, a restaurant in LA", ratio: "1355 / 4096", fit: "contain" },
            ],
          },
          {
            type: "gallery",
            layout: "grid-2x2",
            caption: "Category & Utility pages",
            items: [
              { src: `${IMG}/build-all-products.png`, label: "All products page", ratio: "1726 / 1302" },
              { src: `${IMG}/build-bakery.png`, label: "One of many category pages", ratio: "1726 / 1323" },
              { src: `${IMG}/build-search.png`, label: "Search", ratio: "1726 / 1323" },
              { src: `${IMG}/build-region-selector.png`, label: "Region selector", ratio: "1726 / 1323" },
            ],
          },
        ],
      },
      {
        id: "impact",
        label: "Impact",
        blocks: [
          {
            type: "prose",
            heading: "Impact",
            paragraphs: [
              "Locale positively impacted tens of thousands of families and individuals, along with hundreds of small businesses in California. The platform made it easy for users to discover the best local businesses and farms in their own community and across the state. Whether people were sending gifts to friends and family or coming back regularly to enjoy what we offered, the feedback was overwhelmingly positive. Every piece of the experience was thoughtfully designed.",
              "Being the only designer on board taught me how to think, make decisions, build, and iterate quickly.",
            ],
          },
          {
            type: "metrics",
            cards: [
              { value: "$10M", label: "Revenue" },
              { value: "100K+", label: "Orders delivered" },
            ],
            quote: {
              text: "“Locale, a curated food delivery start-up, has raised $14 million in a round led by Andreessen Horowitz.”",
              attribution: "[**Forbes 2022**](https://www.forbes.com/sites/jonathankeane/2022/05/17/locale-raises-14-million-for-its-curated-food-delivery-platform/)",
            },
          },
        ],
      },
    ],
  },

  "locale-2": {
    eyebrow: "Pivot",
    title: "Locale 2.0",
    subtitle: "Pivoting to prepared meals to save the business.",
    stats: [
      { label: "ARR", value: "$6M" },
      { label: "Restaurants", value: "50+" },
      { label: "Model", value: "Subscription" },
    ],
    sections: [
      {
        id: "context",
        label: "Context",
        blocks: [
          {
            type: "prose",
            heading: "Context",
            paragraphs: [
              "Long-term retention dropped from 15% to 8% when covid ended. We were burning more than $600K a month trying to grow a marketplace that didn’t have a real PMF.",
              "After digging through our data, we learned that our best customers were ordering prepared meals over one-off items like baked goods and flowers. It made perfect sense: how often are you going to order a croissant in a month versus a meal you can actually eat for dinner?",
              "We moved toward an opt-out subscription model built around prepared meals. Recurring revenue, recurring customers, and a reason to come back every week instead of every once in a while.",
            ],
          },
        ],
      },
      {
        id: "the-pivot",
        label: "The pivot",
        blocks: [
          {
            type: "prose",
            heading: "The pivot",
            paragraphs: [
              "Before committing, we had to figure out and understand what we were actually pivoting into. So we conducted a PMF survey and talked to over 100 existing customers who were ordering prepared meals.",
              "What we heard over and over was that people were tired of how much they were spending on DoorDash.",
              "We already knew how to deliver from multiple vendors in a single order — it was the core of the original marketplace. If we applied the same model to restaurants, but bundled it into one weekly delivery of prepared meals, we thought we could undercut on-demand delivery on pricing.",
              "The logistics also worked in the restaurant’s favor. Batching everything into one weekly order meant they had time to prep, cook in bulk, and schedule efficiently instead of cooking on demand.",
            ],
          },
          {
            type: "gallery",
            layout: "cols-2",
            caption: "PMF survey results & customer call notes",
            items: [
              { src: "/work/locale-2/pivot-survey.png", label: "PMF survey results", ratio: "348 / 218" },
              { src: "/work/locale-2/pivot-call-notes.png", label: "Customer call notes", ratio: "348 / 218", fit: "contain" },
            ],
          },
        ],
      },
      {
        id: "rebuilding",
        label: "Rebuilding the platform",
        blocks: [
          {
            type: "prose",
            heading: "Rebuilding the platform",
            paragraphs: [
              "This pivot snapped the Webflow camel’s back because it couldn’t do two things (cleanly) that the new model required: native user accounts and robust order management. We needed a better solution.",
              "We settled on Shopify; however, due to their lack of customization for non-technical users, we had to bring on a contractor who knew Shopify’s templating language to help us customize the front-end functionality.",
              "This let me step back into Figma for the first time in 3 years. It was sparingly used for 1.0 due to the speed we needed to ship at — most of that site was designed in the browser. It allowed for clean documentation of the design system, flows, and let me sharpen my hand off skills.",
              "Unfortunately the contractor didn’t end up as a viable long-term solution for us. Output was slow and the code was unmaintainable. Waiting on them became the bottleneck for the entire front end, so we eventually let him go, which left a gap I had to fill myself.",
            ],
          },
          {
            type: "gallery",
            layout: "stack",
            caption: "Various flows from Figma that were handed off to our developer",
            items: [
              { src: "/work/locale-2/rebuild-flow-1.png", label: "Subscription flow", ratio: "720 / 218" },
              { src: "/work/locale-2/rebuild-flow-2.png", label: "Onboarding & checkout flows", ratio: "720 / 364", fit: "contain" },
            ],
          },
        ],
      },
      {
        id: "learning-to-code",
        label: "Learning to code",
        blocks: [
          {
            type: "prose",
            heading: "Learning to code",
            paragraphs: [
              "So I learned to code!",
              "With the contractor gone and a front end that still needed building and iterating, I taught myself enough to start shipping — with help from one of my co-founders who took on the backend. Everything I’m showing on this page is my own work on the front end.",
              "Over the last year of Locale 2.0, I built and rebuilt landing pages, ran A/B tests, and shipped systems that made the subscription product work: the filtering system for meal discovery, the meal review system for returning customers, the accounts experience, and a dashboard for managing orders across different delivery days.",
              "It was the moment the design-engineer path stopped being a distant dream and started being something I could see myself executing on.",
            ],
          },
          {
            type: "gallery",
            layout: "split-left",
            caption: "Home, Dashboard & Browse page",
            items: [
              { src: "/work/locale-2/learn-homepage.png", label: "Locale 2.0 homepage", ratio: "1549 / 4096" },
              { src: "/work/locale-2/learn-dashboard.png", label: "Order dashboard", ratio: "3456 / 3414" },
              { src: "/work/locale-2/learn-browse-1.png", label: "Browse — meals", ratio: "348 / 217" },
              { src: "/work/locale-2/learn-browse-2.png", label: "Browse — filters", ratio: "348 / 217" },
            ],
          },
          {
            type: "gallery",
            layout: "cols-6",
            caption: "Mobile view",
            items: [
              { src: "/work/locale-2/mobile-dashboard.png", label: "Mobile dashboard", ratio: "860 / 1864" },
              { src: "/work/locale-2/mobile-product.png", label: "Mobile product", ratio: "860 / 1864" },
              { src: "/work/locale-2/mobile-sidecart.png", label: "Mobile side cart", ratio: "860 / 1864" },
              { src: "/work/locale-2/mobile-vendors.png", label: "Mobile vendors", ratio: "860 / 1862" },
              { src: "/work/locale-2/mobile-vendor.png", label: "Mobile vendor", ratio: "862 / 1864" },
              { src: "/work/locale-2/mobile-settings.png", label: "Mobile settings", ratio: "860 / 1864" },
            ],
          },
          {
            type: "gallery",
            layout: "grid-2x2",
            caption: "Category & Utility pages",
            items: [
              { src: "/work/locale-2/learn-all-products.png", label: "All products", ratio: "1726 / 1302" },
              { src: "/work/locale-2/learn-bakery.png", label: "Bakery category", ratio: "1726 / 1323" },
              { src: "/work/locale-2/learn-search.png", label: "Search", ratio: "1726 / 1323" },
              { src: "/work/locale-2/learn-region-selector.png", label: "Region selector", ratio: "1726 / 1323" },
            ],
          },
        ],
      },
      {
        id: "impact",
        label: "Impact",
        blocks: [
          {
            type: "prose",
            heading: "Impact & retrospect",
            paragraphs: [
              "By the end, I was designing and shipping my own work on the front end. The thing that started as a crisis became one of the most important skills I picked up at Locale.",
              "But the product never fully found its footing. Locale 2.0 was always searching for a better PMF, and our only real edge was being the cheapest way to get good prepared meals from restaurants. We told ourselves the convenient truth that “margins will get better with scale” — and they didn’t.",
            ],
          },
          {
            type: "metrics",
            cards: [
              { value: "$6M", label: "ARR" },
              { value: "50+", label: "Restaurants" },
            ],
            quote: {
              text: "“Locale, a curated food delivery start-up, has raised $14 million in a round led by Andreessen Horowitz.”",
              attribution: "Forbes 2022",
            },
          },
        ],
      },
    ],
  },

  "locale-3": {
    eyebrow: "Scale",
    title: "Locale 3.0",
    subtitle: (
      <>
        Meals designed for Longevity. This is the most recent iteration of the company — check it out at{" "}
        <a
          href="https://www.shoplocale.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2 transition-colors hover:text-accent"
        >
          shoplocale.com
        </a>
      </>
    ),
    stats: [
      { label: "ARR", value: "$40M" },
      { label: "W1 retention", value: "70%" },
      { label: "Weekly subscribers", value: "8K+" },
    ],
    sections: [
      {
        id: "context",
        label: "Context",
        blocks: [
          {
            type: "prose",
            heading: "Context",
            paragraphs: [
              "Locale 2.0 had better unit economics than the original iteration, but it wasn't going to survive. Retention wasn't where it needed to be, and acquiring customers was slow and expensive. High CAC + low LTV = you're gonna have a bad time. At the prices we were charging, there was no clear path to profitability, and raising prices on the existing model would only have made growth worse.",
              "We had about a year of runway left and small changes weren't going to save us. We needed to figure out what we should actually be, and we needed to do it fast.",
            ],
          },
        ],
      },
      {
        id: "the-final-pivot",
        label: "The final pivot",
        blocks: [
          {
            type: "prose",
            heading: "The final pivot",
            paragraphs: [
              "We ran a UX research exercise designed by Michael Margolis. It involved 20-30 in-depth conversations with the people we thought would be our ideal or “bullseye” customers. The aim was to understand what type of product would be valuable enough in their lives that whatever we built would be a no brainer.",
              "To make the conversations concrete, I helped design the interview questionnaire and made three website prototypes, each with unique value props. We put all three in front of people and observed how they reacted to each one.",
              "We took all of the data gathered from these conversations and synthesized them into insights, principles, and value props that we thought would resonate most. We learned that people valued fully organic meals high in protein, no pesticides, seed oils; ingredients that didn't make them feel groggy and spike blood sugar, something you could eat every day.",
              "Meals designed for longevity.",
              "So that became Locale, a version that was a complete opposite of 2.0 in price and value props. The highest quality, healthiest meal service.",
            ],
       
              
          },
          {
            type: "gallery",
            layout: "cols-2",
            caption: "Interview template & debrief rubric",
            items: [
              {
                src: "/work/locale-3/pivot-interview-template.png",
                label: "Interview template",
                ratio: "3456 / 2120",
              },
              {
                src: "/work/locale-3/pivot-rubric.png",
                label: "Debrief rubric",
                ratio: "3456 / 2160",
              },
            ],
          },
          {
            type: "gallery",
            layout: "cols-3",
            caption: "Prototypes used during testing",
            items: [
              {
                src: "/work/locale-3/pivot-forever.png",
                label: "Forever prototype",
                ratio: "966 / 4096",
              },
              {
                src: "/work/locale-3/pivot-fuel.png",
                label: "Fuel prototype",
                ratio: "1906 / 4096",
              },
              {
                src: "/work/locale-3/pivot-homepage.png",
                label: "Locale 2.0 homepage",
                ratio: "1549 / 4096",
              },
            ],
          },
        ],
      },
      {
        id: "rebranding",
        label: "Rebranding",
        blocks: [
          {
            type: "prose",
            heading: "Rebranding",
            paragraphs: [
              "I rebranded Locale around the new value props, redesigned the website experience, and we rebuilt the site in two weeks to start testing for viability.",
              "We wanted this to have nothing to do with 2.0, so I created a new logo and packaging, and we started putting meals in glass jars instead of plastic-sealed containers. We pushed the new identity deliberately far from the old one — we wanted an honest read on whether the product worked, not whether our existing brand or users could carry it.",
              "We ran the new model as a separate service for a few months, and the numbers told the story fast. Retention, LTV, acquisition cost, even kitchen and warehouse operations were night and day. So we shut down 2.0 completely and never looked back.",
            ],
          },
          {
            type: "image",
            src: "/work/locale-3/rebrand-guidelines.png",
            label: "Brand guidelines",
            caption: "Brand guidelines",
            ratio: "3816 / 4096",
          },
          {
            type: "gallery",
            layout: "cols-2",
            caption: "Marketing material",
            items: [
              {
                src: "/work/locale-3/rebrand-marketing-1.png",
                label: "Marketing material 1",
                ratio: "2400 / 3000",
              },
              {
                src: "/work/locale-3/rebrand-marketing-2.png",
                label: "Marketing material 2",
                ratio: "2400 / 3000",
              },
            ],
          },
        ],
      },
      {
        id: "shipping",
        label: "Shipping",
        blocks: [
          {
            type: "prose",
            heading: "Shipping",
            paragraphs: [
              "By the time we built this site, the design-handoff step that bottlenecked Locale 2.0 was gone. The user dashboard, product cards, popups, toggles and buttons, the onboarding flow that turns a first-time visitor into a subscriber — I designed and helped ship, and maintain it as one design system.",
              "The hardest part of shipping your own designs is how fast Figma goes stale once you've iterated on the product live in code. You end up in a back-and-forth between Figma artifacts and the real thing, which feels like a waste of time.",
              "Lately I've been moving the design system into Storybook so it lives in the repo instead of Figma. That's the part of my workflow I think might be the future: I explore in Figma, then implement in the actual repo with Cursor, iterating live and refining components in the place they'll tangibly exist. I've started to believe design systems belong in the repo, not outside it.",
            ],
          },
          {
            type: "image",
            src: "/work/locale-3/shipping-homepage.png",
            label: "Locale 3.0 design system",
            caption: "Homepage",
            ratio: "3456 / 2166",
          },
          {
            type: "gallery",
            layout: "grid-2x2",
            caption: "Explore, product, dashboard, reviews",
            items: [
              {
                src: "/work/locale-3/shipping-explore.png",
                label: "Explore",
                ratio: "3456 / 2166",
              },
              {
                src: "/work/locale-3/shipping-popup.png",
                label: "Product popup",
                ratio: "3454 / 2168",
              },
              {
                src: "/work/locale-3/shipping-dashboard.png",
                label: "Dashboard",
                ratio: "3456 / 2166",
              },
              {
                src: "/work/locale-3/shipping-reviews.png",
                label: "Reviews",
                ratio: "3456 / 2166",
              },
            ],
          },
        ],
      },
      {
        id: "impact",
        label: "Impact",
        blocks: [
          {
            type: "prose",
            heading: "Impact & retrospect",
            paragraphs: [
              "My branding, UX, and packaging design helped grow Locale to $40M ARR. For a year I ran operations alongside design — scaling pick-and-pack to 5,000 orders and 35,000 meals a week, growing our LA deliveries, and writing the playbook for how we expand into new regions.",
              "The current version of Locale has changed how thousands of people eat. The feedback has been overwhelmingly positive: people come to us to lose weight, build muscle, steady their energy, improve gut health, find perimenopausal support, or just eat clean, toxin-free food every day. It's still growing, and fast.",
            ],
          },
          {
            type: "metrics",
            layout: "grid-3",
            cards: [
              { value: "$40M", label: "ARR" },
              { value: "150K+", label: "Monthly site visitors" },
              { value: "24%", label: "Onboarding conversion" },
              { value: "70%", label: "W1 retention" },
              { value: "8K+", label: "Weekly subscribers" },
              { value: "700K+", label: "Meals made in 1 year" },
            ],
          },
        ],
      },
    ],
  },
};

export function getCaseStudy(slug) {
  return caseStudies[slug] ?? null;
}

export function getCaseStudySlugs() {
  return Object.keys(caseStudies);
}
