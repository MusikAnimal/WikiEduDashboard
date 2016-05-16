import McFly from 'mcfly';
const Flux = new McFly();

const _revisions = [];
let SuspectedPlagiarismStore;

const setRevisions = (data) => {
  SuspectedPlagiarismStore.empty();
  data.revisions.forEach((revision) => { return _revisions.push(revision); });
  SuspectedPlagiarismStore.emitChange();
};

SuspectedPlagiarismStore = Flux.createStore({
  empty() {
    return _revisions.length = 0;
  }
}, (payload) => {
  const data = payload.data;
  switch (payload.actionType) {
    case 'RECEIVE_SUSPECTED_PLAGIARISM':
      setRevisions(data);
      break;
    default:
      break;
  }
});

export default SuspectedPlagiarismStore;
