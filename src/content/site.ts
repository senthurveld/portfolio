
// All copy, links, projects. [BRACKETS] = placeholder, never rendered. Never invent facts.
export type Tech = "react" | "typescript" | "nextjs" | "tailwind" | "node" | "express" | "mongodb" | "javascript" | "zustand";

export type Project = {
  slug: string;
  n: string;
  category: string;
  year: string;
  title: string;
  pitch: string;
  stack: string[];
  href: string | null;
  repo: string | null;
  facts: [string, string][];
  note: string | null;
  sections: [string, string][];
  featured: boolean;
};

export const site = {
  name: "Senthurvel D",
  first: "Senthurvel",
  role: "Frontend & MERN Developer",
  roleShort: "Frontend developer (MERN)",
  city: "Coimbatore, India",
  email: "senthurveld2005@gmail.com",
  url: "https://senthurveldz.vercel.app",
  available: true,
  openTo: ["Chennai", "Bengaluru", "Remote"],
  pitch: "Fast, mobile-first React frontends for real clients, and the Node and MongoDB APIs behind them.",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/senthurveld", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/senthurveld2005", icon: "linkedin" },
  { label: "Email", href: "mailto:senthurveld2005@gmail.com", icon: "mail" },
] as const;

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog", hidden: true },
  { label: "Guides", href: "/guides", hidden: true },
  { label: "Free tools", href: "/tools", hidden: true },
  { label: "Now", href: "/now" },
  { label: "Contact", href: "/contact" },
];

export const menu = [
  { label: "About", href: "/about", note: "Who I am and the stack I use" },
  { label: "Projects", href: "/projects", note: "Client sites and case studies" },
  { label: "Services", href: "/services", note: "Business sites, portfolios, redesigns, freelance" },
  { label: "Contact", href: "/contact", note: "Start a project or say hello" },
];

export const hero = {
  eyebrow: "Senthur D. Vel", // One Piece-style "D." (Monkey D. Luffy)
  title: "Frontend & MERN Developer",
  sub: "UI, API, database, deploy. I build motion-rich React and TypeScript frontends, the Node and MongoDB backends behind them, and ship the whole stack to prod.",
  // Resume: replace public/resume.pdf (same name), redeploy.
  primary: { label: "Resume", href: "/resume.pdf", download: "Senthurvel-D-Resume.pdf" },
  secondary: { label: "See the work", href: "/#work" },
  media: { poster: null as string | null, video: null as string | null },
};

export const about = {
  label: "About me",
  body: [
    "I'm Senthurvel, a frontend developer crafting fast web experiences that feel effortless. I build with",
    { tech: "react", label: "React" },
    "and",
    { tech: "typescript", label: "TypeScript" },
    ", power the backend with",
    { tech: "node", label: "Node.js" },
    ", and leveling  up with",
    { tech: "nextjs", label: "Next.js" },
    ". With Clean code that pixel-perfect, zero lag - Your idea, live on every screen.",
  ] as (string | { tech: Tech; label: string })[],
  cta: "Have a site that needs to load fast on a phone?",
  ctaLink: { label: "Start a project", href: "/contact" },
  ossLabel: "Built to learn, on GitHub",
  oss: [
    {
      name: "Expense Splitter",
      note: "Vanilla JS modules, Tailwind",
      href: "https://github.com/senthurveld/expense-splitter",
    },
    {
      name: "40 Days of JavaScript",
      note: "A public, day-by-day learning log",
      href: "https://github.com/senthurveld/40-days-of-javascript-by-tapsa",
    },
    {
      name: "Mini projects",
      note: "Small UI experiments",
      href: "https://github.com/senthurveld/mini-projects",
    },
  ],
};

