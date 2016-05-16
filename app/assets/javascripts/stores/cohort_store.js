import StockStore from './stock_store.coffee';

let CohortStore = new StockStore(
  {modelKey: 'cohort'}
);

export default CohortStore.store;
