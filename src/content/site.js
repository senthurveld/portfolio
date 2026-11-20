// Facts come from Senthurvel's résumé. Anything in [BRACKETS] is a placeholder to fill — never invent it.
export const site = {
  name: "Senthurvel D",
  short: "senthurvel",
  role: "Frontend developer (MERN)",
  city: "Coimbatore",
  email: "senthurveld2005@gmail.com",
  github: "https://github.com/senthurveld",
  githubUser: "senthurveld",
  // Given as in.linkedin.com/senthurveld2005 — normalised to the /in/ profile form. Verify.
  linkedin: "https://www.linkedin.com/in/senthurveld2005",
  url: "https://senthurveldz.vercel.app",
  openTo: ["Chennai", "Bengaluru", "Remote"],
};

// Small things built to learn. Real repos on GitHub.
export const lab = [
  {
    name: "Expense Splitter",
    desc: "Split bills between friends. Vanilla JS modules and classes, Tailwind, Lucide icons, a tiny toast API.",
    tags: ["JS", "Tailwind", "Vite"],
    href: "https://github.com/senthurveld/expense-splitter",
  },
  {
    name: "Library System",
    desc: "[One line: what it manages and the JS concept it practised.]",
    tags: ["JS", "Vite"],
    href: "https://github.com/senthurveld/library-system",
  },
  {
    name: "40 Days of JavaScript",
    desc: "A public learning log: every exercise from the tapaScript 40-day course, committed day by day.",
    tags: ["JS", "Fundamentals"],
    href: "https://github.com/senthurveld/40-days-of-javascript-by-tapsa",
  },
  {
    name: "Mini projects",
    desc: "A drawer of small UI experiments — components, layouts and interactions tried in isolation.",
    tags: ["HTML", "CSS", "JS"],
    href: "https://github.com/senthurveld/mini-projects",
  },
];

// Tech balls for the playground. `tone` maps to a pastel token.
// Frontend first, MERN second — order and size follow that.
export const stack = [
  { id: "react", label: "React", tone: "periwinkle", r: 1.25 },
  { id: "js", label: "JavaScript", tone: "lemon", r: 1.15 },
  { id: "tailwind", label: "Tailwind", tone: "sky", r: 1.1 },
  { id: "node", label: "Node.js", tone: "mint", r: 1.0 },
  { id: "mongodb", label: "MongoDB", tone: "lemon", r: 1.0 },
  { id: "express", label: "Express", tone: "bubblegum", r: 0.95 },
  { id: "vite", label: "Vite", tone: "coral", r: 0.9 },
  { id: "git", label: "Git", tone: "mint", r: 0.85 },
  { id: "rest", label: "REST", tone: "lemon", r: 0.9 },
  { id: "zustand", label: "Zustand", tone: "coral", r: 0.95 },
  { id: "jwt", label: "JWT", tone: "periwinkle", r: 0.8 },
  { id: "mysql", label: "MySQL", tone: "sky", r: 0.9 },
  { id: "postman", label: "Postman", tone: "bubblegum", r: 0.9 },
  { id: "html", label: "HTML5", tone: "coral", r: 0.95 },
  { id: "css", label: "CSS3", tone: "sky", r: 0.95 },
];

export const experience = [
  {
    n: "01",
    tone: "bubblegum",
    dates: "Mar 2026 – Present",
    title: "Web Developer Intern",
    org: "Thulir Media Pvt. Ltd.",
    summary:
      "Built the Thulir Media and Mother India City Shelters websites end to end on the frontend, and redesigned the Medaac Study Abroad Consultancy frontend.",
    details: [
      "Frontend implementation and responsive design for two client websites.",
      "Rebuilt Medaac's UI with modern layouts and reusable components.",
      "[What I owned vs the team — pages, components, deployment]",
    ],
  },
  {
    n: "02",
    tone: "lemon",
    dates: "[Mon YYYY] – [Mon YYYY]",
    title: "MERN Full Stack Developer course",
    org: "Apex Sys, Coimbatore",
    summary:
      "Completed the MERN stack track: React, Express, Node.js and MongoDB, with REST APIs and auth.",
    details: ["Musix grew out of this course — then went further than the syllabus."],
  },
  {
    n: "03",
    tone: "sky",
    dates: "Aug 2022 – May 2025",
    title: "B.Sc. Information Technology",
    org: "[College], Coimbatore",
    summary: "GPA 7.22 / 10.",
    details: ["[One line on relevant coursework or a final-year project]"],
  },
];

/** Placeholder guard: returns the string only when it has no [BRACKET] left in it. */
export const real = (s) => (typeof s === "string" && s.trim() && !/\[[^\]]*\]/.test(s) ? s : null);

// Client sites from the résumé. `href` stays null until the live URL is confirmed — no link is shown without one.
export const clients = [
  { name: "Thulir Media", kind: "Agency website", href: null },
  { name: "Mother India City Shelters", kind: "Non-profit website", href: null },
  { name: "Medaac Study Abroad", kind: "Frontend redesign", href: null },
  { name: "Bharathi Photography", kind: "Studio portfolio", href: null },
];

// What a client can hire me for. No prices on purpose: every quote follows a short call.
export const services = [
  {
    name: "Business websites",
    tagline: "Your business, explained clearly",
    line: "A fast, mobile-first site that explains what you do and gets you enquiries.",
    tags: ["Design to code", "Responsive", "SEO basics"],
    tone: "lemon",
  },
  {
    name: "Landing pages",
    tagline: "One page, one job",
    line: "One page for one launch, offer or campaign, built to load quickly on a phone.",
    tags: ["Copy-led layout", "Forms", "Analytics"],
    tone: "bubblegum",
  },
  {
    name: "Redesigns",
    tagline: "Same content, a better frontend",
    line: "Keep your content, replace the dated frontend with clean, reusable components.",
    tags: ["React", "Tailwind", "Components"],
    tone: "sky",
  },
  {
    name: "Frontend for your product",
    tagline: "From interface to API",
    line: "React screens wired to your API, with auth, state and the edge cases handled.",
    tags: ["React", "REST", "MERN"],
    tone: "mint",
  },
];

// How a project runs. Edit freely; keep it true.
export const process = [
  ["Call", "A 20-minute call about the goal, the pages and the deadline."],
  ["Plan", "A written scope and a quote before any work starts."],
  ["Build", "Preview links as each page is done, so feedback lands early."],
  ["Launch", "Deploy, then a walkthrough so you can run the site yourself."],
];

// Client quotes, exactly as the client wrote them, with permission. The section stays hidden while this is empty.
// { quote: "...", name: "Full name", role: "Role", org: "Company" }
export const testimonials = [];

// "Currently" list on the poster's back and in the footer.
export const currently = [
  { kind: "Watching", title: "One Piece" },
];

// Guestbook via Giscus (GitHub Discussions). Fill all four from https://giscus.app to switch the section on.
export const giscus = {
  repo: "", // "senthurveld/portfolio-guestbook"
  repoId: "",
  category: "", // "Guestbook"
  categoryId: "",
};