export const services = {
  label: "What I build",
  intro: "Websites for businesses, creators and teams who want to look legit online, load fast and turn visitors into enquiries. Pick one lane or stack a few.",
  foot: "Not sure which lane fits? Drop the brief, I'll point you to the right one.",
  footLink: { label: "Let's talk about your project", href: "/contact" },
  process: [
    ["Call", "A 20-minute call about the goal, the pages and the deadline."],
    ["Plan", "A written scope and a quote before any work starts."],
    ["Build", "Preview links as each page is done, so feedback lands early."],
    ["Launch", "Deploy, then a walkthrough so you can run the site yourself."],
  ] as [string, string][],
  lanes: [
    {
      slug: "business-websites",
      name: "Business websites",
      summary: "Look legit, get the call",
      line: "A fast, mobile-first website that tells people what you do in seconds, builds trust on first scroll and turns visitors into calls, bookings and enquiries.",
      tags: ["Mobile-first", "SEO-ready", "Conversion-focused", "Custom design"],
      includes: [
        "Pages planned around what your customers actually ask: services, pricing, reviews, location",
        "Custom design that matches your brand, no cookie-cutter templates",
        "Responsive layouts tested on real phones, tablets and desktops",
        "On-page SEO, meta tags and Google-friendly structure so people can find you",
        "Optimised images and fast load times, because slow sites lose customers",
        "Contact forms, WhatsApp and call buttons that land straight in your inbox",
      ],
    },
    {
      slug: "portfolios",
      name: "Portfolio websites",
      summary: "Your work, main-character energy",
      line: "A personal site for creatives, photographers, freelancers and devs that shows off your best work, tells your story and makes clients slide into your inbox.",
      tags: ["Personal brand", "Smooth motion", "Case studies", "Standout design"],
      includes: [
        "A layout built around your work: galleries, case studies or project grids",
        "Scroll animations and micro-interactions that feel premium, not gimmicky",
        "An about section and story that makes people remember you",
        "Fast image and video loading so your work looks crisp on any screen",
        "Personal SEO so your name shows up when clients search for you",
        "Easy to update when you've got new work to flex",
      ],
    },
    {
      slug: "redesigns",
      name: "Website redesigns",
      summary: "Same brand, glow-up edition",
      line: "Your site looks stuck in 2015? I keep what works, rebuild the rest with a modern, faster frontend and give it the glow-up your business deserves.",
      tags: ["Modern UI", "Speed boost", "React", "Tailwind"],
      includes: [
        "A full audit of your current site: design, speed, mobile and SEO",
        "A fresh, modern look that still feels like your brand",
        "Rebuilt with clean, reusable React components that are easy to maintain",
        "All your content and pages moved over, nothing lost, no broken links",
        "Noticeably faster load times and a smoother mobile experience",
        "A before/after comparison so you can see the difference",
      ],
    },
    {
      slug: "freelance",
      name: "Freelance frontend dev",
      summary: "Extra hands, zero drama",
      line: "Need a frontend dev on your team for a sprint, a launch or the long run? I plug into your workflow, ship clean React code and hit the deadline.",
      tags: ["React", "MERN", "API integration", "On-time delivery"],
      includes: [
        "Pixel-accurate React screens from your Figma designs or wireframes",
        "API integration with proper loading, error and empty states",
        "Auth flows, protected routes and dashboards",
        "Clean, readable code with Git workflow and code reviews",
        "Clear updates and preview links, so you're never left guessing",
        "Flexible engagement: one-off tasks, sprints or ongoing work",
      ],
    },
  ],
};

export const workIntro = {
  label: "Selected work",
  intro: "Client sites and full-stack builds. Each one has a case study with what I built and how.",
  allLink: "All projects",
};

