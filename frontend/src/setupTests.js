// src/setupTests.js
import '@testing-library/jest-dom';

// Mock DataTransfer before any tests run
class MockDataTransfer {
  constructor() {
    this.data = {};
    this.dropEffect = 'none';
    this.effectAllowed = 'none';
    this.files = [];
    this.items = [];
    this.types = [];
  }
  
  setData(format, data) {
    this.data[format] = data;
    this.types.push(format);
  }
  
  getData(format) {
    return this.data[format];
  }
  
  clearData(format) {
    if (format) {
      delete this.data[format];
    } else {
      this.data = {};
    }
  }
  
  setDragImage() {}
}

// Replace window.DataTransfer
Object.defineProperty(window, 'DataTransfer', {
  value: MockDataTransfer,
  writable: true,
  configurable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Mock ReactFlow
jest.mock('reactflow', () => ({
  ReactFlow: ({ children, ...props }) => <div data-testid="reactflow" {...props}>{children}</div>,
  ReactFlowProvider: ({ children }) => <div data-testid="reactflow-provider">{children}</div>,
  Controls: () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  MiniMap: () => <div data-testid="minimap" />,
  Handle: ({ children, ...props }) => <div data-testid="handle" {...props}>{children}</div>,
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
  MarkerType: { Arrow: 'arrow' },
  addEdge: jest.fn((edge, edges) => [...edges, edge]),
  applyNodeChanges: jest.fn((changes, nodes) => nodes),
  applyEdgeChanges: jest.fn((changes, edges) => edges),
  useReactFlow: () => ({
    project: jest.fn((position) => position),
    fitView: jest.fn(),
    zoomTo: jest.fn(),
  }),
}));

// Mock draft-js
jest.mock('draft-js', () => ({
  Editor: ({ children, onChange, ...props }) => (
    <div data-testid="draft-editor" onChange={onChange} {...props}>
      {children}
    </div>
  ),
  EditorState: {
    createEmpty: jest.fn(() => ({
      getCurrentContent: () => ({ getPlainText: () => '', getBlockMap: () => new Map() }),
    })),
    createWithContent: jest.fn(() => ({
      getCurrentContent: () => ({ getPlainText: () => '', getBlockMap: () => new Map() }),
    })),
    push: jest.fn((state, content, type) => state),
    forceSelection: jest.fn((state, selection) => state),
  },
  CompositeDecorator: jest.fn(),
  Modifier: {
    replaceText: jest.fn(),
    insertText: jest.fn(),
  },
}));

// Mock store
jest.mock('./store', () => ({
  useStore: jest.fn(),
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.getItem.mockReset();
  localStorage.setItem.mockReset();
  localStorage.removeItem.mockReset();
  localStorage.clear.mockReset();
  fetch.mockReset();
});