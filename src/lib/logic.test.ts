import { describe, expect, it } from "vitest";
import {
  contactMailto,
  contactSubject,
  contactSummary,
  cursorModeFor,
  istTime,
  navVisible,
  neighbours,
  real,
  reasonFromParam,
  revealRadius,
  splitRows,
  stackDim,
  stackScale,
  suggestChannel,
  validateContact,
  whatsappLink,
  wrap,
  type ContactDraft,
} from "./logic";

describe("real()", () => {
  it("drops empty and [BRACKET] placeholders", () => {
    expect(real("Solo")).toBe("Solo");
    expect(real("")).toBeNull();
    expect(real(undefined)).toBeNull();
    expect(real("[Year]")).toBeNull();
  });
});

describe("navVisible()", () => {
  it("is always visible near the top", () => expect(navVisible(30, 40, false)).toBe(true));
  it("ignores small deltas", () => expect(navVisible(500, 5, false)).toBe(false));
  it("hides on scroll down, shows on scroll up", () => {
    expect(navVisible(500, 20, true)).toBe(false);
    expect(navVisible(500, -20, false)).toBe(true);
  });
});

describe("revealRadius()", () => {
  it("reaches the farthest viewport corner", () => {
    expect(revealRadius(0, 0, 300, 400)).toBe(500);
    expect(revealRadius(300, 400, 300, 400)).toBe(500);
  });
});

describe("marquee helpers", () => {
  it("wraps an offset into [-half, 0)", () => {
    expect(wrap(-120, 100)).toBe(-20);
    expect(wrap(30, 100)).toBe(-70);
    expect(wrap(0, 100)).toBe(0);
  });
  it("splits items into two rows, first gets the ceiling", () => {
    expect(splitRows([1, 2, 3, 4, 5])).toEqual([[1, 2, 3], [4, 5]]);
    expect(splitRows([1, 2, 3])).toEqual([[1, 2, 3]]);
  });
});

describe("stack math", () => {
  it("scales earlier cards down 4% per card behind", () => {
    expect(stackScale(0, 4)).toBeCloseTo(0.88);
    expect(stackScale(3, 4)).toBe(1);
  });
  it("dims earlier cards up to 50%", () => {
    expect(stackDim(0, 5)).toBe(0.5);
    expect(stackDim(3, 5)).toBeCloseTo(0.16);
    expect(stackDim(4, 5)).toBe(0);
  });
});

describe("cursorModeFor()", () => {
  const el = (html: string) => {
    document.body.innerHTML = html;
    return document.querySelector("[data-t]") as Element;
  };
  it("labels cards", () => expect(cursorModeFor(el(`<div data-cursor="View"><span data-t>x</span></div>`))).toEqual({ mode: "label", label: "View" }));
  it("uses text for inputs", () => expect(cursorModeFor(el(`<input data-t />`)).mode).toBe("text"));
  it("uses link for buttons and links", () => expect(cursorModeFor(el(`<a href="#" data-t>x</a>`)).mode).toBe("link"));
  it("hides inside data-cursor=none", () => expect(cursorModeFor(el(`<div data-cursor="none"><p data-t>x</p></div>`)).mode).toBe("hidden"));
  it("defaults otherwise", () => expect(cursorModeFor(el(`<p data-t>x</p>`)).mode).toBe("default"));
});

describe("validateContact()", () => {
  const ok = { name: "Asha", email: "asha@example.com", message: "I need a five page site for my bakery." };
  it("accepts a valid message", () => expect(validateContact(ok)).toEqual({}));
  it("requires name, a valid email and 20+ character message", () => {
    expect(validateContact({ name: " ", email: "nope", message: "short" })).toEqual({
      name: expect.any(String),
      email: expect.any(String),
      message: expect.any(String),
    });
  });
});

describe("validateContact() caps", () => {
  it("rejects an over-long name or message", () => {
    const e = validateContact({ name: "a".repeat(101), email: "a@b.co", message: "x".repeat(4001) });
    expect(Object.keys(e).sort()).toEqual(["message", "name"]);
  });
});

