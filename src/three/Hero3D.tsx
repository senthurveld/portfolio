import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  Euler,
  Group,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { graphiteMaterial, studioEnv } from "./studio";


const STEP = 1;
const TWIST_S = 0.5;
const AUTO_TWIST_S = 3.2;
const ISO_X = Math.atan(1 / Math.SQRT2);
const ISO_Y = Math.PI / 4;
const AXES = ["x", "y", "z"] as const;
type Axis = (typeof AXES)[number];
type Move = { axis: Axis; layer: number; dir: 1 | -1 };
type Twist = Move & { t: number; pivot: Group };
type Spin = { twist: Twist | null; last: Move | null; nextAuto: number };

const damp = (from: number, to: number, lambda: number, dt: number) => from + (to - from) * (1 - Math.exp(-lambda * dt));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const snap = (v: number, s: number) => Math.round(v / s) * s;

function startTwist(cube: Group, s: Spin) {
  if (s.twist) return;
  let pick: Move;
  do {
    pick = {
      axis: AXES[Math.floor(Math.random() * 3)] ?? "y",
      layer: Math.floor(Math.random() * 3) - 1,
      dir: Math.random() < 0.5 ? 1 : -1,
    };
    // Don't undo the previous move straight away.
  } while (s.last && s.last.axis === pick.axis && s.last.layer === pick.layer && s.last.dir !== pick.dir);
  const pivot = new Group();
  cube.add(pivot);
  for (const child of [...cube.children]) {
    if (child !== pivot && Math.round(child.position[pick.axis] / STEP) === pick.layer) pivot.attach(child);
  }
  s.twist = { ...pick, t: 0, pivot };
  s.last = pick;
}

const euler = new Euler();
function stepTwist(cube: Group, s: Spin, p: number) {
  const tw = s.twist;
  if (!tw) return;
  tw.pivot.rotation[tw.axis] = tw.dir * (Math.PI / 2) * easeInOut(p);
  if (p < 1) return;
  tw.pivot.updateMatrixWorld();
  for (const child of [...tw.pivot.children]) {
    cube.attach(child);
    child.position.set(snap(child.position.x, STEP), snap(child.position.y, STEP), snap(child.position.z, STEP));
    euler.setFromQuaternion(child.quaternion);
    child.rotation.set(snap(euler.x, Math.PI / 2), snap(euler.y, Math.PI / 2), snap(euler.z, Math.PI / 2));
  }
  cube.remove(tw.pivot);
  s.twist = null;
}

type Props = { reduce: boolean; paused?: boolean; onReady: () => void; onFail: () => void };

export default function Hero3D({ reduce, paused = false, onReady, onFail }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const live = useRef({ reduce, paused, onReady, onFail, kick: () => {} });
  useEffect(() => {
    live.current = { ...live.current, reduce, paused, onReady, onFail };
    live.current.kick();
  }, [reduce, paused, onReady, onFail]);

  useEffect(() => {
    const box = wrap.current;
    if (!box) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      live.current.onFail();
      return;
    }
    const coarse = matchMedia("(pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75));
    renderer.toneMapping = ACESFilmicToneMapping;
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;pointer-events:none";
    box.append(canvas);

    const scene = new Scene();
    const env = studioEnv(renderer);
    scene.environment = env;
    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.3, 6);

    scene.add(new AmbientLight("#c3ccd6", 0.45));
    const key = new DirectionalLight("#e3e9ef", 1.3);
    key.position.set(-3, 4, 5);
    scene.add(key);

    const tilt = new Group();
    tilt.position.y = 0.3;
    const iso = new Group();
    iso.rotation.x = ISO_X;
    const cube = new Group();
    cube.rotation.y = ISO_Y;
    cube.scale.setScalar(0.6);
    const geo = new RoundedBoxGeometry(0.94, 0.94, 0.94, 4, 0.12);
    const mat = graphiteMaterial();
    for (const x of [-1, 0, 1])
      for (const y of [-1, 0, 1])
        for (const z of [-1, 0, 1]) {
          const m = new Mesh(geo, mat);
          m.position.set(x * STEP, y * STEP, z * STEP);
          cube.add(m);
        }
    iso.add(cube);
    tilt.add(iso);
    scene.add(tilt);

    const pointer = { x: 0, y: 0, at: -Infinity };
    const spin: Spin = { twist: null, last: null, nextAuto: 1.6 };
    const t0 = performance.now();
    let last = t0;
    let raf = 0;
    let visible = true;
    let dirty = true;
    let first = true;

    const animating = () => !live.current.reduce && !live.current.paused;
    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const t = (now - t0) / 1000;
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const reduceNow = live.current.reduce;

      const idle = now - pointer.at > 2500;
      const tx = idle && !reduceNow ? Math.sin(t * 0.45) * 0.5 : pointer.x;
      const ty = idle && !reduceNow ? Math.sin(t * 0.31) * 0.3 : pointer.y;
      tilt.rotation.y = reduceNow ? tx * 0.6 : damp(tilt.rotation.y, tx * 0.6, 3, dt);
      tilt.rotation.x = reduceNow ? -ty * 0.45 : damp(tilt.rotation.x, -ty * 0.45, 3, dt);

      if (animating()) {
        cube.rotation.y = ISO_Y + t * 0.12;
        cube.position.y = Math.sin(t * 0.8) * 0.07;
        if (spin.twist) {
          spin.twist.t = Math.min(1, spin.twist.t + dt / TWIST_S);
          stepTwist(cube, spin, spin.twist.t);
        } else if (t > spin.nextAuto) {
          startTwist(cube, spin);
          spin.nextAuto = t + AUTO_TWIST_S;
        }
      }

      renderer.render(scene, camera);
      dirty = false;
      if (first) {
        first = false;
        requestAnimationFrame(() => live.current.onReady());
      }
      if (animating()) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && !document.hidden && (dirty || animating())) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const invalidate = () => {
      dirty = true;
      kick();
    };
    live.current.kick = kick;

    const resize = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      invalidate();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    // Pause rendering off-screen (battery).
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) invalidate();
    });
    io.observe(box);
    const onVisibility = () => !document.hidden && invalidate();
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1);
      pointer.y = MathUtils.clamp(-(e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1);
      pointer.at = performance.now();
      if (live.current.reduce) invalidate();
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      const target = e.target as Element | null;
      if (!target?.closest("#top") || target.closest("a, button, input, [role='button']")) return;
      startTwist(cube, spin);
      if (live.current.reduce) stepTwist(cube, spin, 1);
      invalidate();
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });

    const onLost = () => live.current.onFail();
    canvas.addEventListener("webglcontextlost", onLost, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      live.current.kick = () => {};
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
      geo.dispose();
      mat.dispose();
      env.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={wrap} className="size-full" />;
}
