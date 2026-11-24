import * as THREE from "three";


export function studioEnv(gl: THREE.WebGLRenderer) {
  const room = new THREE.Scene();
  const panel = new THREE.PlaneGeometry(1, 1);
  const boxes: [w: number, h: number, pos: [number, number, number], rgb: [number, number, number]][] = [
    [7, 2.5, [-3, 5, 4], [3, 3.05, 3.1]], // key: cool-white softbox above-left, the top-face glare
    [1.2, 7, [6, 0.5, 2], [2.1, 2.25, 2.4]], // steel strip on the right, streaks down the side edges
    [6, 1.4, [0, 2, -6], [1.7, 1.9, 2.2]], // steel rim behind, the edge glow against the stage
    [8, 4, [-2, -3, 7], [0.26, 0.28, 0.31]], // dim grey fill in front, front faces never go fully black
  ];
  const mats: THREE.Material[] = [];
  for (const [w, h, pos, rgb] of boxes) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb), side: THREE.DoubleSide });
    const m = new THREE.Mesh(panel, mat);
    m.scale.set(w, h, 1);
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    room.add(m);
    mats.push(mat);
  }
  const pmrem = new THREE.PMREMGenerator(gl);
  const tex = pmrem.fromScene(room, 0.02).texture;
  pmrem.dispose();
  panel.dispose();
  mats.forEach((m) => m.dispose());
  return tex;
}

export const graphiteMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#2e343c",
    roughness: 0.14,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    sheen: 0.55, // soft silver glow on the rounded edges at grazing angles
    sheenColor: new THREE.Color("#a7b4c2"),
    sheenRoughness: 0.35,
    envMapIntensity: 1.15,
  });
