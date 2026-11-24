
// Slot sizes + HTML compositions (site palette, Urbanist). Text drawn here must be true.
export const SLOTS = {
  cover: { w: 1600, h: 1000, widths: [640, 960, 1280, 1920] }, // 16:10
  tall: { w: 900, h: 1200, widths: [480, 720, 960] }, // 3:4
  details: { w: 800, h: 800, widths: [400, 640, 800] }, // 1:1
  gallery: { w: 1600, h: 1000, widths: [960, 1600] }, // 16:10
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

const NOISE = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .7 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
const LOCK = `<svg viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.5" y="6" width="9" height="7" rx="1.5"/><path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2"/></svg>`;
const STEEL = "#6d7f8f";

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#0c0c0c}
body{font-family:"Urbanist Variable",Urbanist,system-ui,sans-serif;color:#d7e2ea;-webkit-font-smoothing:antialiased}
#stage{position:relative;overflow:hidden;isolation:isolate;background:#0c0c0c}
.layer{position:absolute;inset:0;pointer-events:none}
.glow{position:absolute;border-radius:50%;pointer-events:none;filter:blur(40px)}
.dots{background-image:radial-gradient(rgba(215,226,234,.17) 1px,transparent 1.4px);background-size:24px 24px}
.grain{position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml,${encodeURIComponent(NOISE)}");background-size:220px;opacity:.08;mix-blend-mode:overlay}
.win{position:absolute;overflow:hidden;background:#0f1113;border:1px solid rgba(215,226,234,.14);box-shadow:0 60px 120px -30px rgba(0,0,0,.9),0 20px 40px -18px rgba(0,0,0,.7)}
.bar{display:flex;align-items:center;gap:8px;height:42px;padding:0 18px;background:linear-gradient(#1b1e22,#15181b);border-bottom:1px solid rgba(215,226,234,.08)}
.bar i{flex:none;width:11px;height:11px;border-radius:50%;background:#2d3339}
.url{display:flex;align-items:center;gap:8px;margin:0 auto;height:26px;padding:0 16px;border-radius:9px;background:#0d0f11;border:1px solid rgba(215,226,234,.07);font-size:13px;font-weight:500;letter-spacing:.01em;color:rgba(215,226,234,.6)}
.url svg{width:11px;height:11px;opacity:.7}
.view{position:relative;overflow:hidden;background:#fff}
.view img{position:absolute;left:0;top:0;display:block;max-width:none}
.phone{position:absolute;background:linear-gradient(150deg,#59626d 0%,#262b31 38%,#111316 100%);box-shadow:0 60px 110px -25px rgba(0,0,0,.95),inset 0 0 0 1.5px rgba(255,255,255,.16),inset 0 0 0 6px #0a0b0d}
.screen{position:relative;overflow:hidden;background:#000}
.screen img{display:block;max-width:none}
.island{position:absolute;left:50%;transform:translateX(-50%);background:#000;border-radius:99px}
.chip{position:absolute;padding:13px 18px 15px;border-radius:16px;background:rgba(19,22,25,.86);border:1px solid rgba(215,226,234,.15);box-shadow:0 26px 50px -20px rgba(0,0,0,.85);backdrop-filter:blur(14px)}
.chip small{display:block;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:rgba(215,226,234,.5)}
.chip b{display:flex;align-items:center;gap:10px;margin-top:6px;font-size:19px;font-weight:600;letter-spacing:-.01em;color:#e9eef2;white-space:nowrap}
.chip b::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 14px var(--accent)}
.eyebrow{display:flex;align-items:center;gap:14px;font-size:15px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:rgba(215,226,234,.56)}
.eyebrow span{letter-spacing:0;font-variant-numeric:tabular-nums}
.eyebrow i{width:28px;height:1px;background:rgba(215,226,234,.3)}
.title{font-weight:700;letter-spacing:-.045em;line-height:.94;background:linear-gradient(180deg,#f7fafc 0%,#cfd9e0 55%,#8f9ba5 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-wrap:balance}
.tag{font-size:22px;font-weight:500;line-height:1.4;color:rgba(215,226,234,.64);text-wrap:pretty}
.pills{display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.pills li{padding:7px 14px;border-radius:99px;border:1px solid rgba(215,226,234,.16);background:rgba(215,226,234,.04);font-size:14px;font-weight:600;color:rgba(215,226,234,.8)}
svg.links{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
`;

export const document = (body, size, font) =>
  `<!doctype html><html><head><meta charset="utf-8">${font ? `<link rel="stylesheet" href="${font}">` : ""}<style>${CSS}#stage{width:${size.w}px;height:${size.h}px}</style></head><body><div id="stage">${body}</div></body></html>`;

const glow = (x, y, w, h, color, a) =>
  `<div class="glow" style="left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;background:radial-gradient(closest-side,${rgba(color, a)},${rgba(color, a * 0.35)} 45%,transparent)"></div>`;
const dots = (x, y, rx, ry) => {
  const m = `radial-gradient(${rx}px ${ry}px at ${x}px ${y}px,#000,transparent)`;
  return `<div class="layer dots" style="mask-image:${m};-webkit-mask-image:${m}"></div>`;
};
const grain = `<div class="grain"></div>`;

function frame(shot, { left, top, width, height, crop, domain, radius = 18 }) {
  const c = crop ?? [0, 0, shot.w, shot.h];
  const vh = height ?? Math.round((c[3] * width) / c[2]);
  const k = Math.max(width / c[2], vh / c[3]);
  const x = -c[0] * k + (width - c[2] * k) / 2;
  const y = -c[1] * k + (vh - c[3] * k) / 2;
  return `<div class="win" style="left:${left}px;top:${top}px;width:${width}px;border-radius:${radius}px">${
    domain ? `<div class="bar"><i></i><i></i><i></i><span class="url">${LOCK}${esc(domain)}</span></div>` : ""
  }<div class="view" style="height:${vh}px"><img src="${shot.src}" style="width:${shot.w * k}px;transform:translate(${x}px,${y}px)"></div></div>`;
}

function phone(shot, { left, top, width, rotate = 0 }) {
  const pad = Math.round(width * 0.042);
  const sw = width - pad * 2;
  const sh = Math.round((shot.h * sw) / shot.w);
  const sb = Math.round(sw * 0.12);
  const r = Math.round(width * 0.17);
  return `<div class="phone" style="left:${left}px;top:${top}px;width:${width}px;padding:${pad}px;border-radius:${r}px;transform:rotate(${rotate}deg)"><div class="screen" style="height:${sh + sb}px;border-radius:${r - pad}px"><div style="position:relative;height:${sb}px;overflow:hidden"><div style="position:absolute;inset:-24px;filter:blur(12px);background:url('${shot.src}') 24px 0/${sw}px ${sh * 400}px no-repeat"></div></div><img src="${shot.src}" style="width:${sw}px"><span class="island" style="top:${Math.round((sb - sw * 0.082) / 2)}px;width:${Math.round(sw * 0.3)}px;height:${Math.round(sw * 0.082)}px"></span></div></div>`;
}

const chip = ({ x, y, label, value }) => `<div class="chip" style="left:${x}px;top:${y}px"><small>${esc(label)}</small><b>${esc(value)}</b></div>`;

const links = (pairs) =>
  `<svg class="links"><g fill="none" stroke="rgba(215,226,234,.32)" stroke-width="1.5" stroke-dasharray="4 6">${pairs
    .map(([[x1, y1], [x2, y2]]) => {
      const mx = (x1 + x2) / 2;
      return `<path d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`;
    })
    .join("")}</g><g fill="#d7e2ea">${pairs.map(([, [x, y]]) => `<circle cx="${x}" cy="${y}" r="3.5"/>`).join("")}</g></svg>`;

const accentVar = (p) => `<style>#stage{--accent:${p.accent}}</style>`;

export const TEMPLATES = {
  poster({ p, s, shot }) {
    const d = shot(s.desktop);
    const m = s.mobile ? shot(s.mobile) : null;
    const size = p.title.length > 16 ? 78 : p.title.length > 11 ? 90 : 104;
    const chips = s.chips ?? [];
    return `${accentVar(p)}
      ${glow(1180, 430, 1400, 1100, p.accent, 0.5)}
      ${glow(160, 1000, 1000, 700, STEEL, 0.32)}
      ${dots(1380, 90, 620, 420)}
      <div style="position:absolute;left:92px;top:0;bottom:0;width:440px;display:flex;flex-direction:column;justify-content:center;gap:28px">
        <p class="eyebrow"><span>${esc(p.n)}</span><i></i>${esc(p.category)}</p>
        <h1 class="title" style="font-size:${size}px">${esc(p.title)}</h1>
        <p class="tag">${esc(p.tagline)}</p>
        <ul class="pills">${p.stack.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      ${frame(d, { left: 650, top: 128, width: 1060, crop: s.crop, domain: p.domain })}
      ${m ? phone(m, { left: 566, top: 452, width: 226, rotate: -2 }) : ""}
      ${chips.length ? links(chips.map((c) => [[c.x + (c.x > 1100 ? 0 : 200), c.y + 32], c.to])) : ""}
      ${chips.map(chip).join("")}
      ${grain}`;
  },

  duo({ p, s, shot }) {
    const d = shot(s.desktop);
    const m = shot(s.mobile);
    return `${accentVar(p)}
      ${glow(560, 700, 1150, 1150, p.accent, 0.55)}
      ${glow(60, 60, 760, 620, STEEL, 0.3)}
      ${dots(760, 160, 420, 360)}
      ${frame(d, { left: 80, top: 110, width: 960, crop: s.crop, domain: p.domain })}
      ${phone(m, { left: 292, top: 418, width: 344 })}
      ${grain}`;
  },

  zoom({ p, s, shot }) {
    const d = shot(s.shot);
    return `${accentVar(p)}
      ${glow(640, 140, 980, 860, p.accent, 0.48)}
      ${glow(80, 780, 760, 640, STEEL, 0.3)}
      ${frame(d, { left: 60, top: 60, width: 680, height: 680, crop: s.crop, radius: 24 })}
      ${s.caption ? chip({ x: 32, y: 30, label: p.title, value: s.caption }) : ""}
      ${grain}`;
  },

  handset({ p, s, shot }) {
    const m = shot(s.shot);
    return `${accentVar(p)}
      ${glow(400, 430, 980, 980, p.accent, 0.52)}
      ${dots(400, 400, 420, 420)}
      ${phone(m, { left: 255, top: 40, width: 290 })}
      ${s.caption ? chip({ x: 36, y: 676, label: p.title, value: s.caption }) : ""}
      ${grain}`;
  },

  window({ p, s, shot }) {
    return `${accentVar(p)}
      ${glow(1220, 260, 1400, 1000, p.accent, 0.4)}
      ${glow(260, 960, 1100, 700, STEEL, 0.3)}
      ${frame(shot(s.shot), { left: 140, top: 96, width: 1320, crop: s.crop, domain: p.domain })}
      ${grain}`;
  },

  trio({ p, s, shot }) {
    const [a, b, c] = s.shots.map(shot);
    return `${accentVar(p)}
      ${glow(800, 520, 1500, 1000, p.accent, 0.42)}
      ${dots(800, 500, 760, 460)}
      ${phone(a, { left: 300, top: 200, width: 290 })}
      ${phone(b, { left: 655, top: 130, width: 290 })}
      ${phone(c, { left: 1010, top: 200, width: 290 })}
      ${grain}`;
  },
};
