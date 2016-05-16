import StockStore from './stock_store.coffee';

let RevisionStore = new StockStore({
  sortKey: 'date',
  sortAsc: false,
  descKeys: {
    date: true,
    characters: true
  },
  modelKey: 'revision'
}
);

export default RevisionStore.store;
