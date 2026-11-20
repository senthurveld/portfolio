import { useEffect, useState } from "react";
import { ScrollTrigger, startSmoothScroll } from "./lib/motion";
import { startEffects } from "./lib/effects";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Skills from "./components/Skills";
import Work from "./components/Work";
import Services from "./components/Services";
import Ribbons from "./components/Ribbons";
import Testimonials from "./components/Testimonials";
import About from "./components/About";
import Experience from "./components/Experience";
import Lab from "./components/Lab";
import Guestbook from "./components/Guestbook";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import Resume from "./components/Resume";
import Toaster from "./components/Toast";

export default function App() {
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const stop = startSmoothScroll();
    const effects = startEffects();
    // Re-measure once fonts and images settle so nothing jumps.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    return () => (effects(), stop());
  }, []);

  return (
    <>
      <a href="#main" className="sr-only-focusable btn btn-primary fixed left-4 top-4 z-[1100]">
        Skip to content
      </a>
      <Nav onOpenPalette={() => setPalette(true)} />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Ribbons />
        <Services />
        <Skills />
        <Testimonials />
        <Experience />
        <Lab />
        <Guestbook />
        <Contact />
      </main>
      <Footer />
      <CommandPalette open={palette} setOpen={setPalette} />
      <Resume />
      <Toaster />
    </>
  );
}
