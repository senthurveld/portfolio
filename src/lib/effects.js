// Site-wide motion. One idea runs through all of it: the page is made of clay.
// Type stretches under the cursor, headings settle into place, ribbons carry the
// scroll's momentum, and CTAs lean toward the pointer. Everything is gated on
// reduced motion, and pointer effects only run with a fine pointer.
import { SplitText } from "gsap/SplitText";
import { gsap, ScrollTrigger } from "./motion";

gsap.registerPlugin(SplitText);

const OK = "(prefers-reduced-motion: no-preference)";
const FINE = "(hover: hover) and (pointer: fine)";
const SKIP = "[aria-hidden='true'] *, dialog *, header *";

/** Section headings rise word by word the first time they enter. Markup comes from <Words>. */
function headings() {
  gsap.utils.toArray("[data-split]").forEach((h) => {
    gsap.from(h.querySelectorAll("[data-w] > span"), {
      yPercent: 115,
      rotate: 5,
      transformOrigin: "0% 100%",
      duration: 1.3,
      ease: "expo.out",
      stagger: 0.07,
      scrollTrigger: { trigger: h, start: "top 88%", once: true },
    });
  });
}

/**
 * Blocks marked [data-reveal="kind"] arrive as they scroll in; neighbours that enter
 * together cascade. Kinds: rise (default), left, right, pop, clip.
 * "clip" wipes up from the bottom, then any clay [data-shape] inside pops into place.
 */
const KINDS = {
  rise: [{ y: 56, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }],
  left: [{ x: -56, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }],
  right: [{ x: 56, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }],
  pop: [{ y: 40, scale: 0.94, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1 }],
  clip: [{ clipPath: "inset(100% 0% 0% 0% round 22px)" }, { clipPath: "inset(0% 0% 0% 0% round 22px)", clearProps: "clipPath" }],
};

function blocks() {
  const els = gsap.utils.toArray("[data-reveal]");
  const kind = (el) => KINDS[el.dataset.reveal] ?? KINDS.rise;
  els.forEach((el) => gsap.set(el, kind(el)[0]));
  ScrollTrigger.batch(els, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      batch.forEach((el, i) => {
        const delay = i * 0.12;
        gsap.to(el, { ...kind(el)[1], duration: 1.3, delay, ease: "expo.out" });
        if (el.dataset.reveal !== "clip") return;
        // The shapes carry a CSS hover transition on transform; park it while GSAP drives them.
        const shapes = el.querySelectorAll("[data-shape]");
        gsap.fromTo(
          shapes,
          { scale: 0.2, rotation: -30, autoAlpha: 0, transition: "none" },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.2, delay: delay + 0.35, stagger: 0.09, ease: "elastic.out(1, 0.45)", clearProps: "transform,transition" },
        );
      }),
  });
}

/** Paragraphs rise line by line out of a mask, then un-split so the DOM is plain text again. */
function lines() {
  gsap.utils.toArray(".head p:not(.label), [data-lines]").forEach((p) => {
    if (p.matches(SKIP)) return;
    gsap.set(p, { autoAlpha: 0 });
    // Split at the moment it enters (fonts have long settled by then), not at page load.
    ScrollTrigger.create({
      trigger: p,
      start: "top 90%",
      once: true,
      onEnter: () => {
        const split = SplitText.create(p, { type: "lines", mask: "lines" });
        gsap.set(p, { autoAlpha: 1 });
        gsap.from(split.lines, { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out", onComplete: () => split.revert() });
      },
    });
  });
}

/**
 * Mono labels decode into place, like a terminal resolving a string. Edits text nodes in
 * place (no DOM swaps, so React's nodes stay intact) and restores the originals at the end.
 * Monospace means no layout shift while it runs.
 */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+·";
function scramble(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2) });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const orig = nodes.map((n) => n.nodeValue);
  const total = orig.reduce((s, t) => s + t.length, 0);
  const p = { t: 0 };
  let frame = 0;
  return gsap.to(p, {
    t: 1,
    duration: Math.min(1.4, 0.5 + total * 0.03),
    ease: "power2.out",
    onUpdate: () => {
      if (frame++ % 2) return; // every other frame: legible flicker, not noise
      const shown = Math.floor(p.t * total);
      let k = 0;
      nodes.forEach((n, i) => {
        n.nodeValue = [...orig[i]].map((ch) => (k++ < shown || ch === " " || ch === "·" ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
      });
    },
    onComplete: () => nodes.forEach((n, i) => (n.nodeValue = orig[i])),
  });
}

function labels() {
  gsap.utils.toArray("main .label, footer .label").forEach((el) => {
    if (el.matches(SKIP)) return;
    ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => scramble(el) });
  });
}

