(function(){
  if (!window.THREE || window.THREE.KTX2Loader) {
    return;
  }
  class KTX2Loader extends THREE.Loader {
    constructor(manager) {
      super(manager);
      this.transcoderPath = '';
      this.workerConfig = {};
    }
    setTranscoderPath(path) {
      this.transcoderPath = path;
      return this;
    }
    detectSupport(renderer) {
      return this;
    }
    dispose() {}
    load(url, onLoad, onProgress, onError) {
      console.warn('KTX2Loader stub attiva: impossibile caricare', url);
      if (typeof onError === 'function') {
        onError(new Error('KTX2 decoding non disponibile in modalità offline.'));
      }
    }
    init() {
      return Promise.resolve();
    }
  }
  window.THREE.KTX2Loader = KTX2Loader;
})();
