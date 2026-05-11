// src/store.test.js
import { useStore } from './store';

// Don't mock the store for these tests
jest.unmock('./store');

describe('Pipeline Store', () => {
  let store;
  
  beforeEach(async () => {
    // Get fresh store instance
    jest.resetModules();
    const storeModule = await import('./store');
    store = storeModule.useStore;
    
    // Reset store state
    store.setState({
      nodes: [],
      edges: [],
      nodeIDs: {},
      history: [],
      historyIndex: -1,
      saveTimeout: null,
      lastSavedState: null,
    });
  });

  describe('Node Management', () => {
    it('should add a new node', () => {
      const newNode = {
        id: 'test_1',
        type: 'customInput',
        position: { x: 100, y: 100 },
        data: {}
      };
      
      store.getState().addNode(newNode);
      const nodes = store.getState().nodes;
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('test_1');
    });

    it('should generate unique node IDs', () => {
      const { getNodeID } = store.getState();
      
      const id1 = getNodeID('customInput');
      const id2 = getNodeID('customInput');
      
      expect(id1).toMatch(/customInput_\d+/);
      expect(id2).toMatch(/customInput_\d+/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Save and Reset', () => {
    it('should save state to localStorage', () => {
      const { save } = store.getState();
      save();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should reset the pipeline', () => {
      const { addNode, reset } = store.getState();
      
      const node = { id: 'test_1', type: 'input', position: { x: 0, y: 0 }, data: {} };
      addNode(node);
      
      expect(store.getState().nodes.length).toBe(1);
      
      reset();
      
      expect(store.getState().nodes).toHaveLength(0);
      expect(store.getState().edges).toHaveLength(0);
    });
  });
});