"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Interactive 3D "sound sphere": a globe of audio bars that pulse like a live
 * equaliser and turn gently towards the pointer. Pauses when off-screen or when
 * the tab is hidden, and renders a single still frame for reduced-motion users.
 */
export default function SoundSphere({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const COUNT = small ? 520 : 900;
    const RADIUS = 1.55;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the CSS glow behind the canvas still looks intentional.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const group = new THREE.Group();
    scene.add(group);

    // Bars on a Fibonacci sphere, each pointing outward along its normal.
    const geo = new THREE.BoxGeometry(0.035, 0.035, 1);
    geo.translate(0, 0, 0.5); // grow outward from the surface
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 });
    const bars = new THREE.InstancedMesh(geo, mat, COUNT);
    const normals: THREE.Vector3[] = [];
    const seeds: number[] = [];
    const dummy = new THREE.Object3D();
    const cA = new THREE.Color("#ff7a1a");
    const cB = new THREE.Color("#ff4d8d");
    const cC = new THREE.Color("#8b5cf6");
    const tmp = new THREE.Color();
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const n = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
      normals.push(n);
      seeds.push(Math.random() * Math.PI * 2);
      // Vertical gradient: orange (top) → pink → violet (bottom)
      const t = (y + 1) / 2;
      if (t > 0.5) tmp.copy(cB).lerp(cA, (t - 0.5) * 2);
      else tmp.copy(cC).lerp(cB, t * 2);
      bars.setColorAt(i, tmp);
    }
    group.add(bars);

    // Soft inner core + thin orbit rings for depth.
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 0.96, 48, 48),
      new THREE.MeshBasicMaterial({ color: "#0b0d15", transparent: true, opacity: 0.85 }),
    );
    group.add(core);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.08, side: THREE.DoubleSide });
    const rings = [2.35, 2.75].map((rad, i) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(rad, rad + 0.008, 160), ringMat);
      ring.rotation.x = Math.PI / 2.25 + i * 0.25;
      ring.rotation.y = i * 0.4;
      scene.add(ring);
      return ring;
    });

    // Floating dust particles.
    const dustGeo = new THREE.BufferGeometry();
    const DUST = small ? 120 : 220;
    const pos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(2.2 + Math.random() * 1.6);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: "#ffd2b0", size: 0.018, transparent: true, opacity: 0.6 }));
    scene.add(dust);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Pointer parallax
    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const up = new THREE.Vector3(0, 0, 1);
    const q = new THREE.Quaternion();
    const draw = (t: number) => {
      for (let i = 0; i < COUNT; i++) {
        const n = normals[i];
        const s = seeds[i];
        // Layered sines ≈ a lively spectrum; stronger near the "equator band".
        const wave = Math.sin(t * 2.1 + s) * 0.5 + Math.sin(t * 3.7 + n.y * 6 + s) * 0.35 + Math.sin(t * 1.3 + n.x * 4) * 0.25;
        const band = 1 - Math.abs(n.y) * 0.55;
        const len = 0.06 + Math.max(0, wave) * 0.42 * band;
        dummy.position.copy(n).multiplyScalar(RADIUS);
        q.setFromUnitVectors(up, n);
        dummy.quaternion.copy(q);
        dummy.scale.set(1, 1, len);
        dummy.updateMatrix();
        bars.setMatrixAt(i, dummy.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;
      group.rotation.y = t * 0.12 + target.x * 0.35;
      group.rotation.x = -0.15 + target.y * 0.25;
      dust.rotation.y = -t * 0.03;
      rings[0].rotation.z = t * 0.05;
      rings[1].rotation.z = -t * 0.04;
      renderer.render(scene, camera);
    };

    let raf = 0;
    let visible = true;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible && !document.hidden) draw(clock.getElapsedTime());
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    if (reduced) draw(1.2);
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      mat.dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      rings.forEach((r) => r.geometry.dispose());
      ringMat.dispose();
      dustGeo.dispose();
      (dust.material as THREE.Material).dispose();
      bars.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={className} aria-hidden />;
}
