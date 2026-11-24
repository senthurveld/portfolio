import { useEffect } from "react";
import { useLocation } from "react-router";
import { site } from "@/content/site";
import { About } from "@/sections/About";
import { ContactBlock } from "@/sections/ContactBlock";
import { Hero } from "@/sections/Hero";
import { Marquee } from "@/sections/Marquee";
import { Services } from "@/sections/Services";
import { Skills } from "@/sections/Skills";
import { Work } from "@/sections/Work";
import { scrollToTarget, useLenis } from "@/shell/scroll";

export default function Home() {
  const { hash } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    document.title = `${site.name} — ${site.role}`;
  }, []);

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector<HTMLElement>(hash);
    if (el) requestAnimationFrame(() => scrollToTarget(lenis.current, el, 1.2));
  }, [hash, lenis]);

  return (
    <>
      <Hero />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <Marquee />
        <About />
        <Services />
        <Work />
        <Skills />
        <ContactBlock />
      </main>
    </>
  );
}