export const projects: Project[] = [
  {
    slug: "thulir-media",
    n: "01",
    category: "Client work",
    year: "2026",
    title: "Thulir Media",
    pitch: "Built the whole site for a photo and film studio. Hero slider, endless marquee, buttery GSAP + Lenis scroll, booking one tap away.",
    stack: ["React", "Vite", "GSAP", "Lenis"],
    href: "https://www.thulirmedia.com/",
    repo: null,
    facts: [
      ["Role", "Web developer intern"],
      ["Scope", "Whole site, frontend"],
      ["Team", "[N] devs, [N] designer"],
      ["Timeline", "Mar 2026 – Present"],
    ],
    note: "Client code is private.",
    sections: [
      ["Overview", "The public website for Thulir Media, a photography and film studio, built during my internship there. In the same internship I built the Mother India City Shelters site and redesigned Medaac Study Abroad."],
      ["The problem", "One site had to carry several businesses, wedding photography and films, media production, studio rental and digital marketing, without burying the way to book."],
      ["What it does", "Visitors land on a thumbnail hero slider, move into each service from the menu, browse the gallery, and book a session from calls to action across the site."],
      ["How it's built", "A React single-page app built with Vite, with GSAP animation and Lenis smooth scrolling. Pages are code-split and each sets its own SEO tags."],
      ["Result", "[METRICS_THULIR — only numbers you can show.]"],
    ],
    featured: true,
  },
  {
    slug: "medaac",
    n: "02",
    category: "Client work",
    year: "2026",
    title: "Medaac Study Abroad",
    pitch: "Full UI glow-up for a study-abroad and MBBS consultancy. Rebuilt in React from reusable components, way easier to extend.",
    stack: ["React", "Tailwind CSS", "Swiper"],
    href: "https://www.medaac.com/",
    repo: null,
    facts: [
      ["Role", "Web developer intern"],
      ["Scope", "Full UI redesign"],
    ],
    note: null,
    sections: [
      ["Overview", "A redesign of Medaac's website, done during my internship at Thulir Media. Medaac guides students from Kerala to MBBS and other degrees abroad."],
      ["The problem", "The existing frontend felt dated and was hard to extend."],
      ["What it does", "Students browse courses and destination countries such as Georgia, Tajikistan and Uzbekistan, and can send an enquiry from any page."],
      ["How it's built", "React with React Router and Tailwind CSS, rebuilt from reusable components, with Swiper for the sliders."],
      ["Result", "[METRICS_MEDAAC — only numbers you can show.]"],
    ],
    featured: true,
  },
  {
    slug: "bharathi-studio",
    n: "03",
    category: "Client work",
    year: "2025",
    title: "Bharathi Studio",
    pitch: "Wedding and event photo studio site. Hero carousel, packages, full-screen gallery, and pre-booking that slides into WhatsApp.",
    stack: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    href: "https://senthurveld.github.io/photography-site/",
    repo: "https://github.com/senthurveld/photography-site",
    facts: [
      ["Role", "Sole developer"],
      ["Client", "Wedding and event photography studio"],
    ],
    note: null,
    sections: [
      ["Overview", "A website for Bharathi Studio, a wedding and event photography studio, built end to end."],
      ["What it does", "A hero carousel opens on the studio's work, followed by services, wedding packages and a gallery that opens any photo full screen. Visitors can pre-book on WhatsApp or call straight from the page."],
      ["How it's built", "Plain HTML, CSS and JavaScript on Bootstrap 5, with a small script for the gallery viewer. Hosted on GitHub Pages."],
    ],
    featured: true,
  },
  {
    slug: "aswin-portfolio",
    n: "04",
    category: "Client work",
    year: "2026",
    title: "Aswin Kumar",
    pitch: "Gen AI engineer's portfolio. Sky hero with flying birds, a drag-anywhere case-study carousel, and contact that flies off as a paper plane.",
    stack: ["React", "Tailwind CSS", "GSAP", "Lenis"],
    href: "https://aswins-portfli0.vercel.app/",
    repo: "https://github.com/aswinkumar-analyst/aswin-portfolio",
    facts: [
      ["Role", "Sole developer"],
      ["Client", "Gen AI and automation engineer"],
      ["Motion", "GSAP ScrollTrigger + Lenis"],
    ],
    note: null,
    sections: [
      ["Overview", "A one-page portfolio for Aswin Kumar, a Gen AI and automation engineer, built to show his RAG agents, computer-vision models and LLM automations as full case studies."],
      ["The problem", "Each AI project has its own architecture, numbers and trade-offs, and all of it had to read as a proper case study without sending visitors off the page."],
      ["What it does", "An ASCII-hands boot screen hands off to a sky hero with animated birds and a plane trailing a hire-me banner. About pins on scroll with a word-by-word reveal and skill marquees. The work lives in a draggable, infinite carousel; each card morphs into a case-study dialog with chapter tabs, video and animated diagrams, and its own shareable link. The contact form sends with a paper-plane animation."],
      ["How it's built", "React 19 on Vite with Tailwind CSS v4, GSAP ScrollTrigger and Lenis smooth scrolling. Messages go through Web3Forms with clear error toasts, and every animation respects reduced-motion settings. Hosted on Vercel."],
    ],
    featured: true,
  },
  {
    slug: "dinesh-portfolio",
    n: "05",
    category: "Client work",
    year: "2026",
    title: "Dinesh R",
    pitch: "Video editor's portfolio. Edit-suite boot screen, WebGL particle hero, and reels you can play right on the page, sorted by vibe.",
    stack: ["React", "GSAP", "OGL", "React Router"],
    href: "https://dinesh-editor-portfolio.netlify.app/",
    repo: "https://github.com/dineshtheeditor01/DineshPortfolio",
    facts: [
      ["Role", "Sole developer"],
      ["Client", "Video editor and motion designer"],
      ["Graphics", "WebGL particles via OGL"],
    ],
    note: null,
    sections: [
      ["Overview", "A portfolio for Dinesh R, a video editor, motion graphics designer and graphics designer, built to put his reels front and centre."],
      ["What it does", "A loading screen styled like an edit suite, with HUD labels, status lines and fuzzy glitch text, opens onto a hero with a WebGL particle field. Visitors scroll through a marquee, featured work, about and his toolkit, from After Effects and Premiere Pro to DaVinci Resolve, then reach him by email or WhatsApp. A separate works page groups his edits by category, from motion reels to documentaries and ad films, each with a video preview and a link to the full folder."],
      ["How it's built", "React 19 on Vite with React Router, with the works page lazy-loaded. GSAP ScrollTrigger drives the reveals, OGL renders the particles, and a custom cursor and scroll progress bar sit on top. On phones the nav turns into a bottom dock. Images and videos are compressed by scripts in the repo. Hosted on Netlify."],
    ],
    featured: true,
  },
  {
    slug: "musix",
    n: "07",
    category: "Full-stack",
    year: "2026",
    title: "Musix",
    pitch: "Full-stack music search. One query hits YouTube and the Internet Archive, keys stay server-side, JWT sign-in built in.",
    stack: ["React", "Express", "MongoDB", "Zustand"],
    href: null,
    repo: "https://github.com/senthurveld/music-app",
    facts: [
      ["Role", "Solo, full-stack"],
      ["Search", "YouTube Data API + Internet Archive, via the server"],
      ["Auth", "JWT cookie, email verification, password reset"],
    ],
    note: null,
    sections: [
      ["Overview", "A full-stack music search app built during and beyond a MERN course."],
      ["The problem", "Search and play any song without putting an API key in the browser."],
      ["What it does", "Sign up, verify your email, then search. Pick YouTube, the Internet Archive or both; results come back as track cards that play in YouTube's embedded player or a native audio player. A toggle switches between dark and light themes."],
      ["How it's built", "One Express route searches the YouTube Data API (music category) and the Internet Archive's advanced search, then returns tidy, merged track data. The client is React 19 with a Zustand auth store, protected routes, Tailwind CSS and Framer Motion. JWTs live in an httpOnly cookie, passwords are hashed with bcrypt, Mailtrap sends the verification and reset emails, and users are stored in MongoDB through Mongoose."],
      ["Result", "[METRICS_MUSIX — deployed URL, users, response times.]"],
    ],
    featured: true,
  }, 
  {
    slug: "country-explorer",
    n: "06",
    category: "Side project",
    year: "2025",
    title: "Country Explorer",
    pitch: "Type a country, get the vibe check: flag, capital, population, all pinned on a Leaflet map. Vanilla async/await JS.",
    stack: ["JavaScript", "REST Countries API", "Leaflet"],
    href: "https://senthurveld.github.io/country-explorer/",
    repo: "https://github.com/senthurveld/country-explorer",
    facts: [["Role", "Solo"]],
    note: null,
    sections: [
      ["Overview", "A small app that turns a public API into something you'd actually click around in."],
      ["What it does", "Search and detail views for every country, with its location on an interactive map."],
      ["How it's built", "Plain JavaScript with async/await against the REST Countries API, and Leaflet for maps."],
    ],
    featured: true,
  },
];

