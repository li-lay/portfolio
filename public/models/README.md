# tux.glb

Source: https://sketchfab.com/3d-models/tux-157de95fa4014050a969a8361a83d366
(Andy Cuccaro, CC-BY-4.0). Converted with gltfjsx; `components/3D/TuxModel.jsx`
is generated from it.

## Regenerating

The model has no textures — all three materials are solid `baseColorFactor`
values — so `TEXCOORD_0` is dead weight: 8 bytes per vertex that the GPU never
reads. Dropping it and re-compressing took the file from 141,912 to 107,616
bytes with no visible change (same positions, normals and node names).

```bash
npx @gltf-transform/cli@4 copy public/models/tux.glb /tmp/tux-plain.glb
node scripts/strip-uv.mjs /tmp/tux-plain.glb /tmp/tux-stripped.glb
npx @gltf-transform/cli@4 draco /tmp/tux-stripped.glb /tmp/tux-min.glb
mv /tmp/tux-min.glb public/models/tux.glb
```

Node names (`Tux-printable_0..2`) and the mesh order must stay as they are:
`TuxModel.jsx` indexes both by name.

Further reduction is available (`gltf-transform simplify --ratio 0.5`, measured
62 KB) but it is lossy, so it was left out.
