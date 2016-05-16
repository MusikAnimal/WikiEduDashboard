import McFly from 'mcfly';
const Flux = new McFly();

import WeekStore from './week_store.js';
import _ from 'lodash';

let _blocks;
let _persisted;
let _trainingModule;
let _editableBlockIds;
let _editingAddedBlock = false;
let BlockStore;

const setBlocks = (data, persisted = false) => {
  data.forEach((week) => {
    return week.blocks.forEach((block) => {
      _blocks[block.id] = block;
      if (persisted) {
        return _persisted[block.id] = $.extend(true, {}, block);
      }
    });
  });
  BlockStore.emitChange();
};

const setBlock = (data, quiet) => {
  _blocks[data.id] = data;
  if (!quiet) {
    return BlockStore.emitChange();
  }
};

const isAddedBlock = (blockId) => {
  // new block ids are set to Date.now()
  return blockId > 1000000000;
};

const setEditableBlockId = (blockId) => {
  _editableBlockIds.push(blockId);
  _editingAddedBlock = isAddedBlock(blockId);
  BlockStore.emitChange();
};

const addBlock = (weekId) => {
  const weekBlocks = _.reject(BlockStore.getBlocksInWeek(weekId), (block) => block.deleted);

  const block = {
    id: Date.now(),
    is_new: true,
    kind: 0,
    title: '',
    content: '',
    gradeable_id: null,
    week_id: weekId,
    order: weekBlocks.length,
    duration: null
  };
  setBlock(block);
  setEditableBlockId(block.id);
};

const removeBlock = (blockId) => {
  delete(_blocks[blockId]);
  _editingAddedBlock = false;
  BlockStore.emitChange();
};

const insertBlock = (block, toWeek, targetIndex) => {
  const fromWeekId = block.week_id;
  block.week_id = toWeek.id;

  if (targetIndex) {
    if (toWeek.id === fromWeekId) {
      block.order = block.order > targetIndex ? targetIndex - 0.5 : targetIndex + 0.5;
    } else {
      const fromWeek = WeekStore.getWeek(fromWeekId);
      block.order = fromWeek.order > toWeek.order ? targetIndex + 999 : targetIndex - 0.5;
    }
  } else {
    block.order = -1;
  }

  setBlock(block, true);

  BlockStore.getBlocksInWeek(fromWeekId).forEach((wBlock, i) => {
    wBlock.order = i;
    setBlock(wBlock, true);
  });

  if (fromWeekId !== toWeek.id) {
    const toWeekBlocks = BlockStore.getBlocksInWeek(toWeek.id);
    toWeekBlocks.forEach((weekBlock, i) => {
      weekBlock.order = i;
      setBlock(weekBlock, true);
    });
  }
  BlockStore.emitChange();
};

BlockStore = Flux.createStore({
  getBlock(blockId) {
    return _blocks[blockId];
  },

  getBlocks() {
    const blockList = [];
    Object.keys(_blocks).map((blockId) => {
      return blockList.push(_blocks[blockId]);
    });
    return blockList;
  },

  getBlocksInWeek(weekId) {
    const blocks = _.filter(_blocks, (block) => { return block.week_id === weekId; });
    return blocks.sort((a, b) => { return a.order - b.order; });
  },

  restore() {
    _blocks = $.extend(true, {}, _persisted);
    _editingAddedBlock = false;
    BlockStore.emitChange();
  },

  getTrainingModule() {
    return _trainingModule;
  },

  getEditableBlockIds() {
    return _editableBlockIds;
  },

  clearEditableBlockIds() {
    _editableBlockIds = [];
    BlockStore.emitChange();
  },

  cancelBlockEditable(blockId) {
    _editableBlockIds.splice(_editableBlockIds.indexOf(blockId), 1);
    _editingAddedBlock = false;
    BlockStore.emitChange();
  },

  editingAddedBlock() {
    return _editingAddedBlock;
  }

}, (payload) => {
  const data = payload.data;
  switch (payload.actionType) {
    case 'RECEIVE_TIMELINE':
    case 'SAVED_TIMELINE':
    case 'WIZARD_SUBMITTED':
      _blocks = {};
      setBlocks(data.course.weeks, true);
      break;
    case 'ADD_BLOCK':
      addBlock(data.week_id);
      break;
    case 'UPDATE_BLOCK':
      setBlock(data.block, data.quiet);
      break;
    case 'DELETE_BLOCK':
      removeBlock(data.block_id);
      break;
    case 'INSERT_BLOCK':
      insertBlock(data.block, data.toWeek, data.afterBlock);
      break;
    case 'SET_BLOCK_EDITABLE':
      setEditableBlockId(data.block_id);
      break;
    default:
      break;
  }
  return true;
});

export default BlockStore;