export const contact = {
  label: "Start a project",
  heading: "Have something that needs building?",
  intro: "Tell me what you need. I read and answer every message myself.",
  availability: "Available for new work",
  link: { label: "Start a conversation", href: "/contact" },
  topics: [
    { id: "role", label: "A role on your team" },
    { id: "internship", label: "Internship" },
    { id: "website", label: "Business website" },
    { id: "portfolio", label: "Portfolio website" },
    { id: "redesign", label: "Redesign" },
    { id: "freelance", label: "Freelance project" },
    { id: "hello", label: "Just saying hi" },
  ],
  looking: ["Full-time", "Freelance", "Internship", "Not sure yet"],
  timeline: ["ASAP", "Within a month", "1–3 months", "Flexible"],
  steps: ["Topic", "Details", "About you", "Message"],
  sent: "Your mail app should open with everything filled in. If it didn't, email me directly:",
};

export const now = {
  updated: "November 2026",
  items: [
    { label: "Working", text: "Web developer intern at Thulir Media, building client frontends." },
    { label: "Looking", text: "Open to frontend roles in Chennai, Bengaluru or remote." },
    { label: "Watching", text: "One Piece." },
  ],
};

export const path = [
  { dates: "Mar 2026 – Present", title: "Web Developer Intern", org: "Thulir Media Pvt. Ltd." },
  { dates: "[Mon YYYY] – [Mon YYYY]", title: "MERN Full Stack Developer course", org: "Apex Sys, Coimbatore" },
  { dates: "Aug 2022 – May 2025", title: "B.Sc. Information Technology", org: "Coimbatore" },
];

