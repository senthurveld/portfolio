import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { services, site } from "@/content/site";
import Contact from "@/routes/Contact";
import { Lanes } from "@/sections/Services";
import { notify } from "@/lib/toast";

vi.mock("@/lib/toast", () => ({ notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  localStorage.clear();
  vi.mocked(notify.success).mockClear();
  vi.mocked(notify.error).mockClear();
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
  const whatsapp = site.whatsapp;
  afterEach(() => {
    site.whatsapp = whatsapp;
  });

  /** Reason → About you (valid) → lands on Send via. */
  async function fillToSendStep(user: ReturnType<typeof userEvent.setup>, reason: RegExp) {
    await user.click(screen.getByRole("radio", { name: reason }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.type(await screen.findByLabelText("Name"), "Asha");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Message"), "I need a five page site for my bakery.");
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByText("Send it by");
  }

  it("maps an old ?topic= link to a reason + detail and starts on About you", async () => {
    const user = userEvent.setup();
    at("/contact?topic=portfolio", <Contact />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(await screen.findByRole("radio", { name: /Freelance project/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Portfolio website" })).toBeChecked();
  });

  it("validates About you, then POSTs the email and shows the sent state", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    at("/contact", <Contact />);

    await user.click(screen.getByRole("radio", { name: /Freelance project/ }));
    await user.click(await screen.findByRole("radio", { name: "Business website" }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByLabelText("Name");
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("Add your name.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(screen.getByText(/20 characters minimum/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Asha");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Message"), "I need a five page site for my bakery.");
    await user.click(screen.getByRole("button", { name: /next/i }));

    // No WhatsApp number configured: Email is the only channel, already chosen.
    await screen.findByText("Send it by");
    expect(screen.queryByRole("radio", { name: /WhatsApp/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/contact");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ reason: "freelance", detail: "Business website", channel: "email", name: "Asha", email: "asha@example.com", website: "" });
    expect(typeof body.elapsed).toBe("number");
    expect(await screen.findByRole("status")).toHaveTextContent("Sent.");
    expect(notify.success).toHaveBeenCalledWith("Message sent", expect.any(String));
  });

  it("keeps the message and offers a mailto fallback when sending fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    at("/contact", <Contact />);
    await fillToSendStep(user, /Hiring/);
    await user.click(screen.getByRole("button", { name: /send email/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("didn't go through");
    expect(screen.getByRole("link", { name: "email me directly" }).getAttribute("href")).toMatch(/^mailto:/);
    expect(screen.getByRole("button", { name: /try again/i })).toBeEnabled();
    expect(screen.queryByRole("status")).toBeNull();
    expect(notify.error).toHaveBeenCalledOnce();
    expect(notify.success).not.toHaveBeenCalled();
  });

  it("with a WhatsApp number, pre-picks WhatsApp for urgent freelance work", async () => {
    site.whatsapp = "919876543210";
    const user = userEvent.setup();
    at("/contact", <Contact />);
    await user.click(screen.getByRole("radio", { name: /Freelance project/ }));
    await user.click(await screen.findByRole("radio", { name: "ASAP" }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.type(await screen.findByLabelText("Name"), "Asha");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Message"), "I need a five page site for my bakery.");
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByRole("radio", { name: /WhatsApp.*Suggested/ })).toBeChecked();
    expect(screen.getByText(/fastest way/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open whatsapp/i })).toBeInTheDocument();
    // A manual pick wins over the suggestion.
    await user.click(screen.getByRole("radio", { name: /Email/ }));
    expect(screen.getByRole("button", { name: /send email/i })).toBeEnabled();
  });

  it("with a WhatsApp number, opens wa.me from a real link and copies the lead to the inbox", async () => {
    site.whatsapp = "919876543210";
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    at("/contact", <Contact />);
    await fillToSendStep(user, /Just to connect/);

    // Just saying hi: email is pre-picked, but WhatsApp is one tap away.
    expect(screen.getByRole("radio", { name: /Email.*Suggested/ })).toBeChecked();
    expect(screen.getByRole("button", { name: /send email/i })).toBeEnabled();
    await user.click(screen.getByRole("radio", { name: /WhatsApp/ }));
    const link = screen.getByRole("link", { name: /open whatsapp/i });
    const href = link.getAttribute("href")!;
    expect(href.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(decodeURIComponent(href)).toContain("I'm Asha.");
    expect(link).toHaveAttribute("target", "_blank");

    link.addEventListener("click", (e) => e.preventDefault()); // jsdom can't navigate
    await user.click(link);
    expect(fetchMock).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0]![1];
    expect(init.keepalive).toBe(true);
    expect(JSON.parse(init.body)).toMatchObject({ reason: "hello", channel: "whatsapp" });
    expect(await screen.findByRole("status")).toHaveTextContent("Sent.");
    expect(screen.getByRole("link", { name: /didn't open/i })).toHaveAttribute("href", href);
  });
});
