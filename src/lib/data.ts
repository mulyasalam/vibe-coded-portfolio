export type Project = {
  id: string;
  index: string;
  title: string;
  client: string;
  year: number;
  category: string;
  href: string;
  image: string;
  tech: string[];
  summary: string;
};

export const profile = {
  name: "Mulya Salam",
  shortName: "M.S.",
  role: "Vibe Coder",
  city: "Germany",
  locale: "CET",
  bio: "I ship small, sharp products by vibe coding — prompting AI, steering the model, and finishing the details by hand.",
  longBio:
    "I’m a self-taught builder who works almost entirely by vibe coding — describing what I want, letting the model draft it, and then taste-testing every pixel and prop. The result is a stream of small, opinionated apps shipped quickly without giving up the craft.",
  cv: "/cv.pdf",
  email: "mulyasalam48@gmail.com",
  socials: [
    { label: "LinkedIn", handle: "in/mulya", href: "https://linkedin.com" },
    { label: "GitHub", handle: "@mulyasalam", href: "https://github.com" },
    { label: "Instagram", handle: "@mulya", href: "https://instagram.com" },
    { label: "X / Twitter", handle: "@mulya", href: "https://x.com" },
  ],
};

export const projects: Project[] = [
  {
    id: "p01",
    index: "01",
    title: "Lentera Archive",
    client: "Side project",
    year: 2025,
    category: "Editorial / CMS",
    href: "https://example.com/lentera",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
    tech: ["Next.js", "Sanity", "MapLibre", "Tailwind"],
    summary:
      "A public archive that surfaces twenty-thousand letters, photographs, and oral histories — drafted with Claude, shaped by hand.",
  },
  {
    id: "p02",
    index: "02",
    title: "Pinjam Ledger",
    client: "Client work",
    year: 2024,
    category: "Fintech / Dashboard",
    href: "https://example.com/pinjam",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1600&q=80",
    tech: ["React", "tRPC", "PostgreSQL", "Drizzle"],
    summary:
      "Operational dashboard rebuilt in a weekend of paired prompting — underwriting decisions in 38 seconds instead of 11 minutes.",
  },
  {
    id: "p03",
    index: "03",
    title: "Rumah Tujuh Belas",
    client: "Studio site",
    year: 2024,
    category: "Marketing",
    href: "https://example.com/rt17",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
    tech: ["Next.js", "GSAP", "Cloudinary"],
    summary:
      "Monograph-style studio site with a slow-cinema scroll narrative — fully vibe-coded across one long evening.",
  },
  {
    id: "p04",
    index: "04",
    title: "Saji — Recipe OS",
    client: "Personal",
    year: 2023,
    category: "Product / Mobile",
    href: "https://example.com/saji",
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1600&q=80",
    tech: ["Expo", "React Native", "SQLite", "Zustand"],
    summary:
      "An offline-first recipe OS for home cooks. Prompted into existence, polished by hand, 90k installs.",
  },
  {
    id: "p05",
    index: "05",
    title: "Kabar — Newsroom CMS",
    client: "Client work",
    year: 2023,
    category: "Editorial / CMS",
    href: "https://example.com/kabar",
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80",
    tech: ["Remix", "Payload", "Vercel"],
    summary:
      "A bespoke newsroom CMS for 40 desk editors — every screen first sketched in a prompt, then handed off to ship.",
  },
  {
    id: "p06",
    index: "06",
    title: "Cetak Type Specimen",
    client: "Side project",
    year: 2022,
    category: "Type / Editorial",
    href: "https://example.com/cetak",
    image:
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1600&q=80",
    tech: ["Astro", "MDX", "Vercel"],
    summary:
      "An interactive type specimen with trial downloads — proof that a weekend of vibe coding can ship a real product.",
  },
];

export const tickerWords = [
  "Vibe coded",
  "Prompted, polished, shipped",
  "Open to small briefs",
  "AI-native craft",
  "Built with Claude & Codex",
  "Germany · CET",
];
