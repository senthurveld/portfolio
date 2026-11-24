// Route chunks: lazy routes, idle prefetch, transitions await preloadRoute() under cover.
export const pages = {
  about: () => import("./AboutPage"),
  contact: () => import("./Contact"),
  now: () => import("./Now"),
  project: () => import("./Project"),
  projects: () => import("./Projects"),
  service: () => import("./Service"),
  services: () => import("./ServicesPage"),
  simple: () => import("./Simple"),
};

function loaderFor(pathname: string) {
  const [, first = "", second] = pathname.split("/");
  if (first === "") return null;
  if (first === "projects") return second ? pages.project : pages.projects;
  if (first === "services") return second ? pages.service : pages.services;
  if (first === "about" || first === "contact" || first === "now") return pages[first];
  return pages.simple;
}

export function preloadRoute(href: string): Promise<unknown> {
  const load = loaderFor(new URL(href, location.href).pathname);
  return load ? load().catch(() => {}) : Promise.resolve();
}
