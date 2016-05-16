import McFly from 'mcfly';
const Flux = new McFly();

let DidYouKnowStore;
const _articles = [];

const setArticles = (data) => {
  DidYouKnowStore.empty();
  data.articles.forEach((article) => { return _articles.push(article); });
  DidYouKnowStore.emitChange();
};

DidYouKnowStore = Flux.createStore({
  empty() {
    return _articles.length = 0;
  },

  getArticles() {
    return _articles;
  }
}, (payload) => {
  const data = payload.data;
  switch (payload.actionType) {
    case 'RECEIVE_DYK':
      setArticles(data);
      break;
    default:
      return null;
  }
});

export default DidYouKnowStore;