const draft = (over: Partial<ContactDraft> = {}): ContactDraft => ({
  reason: "freelance",
  detail: "Portfolio website",
  timeline: "",
  name: "Asha",
  email: "a@b.co",
  company: "",
  message: "Hello there",
  channel: "email",
  ...over,
});

describe("contactSubject()", () => {
  it("leads with the short reason tag and the filled follow-ups", () => {
    expect(contactSubject(draft({ timeline: "ASAP", company: "Acme" }))).toBe("[Freelance · Portfolio website · ASAP] Asha (Acme)");
    expect(contactSubject(draft({ reason: "hello", detail: "" }))).toBe("[Hello] Asha");
  });
  it("stays on one line (no header injection)", () => {
    expect(contactSubject(draft({ name: "Asha\r\nBcc: x@y.z" }))).not.toMatch(/[\r\n]/);
  });
});

describe("contactSummary()", () => {
  it("lists reason, company and reply-to, then the message", () => {
    const s = contactSummary(draft({ company: "Acme" }));
    expect(s).toBe("Reason: Freelance project · Portfolio website\nCompany: Acme\nReply to: a@b.co\n\nHello there");
    expect(contactSummary(draft())).not.toContain("Company");
  });
});

describe("contactMailto()", () => {
  it("encodes the subject and the summary body", () => {
    const href = contactMailto("me@x.co", draft());
    expect(href.startsWith(`mailto:me@x.co?subject=${encodeURIComponent("[Freelance · Portfolio website] Asha")}&body=`)).toBe(true);
    expect(decodeURIComponent(href.split("body=")[1]!)).toBe(contactSummary(draft()));
  });
});

describe("whatsappLink()", () => {
  it("strips the number to digits and encodes newlines and emoji", () => {
    const href = whatsappLink("+91 98765-43210", draft({ message: "Hi 👋\nsecond line" }));
    expect(href.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(href).toContain("%0A");
    const text = decodeURIComponent(href.split("text=")[1]!);
    expect(text.startsWith("Hi Senthurvel, I'm Asha.\n\nReason: Freelance project")).toBe(true);
    expect(text).toContain("Hi 👋\nsecond line");
  });
});

describe("reasonFromParam()", () => {
  it("maps every old ?topic= id and the new reason ids", () => {
    expect(reasonFromParam("role")).toEqual(["hiring", ""]);
    expect(reasonFromParam("internship")).toEqual(["hiring", "Internship"]);
    expect(reasonFromParam("website")).toEqual(["freelance", "Business website"]);
    expect(reasonFromParam("portfolio")).toEqual(["freelance", "Portfolio website"]);
    expect(reasonFromParam("redesign")).toEqual(["freelance", "Redesign"]);
    expect(reasonFromParam("freelance")).toEqual(["freelance", ""]);
    expect(reasonFromParam("hello")).toEqual(["hello", ""]);
    expect(reasonFromParam("hiring")).toEqual(["hiring", ""]);
  });
  it("ignores unknown and prototype keys", () => {
    expect(reasonFromParam(null)).toBeNull();
    expect(reasonFromParam("nope")).toBeNull();
    expect(reasonFromParam("constructor")).toBeNull();
  });
});

describe("suggestChannel()", () => {
  it("sends urgent freelance work to WhatsApp and everything else to email", () => {
    expect(suggestChannel({ reason: "freelance", timeline: "ASAP" })).toBe("whatsapp");
    expect(suggestChannel({ reason: "freelance", timeline: "Within a month" })).toBe("email");
    expect(suggestChannel({ reason: "freelance", timeline: "" })).toBe("email");
    expect(suggestChannel({ reason: "hiring", timeline: "" })).toBe("email");
    expect(suggestChannel({ reason: "hello", timeline: "" })).toBe("email");
    expect(suggestChannel({ reason: "", timeline: "" })).toBe("email");
  });
});

describe("misc", () => {
  it("istTime formats IST", () => expect(istTime(new Date("2026-01-01T00:00:00Z"))).toBe("05:30"));
  it("neighbours wraps", () => {
    const l = [{ slug: "a" }, { slug: "b" }];
    expect(neighbours(l, "a")).toEqual({ prev: l[1], next: l[1] });
    expect(neighbours(l, "z")).toBeNull();
  });
});
