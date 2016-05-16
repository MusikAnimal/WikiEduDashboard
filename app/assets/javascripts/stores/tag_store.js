import StockStore from './stock_store.coffee';

let TagStore = new StockStore(
  {modelKey: 'tag'}
);

export default TagStore.store;