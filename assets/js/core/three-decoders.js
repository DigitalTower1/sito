(() => {
  const LOCAL_VENDOR_ROOT = "assets/js/vendor/three/";
  const DRACO_DECODER_BASE = `${LOCAL_VENDOR_ROOT}draco/`;
  const MESHOPT_SRC = `${LOCAL_VENDOR_ROOT}meshopt_decoder.js`;
  const DRACO_LOADER_SRC = `${LOCAL_VENDOR_ROOT}DRACOLoader.js`;
  const KTX2_LOADER_SRC = `${LOCAL_VENDOR_ROOT}KTX2Loader.js`;
  const BASIS_TRANSCODER_SRC = `${LOCAL_VENDOR_ROOT}basis_transcoder.js`;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(existing));
        existing.addEventListener("error", (event) => reject(event));
        if (existing.dataset.loaded === "true") {
          resolve(existing);
        }
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve(script);
      });
      script.addEventListener("error", (event) => reject(event));
      document.head.appendChild(script);
    });
  }

  function ensureThree() {
    return new Promise((resolve) => {
      if (window.THREE) {
        resolve(window.THREE);
        return;
      }
      window.addEventListener("threejs-ready", () => resolve(window.THREE), { once: true });
    });
  }

  async function prepareDecoders() {
    const THREE_NS = await ensureThree();
    if (!THREE_NS) {
      return;
    }

    const tasks = [];

    if (!window.MeshoptDecoder) {
      tasks.push(
        loadScript(MESHOPT_SRC).catch(() => {
          console.warn("Meshopt decoder non caricato");
        }),
      );
    }

    const needsDraco = !THREE_NS.DRACOLoader;
    if (needsDraco) {
      tasks.push(
        loadScript(DRACO_LOADER_SRC)
          .then(() => {
            if (THREE_NS.DRACOLoader) {
              THREE_NS.DRACOLoader.setDecoderConfig({ type: "js" });
              THREE_NS.DRACOLoader.setDecoderPath(DRACO_DECODER_BASE);
            }
          })
          .catch(() => {
            console.warn("DRACO loader non disponibile");
          }),
      );
    }

    const needsKTX2 = !THREE_NS.KTX2Loader;
    if (needsKTX2) {
      tasks.push(
        loadScript(KTX2_LOADER_SRC)
          .then(() => loadScript(BASIS_TRANSCODER_SRC))
          .then(() => {
            if (THREE_NS.KTX2Loader) {
              THREE_NS.KTX2Loader.BasisWorkerUrl = BASIS_TRANSCODER_SRC;
            }
          })
          .catch(() => {
            console.warn("KTX2 loader non disponibile");
          }),
      );
    }

    await Promise.all(tasks);

    if (THREE_NS.DRACOLoader && typeof THREE_NS.DRACOLoader.getDecoderModule === "function") {
      THREE_NS.DRACOLoader.getDecoderModule({});
    }

    if (THREE_NS.KTX2Loader && window.WorkerGlobalScope) {
      THREE_NS.KTX2Loader.workerConfig = {
        id: "ktx2-transcoder",
        url: BASIS_TRANSCODER_SRC,
      };
    }

    if (window.MeshoptDecoder && THREE_NS.GLTFLoader && THREE_NS.GLTFLoader.prototype.setMeshoptDecoder) {
      THREE_NS.GLTFLoader.prototype.setMeshoptDecoder(window.MeshoptDecoder);
    }
  }

  if (document.readyState === "complete") {
    prepareDecoders();
  } else {
    window.addEventListener("load", prepareDecoders, { once: true });
  }
})();
