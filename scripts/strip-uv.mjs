// Strips vertex attributes the Tux model does not use, before the file is
// re-compressed with DRACO. All three materials are untextured, so TEXCOORD_0
// is 8 bytes per vertex that the GPU never samples.
//
//   npx @gltf-transform/cli@4 copy public/models/tux.glb /tmp/tux-plain.glb
//   node scripts/strip-uv.mjs /tmp/tux-plain.glb /tmp/tux-stripped.glb
//   npx @gltf-transform/cli@4 draco /tmp/tux-stripped.glb /tmp/tux-min.glb
//
// Requires @gltf-transform/core and @gltf-transform/functions at run time; it
// is a maintenance script, not part of the build, so they are not dependencies.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune } from "@gltf-transform/functions";

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

const doc = await io.read(process.argv[2]);

let removed = 0;
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    for (const semantic of prim.listSemantics()) {
      if (semantic.startsWith("TEXCOORD") || semantic.startsWith("COLOR")) {
        prim.setAttribute(semantic, null);
        removed++;
      }
    }
  }
}

await doc.transform(dedup(), prune({ keepAttributes: true, keepLeaves: true }));

await io.write(process.argv[3], doc);
console.log(`dropped ${removed} attribute sets → ${process.argv[3]}`);
