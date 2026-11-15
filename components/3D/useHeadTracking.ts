"use client";

// Head rig for the Tux GLB.
//
// The model has no bones, no animations and no morph targets, so the head is
// rigged in the vertex shader: every material shared by the three meshes gets
// the same patch, driven by one shared uniform block. Coordinates below are
// *geometry space* (local, Z-up) — the -90° X node rotation happens after the
// shader, so `position.z` is the raw local height.

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Material, WebGLProgramParametersWithUniforms } from "three";

export type HeadUniforms = {
  uYaw: { value: number };
  uPitch: { value: number };
};

/** Limits, in radians (14° yaw / 8° pitch). */
export const MAX_YAW = 0.245;
export const MAX_PITCH = 0.14;

/** Pointer idle sway kicks in after this many seconds without movement. */
const IDLE_AFTER = 2;
const IDLE_YAW = 0.1;
const IDLE_PITCH = 0.03;

/** Damping factor per second — 6 ⇒ ~63% of the way in 1/6 s. */
const DAMPING = 6;

/** Shared by all three Tux materials so a single write drives the whole head. */
const headUniforms: HeadUniforms = { uYaw: { value: 0 }, uPitch: { value: 0 } };

const PROGRAM_CACHE_KEY = "tux-head-rig";

// Neck blend band in local z: 58 (below the neck pinch) → 66 (solid head).
const HEAD_RIG_GLSL = /* glsl */ `
uniform float uYaw;
uniform float uPitch;
const vec3 HEAD_PIVOT = vec3(0.0, 9.695, 64.0);

// Yaw about local Z (local Z is world up), pitch about local X. mat3 args are
// column-major, matching three's mat3(vec3, vec3, vec3)-free constructor.
mat3 headMatrix(float yaw, float pitch) {
  float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);
  mat3 rz = mat3(cy, sy, 0.0, -sy, cy, 0.0, 0.0, 0.0, 1.0);
  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
  return rz * rx;
}
`;

const NORMAL_PATCH = /* glsl */ `#include <beginnormal_vertex>
  float headBlend = smoothstep(58.0, 66.0, position.z);
  mat3 headRot = headMatrix(uYaw, uPitch);
  objectNormal = normalize(mix(objectNormal, headRot * objectNormal, headBlend));`;

const POSITION_PATCH = /* glsl */ `#include <begin_vertex>
  transformed = mix(transformed, headRot * (position - HEAD_PIVOT) + HEAD_PIVOT, headBlend);`;

type PatchableMaterial = Material & { __headRigPatched?: boolean };

function patchMaterial(material: PatchableMaterial | undefined) {
  if (!material || material.__headRigPatched) return;
  material.__headRigPatched = true;

  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    // Same uniform objects for every material ⇒ one update moves the whole head.
    shader.uniforms.uYaw = headUniforms.uYaw;
    shader.uniforms.uPitch = headUniforms.uPitch;

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${HEAD_RIG_GLSL}`)
      // beginnormal_vertex runs before begin_vertex, so headBlend/headRot are
      // in scope for the position patch below.
      .replace("#include <beginnormal_vertex>", NORMAL_PATCH)
      .replace("#include <begin_vertex>", POSITION_PATCH);
  };

  material.customProgramCacheKey = () => PROGRAM_CACHE_KEY;
  material.needsUpdate = true;
}

/**
 * Patches the three Tux materials (black/white/orange) exactly once and
 * returns the shared uniform block the pointer tracking writes into.
 */
export function useHeadRig(
  materials?: Record<string, Material>,
): HeadUniforms | undefined {
  return useMemo(() => {
    if (!materials) return undefined;
    for (const name of ["black", "white", "orange"]) {
      patchMaterial(materials[name] as PatchableMaterial | undefined);
    }
    return headUniforms;
  }, [materials]);
}

/**
 * Pointer-following head motion + idle sway. Must be called inside <Canvas>.
 * `enabled` is false while the canvas is off-screen or motion is reduced.
 */
export function useHeadTracking(enabled = true) {
  const gl = useThree((state) => state.gl);
  const clock = useThree((state) => state.clock);

  const hovered = useRef(false);
  // -Infinity ⇒ idle sway from the first frame.
  const lastMoveAt = useRef(-Infinity);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = (event: MediaQueryListEvent) => {
      reducedMotion.current = event.matches;
      // Snap back to rest so the head is never left mid-turn.
      if (event.matches) {
        headUniforms.uYaw.value = 0;
        headUniforms.uPitch.value = 0;
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = () => {
      hovered.current = true;
      lastMoveAt.current = clock.elapsedTime;
    };
    const onEnter = () => {
      hovered.current = true;
    };
    // R3F keeps the last NDC pointer value; drop it so the head recentres.
    const onLeave = () => {
      hovered.current = false;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, [gl, clock]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    let targetYaw = 0;
    let targetPitch = 0;

    if (enabled && !reducedMotion.current) {
      if (t - lastMoveAt.current > IDLE_AFTER) {
        // Idle sway so the head never freezes.
        targetYaw = Math.sin(t * 0.7) * IDLE_YAW;
        targetPitch = Math.sin(t * 0.5) * IDLE_PITCH;
      } else if (hovered.current) {
        // The beak faces +world Z and the camera sits at +Z, so +pointer.x must
        // rotate the head toward +world X and +pointer.y (up) must tip it up.
        targetYaw = state.pointer.x * MAX_YAW;
        targetPitch = -state.pointer.y * MAX_PITCH;
      }
      // Pointer outside the canvas ⇒ targets stay 0 and the head recentres.
    }

    const k = Math.min(1, delta * DAMPING);
    headUniforms.uYaw.value += (targetYaw - headUniforms.uYaw.value) * k;
    headUniforms.uPitch.value += (targetPitch - headUniforms.uPitch.value) * k;
  });
}
