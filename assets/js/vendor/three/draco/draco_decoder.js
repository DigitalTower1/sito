/*
 * Placeholder Draco decoder stub.
 *
 * The project currently does not rely on Draco-compressed meshes. This file exists to
 * satisfy local decoder path resolution without touching external CDNs. Replace this
 * stub with the official Draco decoder build (JS or WASM) if compressed assets are
 * introduced in the future.
 */

self.DracoDecoderModule = function DracoDecoderModule() {
  return Promise.reject(new Error("Draco decoder placeholder: provide official decoder binaries."));
};
