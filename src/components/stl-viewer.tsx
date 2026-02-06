"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function StlViewer({
  url,
  onDimensions
}: {
  url?: string | null;
  onDimensions?: (dims: { x: number; y: number; z: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !url) {
      return;
    }

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(120, 120, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const loader = new STLLoader();
    loader.load(url, (geometry) => {
      const material = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.1,
        roughness: 0.6
      });
      const mesh = new THREE.Mesh(geometry, material);
      geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        onDimensions?.({
          x: Number(size.x.toFixed(2)),
          y: Number(size.y.toFixed(2)),
          z: Number(size.z.toFixed(2))
        });
      }
      geometry.center();
      scene.add(mesh);
    });

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [url, onDimensions]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-md border border-slate-200"
    />
  );
}
