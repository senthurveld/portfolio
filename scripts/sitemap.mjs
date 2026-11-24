// Prebuild: public/sitemap.xml from site.ts. Node >= 22.18.
import { writeFileSync } from "node:fs";
import { projects, services, site } from "../src/content/site.ts";

const today = new Date().toISOString().slice(0, 10);
const paths = ["/", "/about", "/projects", "/services", "/contact", "/now", ...projects.map((p) => `/projects/${p.slug}`), ...services.lanes.map((s) => `/services/${s.slug}`)];
const urls = paths.map((p) => `  <url><loc>${site.url}${p === "/" ? "/" : p}</loc><lastmod>${today}</lastmod></url>`).join("\n");

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`sitemap.xml: ${paths.length} urls`);
