(function(){
  if (!window.THREE || window.THREE.DRACOLoader) {
    return;
  }
  class DRACOLoader extends THREE.Loader {
    constructor(manager) {
      super(manager);
      this.decoderPath = '';
      this.decoderConfig = {};
    }
    setDecoderPath(path) {
      this.decoderPath = path;
      return this;
    }
    setDecoderConfig(config) {
      this.decoderConfig = Object.assign({}, config);
      return this;
    }
    load(url, onLoad, onProgress, onError) {
      console.warn('DRACOLoader stub attiva: impossibile decodificare', url);
      if (typeof onError === 'function') {
        onError(new Error('DRACO decoding non disponibile in modalità offline.'));
      }
    }
    parse() {
      console.warn('DRACOLoader.parse chiamata senza decoder reale.');
    }
    preload() {}
    dispose() {}
  }
  window.THREE.DRACOLoader = DRACOLoader;
})();
