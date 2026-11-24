import { PageHeader } from "@/components/PageHeader";
import { About } from "@/sections/About";

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} title="About" />
      <About />
    </main>
  );
}