/** Marquee rows speed up with scroll velocity and run backwards while scrolling up. */
function momentum() {
  const tracks = gsap.utils.toArray(".marquee-track");
  const anims = tracks.flatMap((el) => el.getAnimations().filter((a) => a.animationName === "marquee"));
  if (!anims.length) return;
  // Start deep into the timeline so reversing never runs out of iterations.
  anims.forEach((a) => (a.currentTime = 3_600_000));
  let dir = 1;
  let boost = 0;
  let rate = 1;
  let applied = 1;
  // Every playbackRate write re-syncs that animation with the compositor (a main-thread style pass),
  // so only on-screen tracks get written, and only when the change is big enough to see.
  const onScreen = new Set();
  const io = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return onScreen.delete(e.target);
      onScreen.add(e.target);
      anims.forEach((a) => a.effect.target === e.target && (a.playbackRate = applied));
    }),
  );
  tracks.forEach((t) => io.observe(t));
  const st = ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity();
      if (Math.abs(v) < 20) return;
      dir = v < 0 ? -1 : 1;
      boost = Math.max(boost, Math.min(Math.abs(v) / 450, 5));
    },
  });
  const tick = () => {
    boost *= 0.93;
    const target = dir * (1 + boost);
    rate += (target - rate) * 0.12;
    if (Math.abs(target - rate) < 0.02) rate = target;
    if (Math.abs(rate - applied) < 0.02 && rate !== target) return;
    if (rate === applied) return;
    applied = rate;
    anims.forEach((a) => onScreen.has(a.effect.target) && (a.playbackRate = applied));
  };
  gsap.ticker.add(tick);
  return () => {
    io.disconnect();
    st.kill();
    gsap.ticker.remove(tick);
    anims.forEach((a) => (a.playbackRate = 1));
  };
}

/**
 * Letters marked [data-l] inside [data-stretch] widen toward the cursor along the
 * variable font's width axis, like clay pulled under a thumb.
 */
function stretch() {
  const offs = gsap.utils.toArray("[data-stretch]").map((group) => {
    const letters = [...group.querySelectorAll("[data-l]")];
    const min = Number(group.dataset.stretch) || 75;
    const opsz = getComputedStyle(group).fontVariationSettings.match(/"opsz" ([\d.]+)/)?.[1] ?? 96;
    const state = letters.map(() => ({ w: min }));
    const to = letters.map((el, i) =>
      gsap.quickTo(state[i], "w", {
        duration: 0.7,
        ease: "power3.out",
        onUpdate: () => (el.style.fontVariationSettings = `"opsz" ${opsz}, "wdth" ${state[i].w.toFixed(1)}`),
      }),
    );
    let centers = [];
    const measure = () => {
      const g = group.getBoundingClientRect();
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return [r.left - g.left + r.width / 2, r.top - g.top + r.height / 2];
      });
    };
    const enter = () => measure();
    const move = (e) => {
      const g = group.getBoundingClientRect();
      const x = e.clientX - g.left;
      const y = e.clientY - g.top;
      const reach = Math.max(180, g.height * 0.9);
      centers.forEach(([cx, cy], i) => {
        const t = Math.max(0, 1 - Math.hypot(cx - x, (cy - y) * 0.6) / reach);
        to[i](min + (100 - min) * t * t * (3 - 2 * t));
      });
    };
    const leave = () => to.forEach((f) => f(min));
    group.addEventListener("pointerenter", enter);
    group.addEventListener("pointermove", move);
    group.addEventListener("pointerleave", leave);
    return () => {
      group.removeEventListener("pointerenter", enter);
      group.removeEventListener("pointermove", move);
      group.removeEventListener("pointerleave", leave);
      letters.forEach((l) => (l.style.fontVariationSettings = ""));
    };
  });
  return () => offs.forEach((f) => f());
}

/** Primary CTAs lean toward the pointer. Uses the `translate` property so CSS hover/press transforms still work. */
function magnetic() {
  const offs = gsap.utils.toArray("[data-magnetic]").map((el) => {
    const p = { x: 0, y: 0 };
    const apply = () => (el.style.translate = `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`);
    const xTo = gsap.quickTo(p, "x", { duration: 0.6, ease: "power3.out", onUpdate: apply });
    const yTo = gsap.quickTo(p, "y", { duration: 0.6, ease: "power3.out", onUpdate: apply });
    const move = (e) => {
      // The rect already includes the current pull; add it back to measure from the resting centre.
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2) + p.x) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2) + p.y) * 0.38);
    };
    const leave = () => (xTo(0), yTo(0));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.style.translate = "";
    };
  });
  return () => offs.forEach((f) => f());
}

export function startEffects() {
  const mm = gsap.matchMedia();
  mm.add(OK, () => {
    headings();
    blocks();
    lines();
    labels();
    return momentum();
  });
  mm.add(`${OK} and ${FINE}`, () => {
    const a = stretch();
    const b = magnetic();
    return () => (a(), b());
  });
  return () => mm.revert();
}
