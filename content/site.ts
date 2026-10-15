export interface Profile {
  name: string;
  about: string[];
  email: string;
  linkedin: string;
  linkedinLabel: string;
  resume: string;
  resumeLabel: string;
}

export interface WorkItem {
  slug: string;
  title: string;
  subtitle: string;
  stats: string;
  year: string;
  media?: string;
  mediaFit: "cover" | "contain";
  // External URL; items without one link to their /work/[slug] case study.
  href?: string;
}

export const profile: Profile = {
  name: "Avto Grigolia",
  about: [
    "I'm a product designer drawn to 0→1 problems. As Locale's solo creative since 2020, I've owned design and front-end engineering throughout the company's evolution: designing data-driven UX and UI, developing design systems, and creating the brand and visual identity from scratch. Everything I build starts with the customer and ends with shipped code.",
  ],
  email: "a.grigolia123@gmail.com",
  linkedin: "https://www.linkedin.com/in/avto-grigolia/",
  linkedinLabel: "LinkedIn",
  resume: "https://drive.google.com/file/d/1ZjKnZtu8lTu3LETFbj3gkedrqcjuzSbt/view",
  resumeLabel: "Resume",
};

export const work: WorkItem[] = [
  {
    slug: "locale-3",
    title: "Locale 3.0",
    subtitle: "Final pivot & finding PMF",
    stats: "$40M ARR • 70% M1 retention",
    year: "2026",
    media: "https://media.tbsdesigngallery.com/avto-v3-hero-video.mp4",
    mediaFit: "cover",
  },
  {
    slug: "locale-2",
    title: "Locale 2.0",
    subtitle: "Pivoting to prepared meals",
    stats: "$6M ARR • Learned to code",
    year: "2023",
    media: "/work/locale-2/marketing.jpg",
    mediaFit: "cover",
  },
  {
    slug: "locale-1",
    title: "Locale 1.0",
    subtitle: "Building a marketplace without engineers",
    stats: "$14M raised • $74M valuation",
    year: "2020",
    media: "https://media.tbsdesigngallery.com/avto-v1-hero-video.mp4",
    mediaFit: "cover",
  },
  {
    slug: "d-ford",
    title: "D-Ford",
    subtitle: "Exploring the future of mobility",
    stats: "3 projects • Field research",
    year: "2019",
    media: "/work/d-ford/ford-oval.png",
    mediaFit: "cover",
  },
];

export const sideProjects: WorkItem[] = [
  {
    slug: "tbs-design-gallery",
    title: "TBS Design Gallery",
    subtitle: "Luxury design showroom",
    stats: "Next.js • Payload CMS",
    year: "2026",
    media: "https://media.tbsdesigngallery.com/custom-cabinetry-hero.mp4",
    mediaFit: "cover",
    href: "https://tbsdesigngallery.com/",
  },
  {
    slug: "amya-agency",
    title: "Amya Agency",
    subtitle: "Headhunting agency for tech companies",
    stats: "Next.js • Branding",
    year: "2026",
    media: "/work/amya-agency/cover.png",
    mediaFit: "cover",
  },
];