export type SkillIcon =
  | "html" | "css" | "javascript" | "typescript" | "react" | "tailwind" | "zustand" | "motion" | "three" | "leaflet"
  | "node" | "express" | "mongodb" | "rest"
  | "git" | "github" | "vite" | "vercel";

export const skills = {
  label: "Toolkit",
  intro: "What I build with day to day: a React and TypeScript front end, a Node and MongoDB back end, shipped through Git and Vercel.",
  groups: [
    {
      name: "Frontend",
      items: [
        { label: "HTML", icon: "html" },
        { label: "CSS", icon: "css" },
        { label: "JavaScript", icon: "javascript" },
        { label: "TypeScript", icon: "typescript" },
        { label: "React", icon: "react" },
        { label: "Tailwind CSS", icon: "tailwind" },
        { label: "Zustand", icon: "zustand" },
        { label: "Motion", icon: "motion" },
        { label: "Three.js", icon: "three" },
        { label: "Leaflet", icon: "leaflet" },
      ],
    },
    {
      name: "Backend",
      items: [
        { label: "Node.js", icon: "node" },
        { label: "Express", icon: "express" },
        { label: "MongoDB", icon: "mongodb" },
        { label: "REST APIs", icon: "rest" },
      ],
    },
    {
      name: "Tooling",
      items: [
        { label: "Git", icon: "git" },
        { label: "GitHub", icon: "github" },
        { label: "Vite", icon: "vite" },
        { label: "Vercel", icon: "vercel" },
      ],
    },
  ] satisfies { name: string; items: { label: string; icon: SkillIcon }[] }[],
};

export const footer = {
  globe: { label: "Based in India", title: "Coimbatore, India", zone: "IST · UTC+05:30", openLabel: "Open to", locate: "Back to Coimbatore", hint: "Drag to spin" },
};

export const posts: { slug: string; title: string; dek: string; date: string; minutes: number; category: string }[] = [];
export const guides: { slug: string; title: string; dek: string }[] = [];
export const tools: { slug: string; title: string; dek: string }[] = [];
