(function(){
  if (window.MeshoptDecoder) {
    return;
  }
  const decoder = {
    supported: false,
    ready: Promise.resolve(),
    decodeGltfBuffer: function(source, count, stride, mode, filter) {
      return Promise.resolve(source);
    },
    decodeGltfBufferAsync: function(source, count, stride, mode, filter) {
      return Promise.resolve(source);
    },
  };
  window.MeshoptDecoder = decoder;
})();
