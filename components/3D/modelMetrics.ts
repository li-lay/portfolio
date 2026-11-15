// Single source of truth for the Tux model's world-space dimensions.
//
// Measured from public/models/tux.glb (union AABB of all three meshes, in raw
// GLB units, after each node's -90° X rotation):
//   bottom y = -0.740691   top y = 93.070292
// The model is NOT symmetric about its bbox centre, so placing the group at
// the origin leaves it floating ~2.6 units above y = 0 while its head is
// cropped. MODEL_POSITION below re-centres it on the orbit target.
export const MODEL_SCALE = 0.028;

// Local (scaled) extents before the group offset.
export const MODEL_BOTTOM = -0.740691 * MODEL_SCALE; // ≈ -0.0207393
export const MODEL_TOP = 93.070292 * MODEL_SCALE; // ≈  2.605968
export const MODEL_CENTER_Y = (MODEL_BOTTOM + MODEL_TOP) / 2; // ≈  1.292614
export const MODEL_HALF_HEIGHT = (MODEL_TOP - MODEL_BOTTOM) / 2; // ≈  1.313354

// Offset applied once by the model group: world span becomes ±1.313354.
export const MODEL_POSITION: [number, number, number] = [0, -MODEL_CENTER_Y, 0];

// Feet height inside the offset group ⇒ world y = -1.313354 (the shadow plane).
export const SHADOW_LOCAL_Y = MODEL_BOTTOM;
