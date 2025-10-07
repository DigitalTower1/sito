(function(){
  if (!window.THREE || window.THREE.DRACOLoader) {
    return;
  }
  class DRACOLoader extends THREE.Loader {
    constructor(manager) {
      super(manager);
      this.decoderPath = DRACOLoader.decoderPath || '';
      this.decoderConfig = Object.assign({}, DRACOLoader.decoderConfig || {});
    }
    setDecoderPath(path) {
      this.decoderPath = path;
      DRACOLoader.decoderPath = path;
      return this;
    }
    setDecoderConfig(config) {
      this.decoderConfig = Object.assign({}, config);
      DRACOLoader.decoderConfig = Object.assign({}, config);
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
  DRACOLoader.decoderPath = '';
  DRACOLoader.decoderConfig = {};
  DRACOLoader.decoderModulePromise = null;
  DRACOLoader.setDecoderPath = function (path) {
    DRACOLoader.decoderPath = path || '';
    return DRACOLoader;
  };
  DRACOLoader.setDecoderConfig = function (config) {
    DRACOLoader.decoderConfig = Object.assign({}, config);
    return DRACOLoader;
  };
  DRACOLoader.getDecoderModule = function () {
    if (!DRACOLoader.decoderModulePromise) {
      DRACOLoader.decoderModulePromise = Promise.resolve({});
    }
    return DRACOLoader.decoderModulePromise;
  };
  DRACOLoader.releaseDecoderModule = function () {
    DRACOLoader.decoderModulePromise = null;
  };
  window.THREE.DRACOLoader = DRACOLoader;
})();
