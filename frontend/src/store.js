// store.js
import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";

// Helper to load state from localStorage
const loadState = () => {
  try {
    const saved = localStorage.getItem("pipeline-state");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load state:", e);
  }
  return null;
};

const savedState = loadState();

const MAX_HISTORY = 50;

export const useStore = create((set, get) => ({
  theme: savedState?.theme || "dark",
  nodes: savedState?.nodes || [],
  edges: savedState?.edges || [],
  nodeIDs: savedState?.nodeIDs || {},
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  saveTimeout: null, // Timeout for debouncing saves
  
  // Helper to save state to history with debouncing
  saveToHistory: (newNodes, newEdges, immediate = false) => {
    // Clear any existing timeout
    if (get().saveTimeout) {
      clearTimeout(get().saveTimeout);
    }
    
    const saveAction = () => {
      const { history, historyIndex } = get();
      const currentState = { 
        nodes: newNodes || get().nodes, 
        edges: newEdges || get().edges 
      };
      
      // Don't save if this is the same as the last history entry
      if (history.length > 0 && historyIndex >= 0) {
        const lastState = history[historyIndex];
        if (lastState && 
            JSON.stringify(lastState.nodes) === JSON.stringify(currentState.nodes) &&
            JSON.stringify(lastState.edges) === JSON.stringify(currentState.edges)) {
          return; // Skip duplicate
        }
      }
      
      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      
      // Add current state to history
      newHistory.push(currentState);
      
      // Limit history size
      while (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
        saveTimeout: null,
      });
    };
    
    if (immediate) {
      saveAction();
    } else {
      // Debounce saves to prevent duplicate entries
      set({ saveTimeout: setTimeout(saveAction, 100) });
    }
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      // Clear any pending save
      if (get().saveTimeout) {
        clearTimeout(get().saveTimeout);
        set({ saveTimeout: null });
      }
      
      const prevState = history[historyIndex - 1];
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: historyIndex - 1,
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      // Clear any pending save
      if (get().saveTimeout) {
        clearTimeout(get().saveTimeout);
        set({ saveTimeout: null });
      }
      
      const nextState = history[historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: historyIndex + 1,
      });
    }
  },
  
  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: newTheme });
    document.body.classList.toggle("light-mode", newTheme === "light");
  },
  
  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}_${newIDs[type]}`;
  },
  
  addNode: (node) => {
    const newNodes = [...get().nodes, node];
    set({ nodes: newNodes });
    get().saveToHistory(newNodes, get().edges);
  },
  
  onNodesChange: (changes) => {
    const newNodes = applyNodeChanges(changes, get().nodes);
    set({ nodes: newNodes });
    get().saveToHistory(newNodes, get().edges);
  },
  
  onEdgesChange: (changes) => {
    const newEdges = applyEdgeChanges(changes, get().edges);
    set({ edges: newEdges });
    get().saveToHistory(get().nodes, newEdges);
  },
  
  onConnect: (connection) => {
    const newEdges = addEdge(
      {
        ...connection,
        id: `${connection.source}-${connection.target}-${Date.now()}`,
        type: "smoothstep",
        animated: true,
        markerEnd: { type: MarkerType.Arrow, height: "20px", width: "20px" },
      },
      get().edges,
    );
    set({ edges: newEdges });
    // Save immediately tocapture the connection
    get().saveToHistory(get().nodes, newEdges, true);
  },
  
  updateNodeField: (nodeId, fieldName, fieldValue) => {
    const newNodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, [fieldName]: fieldValue },
        };
      }
      return node;
    });
    set({ nodes: newNodes });
    get().saveToHistory(newNodes, get().edges);
  },
  
  deleteNode: (nodeId) => {
    const newNodes = get().nodes.filter((node) => node.id !== nodeId);
    const newEdges = get().edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );
    set({ nodes: newNodes, edges: newEdges });
    get().saveToHistory(newNodes, newEdges);
  },
  
  deleteEdge: (edgeId) => {
    const newEdges = get().edges.filter((edge) => edge.id !== edgeId);
    set({ edges: newEdges });
    get().saveToHistory(get().nodes, newEdges, true);
  },
  
  save: () => {
    const state = get();
    localStorage.setItem(
      "pipeline-state",
      JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
        theme: state.theme,
      }),
    );
  },
  
  reset: () => {
    // Clear any pending save
    if (get().saveTimeout) {
      clearTimeout(get().saveTimeout);
    }
    
    const newState = { nodes: [], edges: [], nodeIDs: {} };
    set(newState);
    // Reset history
    set({
      history: [],
      historyIndex: -1,
      saveTimeout: null,
    });
    // Save the empty state as the first history entry
    get().saveToHistory(newState.nodes, newState.edges, true);
    localStorage.removeItem("pipeline-state");
  },
}));