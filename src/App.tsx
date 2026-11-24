import { lazy, Suspense, useEffect, useState } from "react";
import { LazyMotion } from "motion/react";
import { Route, Routes, useLocation } from "react-router";
import Home from "./routes/Home";
import { pages } from "./routes/load";
import { Cursor } from "./shell/Cursor";
import { Fabs } from "./shell/Fabs";
import { Footer } from "./shell/Footer";
import { Nav } from "./shell/Nav";
import { PageTransition } from "./shell/PageTransition";
import { useIntroReady } from "./shell/intro";
import { Preloader } from "./shell/Preloader";
import { jumpToTop, SmoothScroll, useLenis } from "./shell/scroll";

const CommandPalette = lazy(() => import("./shell/CommandPalette"));
const AboutPage = lazy(pages.about);
const Contact = lazy(pages.contact);
const Now = lazy(pages.now);
const Project = lazy(pages.project);
const Projects = lazy(pages.projects);
const Service = lazy(pages.service);
const ServicesPage = lazy(pages.services);
const Privacy = lazy(() =>
  pages.simple().then((m) => ({ default: m.Privacy })),
);
const Listing = lazy(() =>
  pages.simple().then((m) => ({ default: m.Listing })),
);
const NotFoundPage = lazy(() =>
  pages.simple().then((m) => ({ default: m.NotFoundPage })),
);

function usePrefetchRoutes() {
  const ready = useIntroReady();
  useEffect(() => {
    if (!ready) return;
    let timer = 0;
    const run = () =>
      Object.values(pages).forEach((load) => void load().catch(() => {}));
    const hasIdle = "requestIdleCallback" in window;
    const schedule = () =>
      (timer = hasIdle
        ? requestIdleCallback(run, { timeout: 4000 })
        : window.setTimeout(run, 2000));
    const delay = window.setTimeout(schedule, 3000);
    return () => {
      clearTimeout(delay);
      if (hasIdle) cancelIdleCallback(timer);
      else clearTimeout(timer);
    };
  }, [ready]);
}
const loadFeatures = () => import("./motion-features").then((m) => m.default);

function ScrollTop() {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    if (!hash) jumpToTop(lenis.current);
  }, [pathname, hash, lenis]);
  return null;
}

function Palette() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setArmed(true);
        setOpen((o) => !o);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  return armed ? (
    <Suspense fallback={null}>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </Suspense>
  ) : null;
}

export default function App() {
  usePrefetchRoutes();
  return (
    <LazyMotion features={loadFeatures} strict>
      <SmoothScroll>
        <a
          href="#main"
          className="fixed top-3 left-3 z-[300] -translate-y-24 rounded-full bg-steel px-4 py-2 text-sm font-semibold text-ink focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <div aria-hidden="true" className="site-grain" />
        <Preloader />
        <Nav />
        <ScrollTop />
        <Suspense
          fallback={
            <div className="grid min-h-svh place-items-center" role="status" aria-label="Loading page">
              <span aria-hidden="true" className="load-line" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<Project />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<Service />} />
            <Route path="/now" element={<Now />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Listing kind="blog" />} />
            <Route path="/guides" element={<Listing kind="guides" />} />
            <Route path="/tools" element={<Listing kind="tools" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
        <Fabs />
        <Cursor />
        <PageTransition />
        <Palette />
      </SmoothScroll>
    </LazyMotion>
  );
}
