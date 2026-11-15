"use client";

import { Canvas } from "@react-three/fiber";
import {
  Preload,
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import TuxModel from "./TuxModel";
import Pane from "@/components/UI/Pane";
import DragIndicator from "@/components/UI/DragIndicator";
import { SHADOW_LOCAL_Y } from "./modelMetrics";

export default function HomeScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // The head rig needs a live frame loop, but only while the scene is on
  // screen and the tab is visible; otherwise we drop back to demand.
  useEffect(() => {
    const el = sceneRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const animate = inView && pageVisible && !reducedMotion;

  return (
    <Pane
      title="bin/tux"
      className="h-full flex flex-col"
      contentClassName="p-0 flex-1 min-h-0"
    >
      <div
        ref={sceneRef}
        aria-hidden="true"
        className="scene relative w-full h-full min-h-[340px] md:min-h-[480px] overflow-hidden rounded-pane"
      >
        <Canvas
          dpr={[1, 1.5]}
          frameloop={animate ? "always" : "demand"}
          shadows
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMappingExposure: 1.15,
          }}
          camera={{ position: [0, 0, 6], fov: 42, near: 0.1, far: 100 }}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            touchAction: "pan-y",
          }}
        >
          <Suspense fallback={null}>
            <Preload all />

            {/* Local, procedural studio IBL — no HDR/CDN fetch, baked once. */}
            <Environment resolution={256} frames={1}>
              <Lightformer
                form="rect"
                intensity={3}
                position={[0, 4, 3.5]}
                scale={[6, 3, 1]}
                color="#fff8e7"
                rotation={[Math.PI / 2, 0, 0]}
              />
              <Lightformer
                form="rect"
                intensity={1.1}
                position={[-4, 2, 1]}
                scale={[4, 4, 1]}
                color="#8ec07c"
              />
              <Lightformer
                form="circle"
                intensity={2}
                position={[3.5, 2.5, -3]}
                scale={3}
                color="#fabd2f"
              />
            </Environment>

            <hemisphereLight args={["#fbf1c7", "#504945", 0.7]} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[3, 6, 4]} intensity={1.6} />
            <directionalLight position={[-4, 2, -3]} intensity={0.5} />

            {/* TuxModel owns the -1.2926 offset group; the shadow is mounted
                inside that group at the feet (local bottom of the scaled
                geometry), so it lands on world y = -1.3134 with no gap. */}
            <TuxModel animate={animate}>
              <ContactShadows
                position={[0, SHADOW_LOCAL_Y, 0]}
                opacity={0.55}
                blur={2.5}
                far={4}
                resolution={512}
                color="#000000"
                frames={1}
              />
            </TuxModel>

            {/* fov 42 → visible half-height = tan(21°) × distance: 2.303 at the
                default d=6 and 1.919 at minDistance 5. The re-centred model
                spans ±1.3134, so 1.3134 < 1.919 and it never clips. */}
            <OrbitControls
              target={[0, 0, 0]}
              enableDamping={false}
              enablePan={false}
              enableZoom
              minDistance={5}
              maxDistance={8}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.9}
            />
          </Suspense>
        </Canvas>

        <DragIndicator />
      </div>
    </Pane>
  );
}
