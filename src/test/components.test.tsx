import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { services } from "@/content/site";
import Contact from "@/routes/Contact";
import { Lanes } from "@/sections/Services";

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  localStorage.clear();
});

const at = (path: string, el: React.ReactElement) =>
  render(<RouterProvider router={createMemoryRouter([{ path: "*", element: el }], { initialEntries: [path] })} />);

describe("Lanes accordion", () => {
  it("opens lane 01 by default, one at a time, and can close all", async () => {
    at("/", <Lanes />);
    const [a, b] = services.lanes.map((l) => screen.getByRole("button", { name: new RegExp(l.name) }));
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(a!.getAttribute("aria-controls")!)).toHaveTextContent(services.lanes[0]!.line);
    await userEvent.click(b!);
    expect(b).toHaveAttribute("aria-expanded", "true");
    expect(a).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(b!);
    expect(b).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Contact form", () => {
  it("prefills the topic from ?topic= and starts on step 2", () => {
    at("/contact?topic=portfolio", <Contact />);
    expect(screen.getByRole("radio", { name: "Full-time" })).toBeInTheDocument();
  });

  it("blocks step 3 until name and email are valid, then opens mailto with the details", async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    Object.defineProperty(window, "location", { value: { ...window.location, set href(v: string) { assign(v); } }, writable: true });
    at("/contact", <Contact />);

    await user.click(screen.getByRole("radio", { name: "Business website" }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(await screen.findByRole("radio", { name: "Freelance" }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    await screen.findByLabelText("Name");
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("Add your name.")).toBeInTheDocument();

    await user.type(await screen.findByLabelText("Name"), "Asha");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await user.type(await screen.findByLabelText("Message"), "Too short");
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByText(/20 characters minimum/)).toBeInTheDocument();
    expect(assign).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Message"), " — I need a five page site for my bakery.");
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(assign).toHaveBeenCalledOnce();
    const href = decodeURIComponent(assign.mock.calls[0]![0] as string);
    expect(href).toContain("Business website — Asha");
    expect(href).toContain("Looking for: Freelance");
    expect(screen.getByRole("status")).toHaveTextContent("Almost there");
  });
});
