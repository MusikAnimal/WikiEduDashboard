import McFly from 'mcfly';
let Flux            = new McFly();


// Data
let _open_key = null;


// Utilities
let setOpenKey = function(key) {
  if (key === _open_key) {
    _open_key = null;
  } else {
    _open_key = key;
  }
  return UIStore.emitChange();
};


// Store
var UIStore = Flux.createStore({
  getOpenKey() {
    return _open_key;
  }
}
, function(payload) {
  let { data } = payload;
  switch(payload.actionType) {
    case 'OPEN_KEY':
      setOpenKey(data.key);
      break;
  }
  return true;
});

UIStore.setMaxListeners(0);

export default UIStore;
