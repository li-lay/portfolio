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
  /** 1 at rest; < 1 squashes the whole head toward HEAD_PIVOT (blink / click). */
  uHeadScale: { value: number };
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

/** Blink: 1 → 1 - BLINK_SQUASH → 1 over BLINK_SECONDS, every 4–7 s. */
const BLINK_SECONDS = 0.14;
const BLINK_SQUASH = 0.035;
const BLINK_MIN = 4;
const BLINK_MAX = 7;

/** Click wobble impulse (rad/s) and how fast it bleeds off. */
const CLICK_YAW_VEL = 2.5;
const CLICK_PITCH_VEL = 1.2;
const WOBBLE_DAMPING = 7;

/** A wobble may overshoot the look limits slightly, but not bend the neck. */
const WOBBLE_YAW_LIMIT = MAX_YAW * 1.6;
const WOBBLE_PITCH_LIMIT = MAX_PITCH * 1.6;

/** Shared by all three Tux materials so a single write drives the whole head. */
const headUniforms: HeadUniforms = {
  uYaw: { value: 0 },
  uPitch: { value: 0 },
  uHeadScale: { value: 1 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const PROGRAM_CACHE_KEY = "tux-head-rig";

// Neck blend band in local z: 58 (below the neck pinch) → 66 (solid head).
const HEAD_RIG_GLSL = /* glsl */ `
uniform float uYaw;
uniform float uPitch;
uniform float uHeadScale;
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

// The squash is applied to the head's offset from the pivot, not to world
// space, so only the rigged region shrinks while the body stays put.
const POSITION_PATCH = /* glsl */ `#include <begin_vertex>
  transformed = mix(transformed, headRot * ((position - HEAD_PIVOT) * uHeadScale) + HEAD_PIVOT, headBlend);`;

type PatchableMaterial = Material & { __headRigPatched?: boolean };

function patchMaterial(material: PatchableMaterial | undefined) {
  if (!material || material.__headRigPatched) return;
  material.__headRigPatched = true;

  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    // Same uniform objects for every material ⇒ one update moves the whole head.
    shader.uniforms.uYaw = headUniforms.uYaw;
    shader.uniforms.uPitch = headUniforms.uPitch;
    shader.uniforms.uHeadScale = headUniforms.uHeadScale;

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

  // Last viewport-space pointer sample; `t` is -Infinity ⇒ idle from frame one
  // (and no sample is dropped when the cursor leaves the canvas).
  const pointer = useRef({ x: 0, y: 0, t: -Infinity });
  const reducedMotion = useRef(false);

  // Click wobble: integrated into the yaw/pitch values, then bled off.
  const yawVel = useRef(0);
  const pitchVel = useRef(0);
  // Squash (blink or click) start time on the shared clock; null ⇒ at rest.
  const squashAt = useRef<number | null>(null);
  const nextBlinkAt = useRef<number | null>(null);

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
        headUniforms.uHeadScale.value = 1;
        yawVel.current = 0;
        pitchVel.current = 0;
        squashAt.current = null;
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;

    // Track the cursor across the whole page (passive ⇒ never blocks scrolling)
    // and keep the last sample: leaving the canvas must not recentre the head.
    const onMove = (event: PointerEvent) => {
      pointer.current = {
        x: event.clientX,
        y: event.clientY,
        t: clock.elapsedTime,
      };
    };

    // Click nudge. No preventDefault: OrbitControls still gets the drag.
    const onDown = () => {
      if (!enabled || reducedMotion.current) return;
      yawVel.current += CLICK_YAW_VEL;
      pitchVel.current += CLICK_PITCH_VEL;
      squashAt.current = clock.elapsedTime;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [gl, clock, enabled]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    let targetYaw = 0;
    let targetPitch = 0;

    if (enabled && !reducedMotion.current) {
      if (t - pointer.current.t > IDLE_AFTER) {
        // Idle sway so the head never freezes.
        targetYaw = Math.sin(t * 0.7) * IDLE_YAW;
        targetPitch = Math.sin(t * 0.5) * IDLE_PITCH;
      } else {
        // Map the viewport cursor onto the canvas' own bounds, relative to its
        // centre, then clamp so a cursor far away pins the head at its limit.
        // The beak faces +world Z and the camera sits at +Z, so +nx must rotate
        // the head toward +world X; +ny is up-screen, matching the old pointer.y.
        const rect = gl.domElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const nx = clamp(
            (pointer.current.x - (rect.left + rect.width / 2)) /
              (rect.width / 2),
            -1,
            1,
          );
          const ny = clamp(
            -((pointer.current.y - (rect.top + rect.height / 2)) /
              (rect.height / 2)),
            -1,
            1,
          );
          targetYaw = nx * MAX_YAW;
          targetPitch = -ny * MAX_PITCH;
        }
      }
    }

    const k = Math.min(1, delta * DAMPING);
    headUniforms.uYaw.value += (targetYaw - headUniforms.uYaw.value) * k;
    headUniforms.uPitch.value += (targetPitch - headUniforms.uPitch.value) * k;

    const motion = enabled && !reducedMotion.current;

    // Click wobble: integrate the impulse, then let it decay. The damping above
    // keeps pulling the values back toward the pointer target.
    if (motion) {
      headUniforms.uYaw.value += yawVel.current * delta;
      headUniforms.uPitch.value += pitchVel.current * delta;

      const decay = Math.exp(-WOBBLE_DAMPING * delta);
      yawVel.current *= decay;
      pitchVel.current *= decay;
      if (Math.abs(yawVel.current) < 0.01) yawVel.current = 0;
      if (Math.abs(pitchVel.current) < 0.01) pitchVel.current = 0;

      headUniforms.uYaw.value = clamp(
        headUniforms.uYaw.value,
        -WOBBLE_YAW_LIMIT,
        WOBBLE_YAW_LIMIT,
      );
      headUniforms.uPitch.value = clamp(
        headUniforms.uPitch.value,
        -WOBBLE_PITCH_LIMIT,
        WOBBLE_PITCH_LIMIT,
      );
    } else {
      yawVel.current = 0;
      pitchVel.current = 0;
    }

    // Blink scheduling lives on the shared clock — no timers of our own.
    let squash = 0;
    if (motion) {
      if (nextBlinkAt.current === null) {
        nextBlinkAt.current =
          t + BLINK_MIN + Math.random() * (BLINK_MAX - BLINK_MIN);
      }
      if (t >= nextBlinkAt.current) {
        squashAt.current = t;
        nextBlinkAt.current =
          t + BLINK_MIN + Math.random() * (BLINK_MAX - BLINK_MIN);
      }

      if (squashAt.current !== null) {
        const age = t - squashAt.current;
        if (age >= 0 && age <= BLINK_SECONDS) {
          // Triangle 0 → 1 → 0 across the blink window.
          squash = 1 - Math.abs((age / BLINK_SECONDS) * 2 - 1);
        }
      }
    } else {
      squashAt.current = null;
      nextBlinkAt.current = null;
    }

    headUniforms.uHeadScale.value = 1 - BLINK_SQUASH * squash;
  });
}
