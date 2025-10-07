# Local Draco decoder assets

This directory intentionally contains placeholder files so the DRACOLoader stub can
resolve local paths without reaching external CDNs. The project currently builds the
tower procedurally and does not load Draco-compressed meshes.

If future assets require Draco decoding, place the appropriate `draco_decoder.js`,
`draco_wasm_wrapper.js`, and `draco_decoder.wasm` binaries exported from the matching
Three.js release inside this folder and update any loader configuration accordingly.
