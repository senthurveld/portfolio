import { describe, expect, it } from "vitest";
import {
  contactMailto,
  cursorModeFor,
  istTime,
  navVisible,
  neighbours,
  real,
  revealRadius,
  splitRows,
  stackDim,
  stackScale,
  validateContact,
  wrap,
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

describe("contactMailto()", () => {
  it("encodes subject and body with every filled field", () => {
    const href = contactMailto("me@x.co", {
      topic: "Freelance project",
      looking: "Landing page",
      timeline: "",
      name: "Asha",
      email: "a@b.co",
      company: "",
      message: "Hello there",
    });
    expect(href.startsWith("mailto:me@x.co?subject=Freelance%20project%20%E2%80%94%20Asha&body=")).toBe(true);
    const body = decodeURIComponent(href.split("body=")[1]!);
    expect(body).toContain("Looking for: Landing page");
    expect(body).not.toContain("Timeline");
    expect(body).toContain("Hello there");
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
