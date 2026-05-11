// src/toolbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PipelineToolbar } from './toolbar';
import { useStore } from './store';

jest.mock('./store', () => ({
  useStore: jest.fn()
}));

jest.mock('./draggableNode', () => ({
  DraggableNode: ({ type, label }) => <div data-testid={`node-${type}`}>{label}</div>
}));

describe('PipelineToolbar', () => {
  const mockSave = jest.fn();
  const mockReset = jest.fn();
  const mockToggleTheme = jest.fn();
  const mockUndo = jest.fn();
  const mockRedo = jest.fn();

  beforeEach(() => {
    mockSave.mockClear();
    mockReset.mockClear();
    mockToggleTheme.mockClear();
    mockUndo.mockClear();
    mockRedo.mockClear();
  });

  it('renders category tabs', () => {
    useStore.mockImplementation((selector) => {
      const state = {
        save: mockSave,
        reset: mockReset,
        toggleTheme: mockToggleTheme,
        undo: mockUndo,
        redo: mockRedo,
        theme: 'dark',
        historyIndex: 2,
        history: [{}, {}, {}],
        nodes: [],
        edges: [],
      };
      return selector(state);
    });
    
    render(<PipelineToolbar />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Logic')).toBeInTheDocument();
    expect(screen.getByText('Utility')).toBeInTheDocument();
  });

  it('switches between categories', () => {
    useStore.mockImplementation((selector) => {
      const state = {
        save: mockSave,
        reset: mockReset,
        toggleTheme: mockToggleTheme,
        undo: mockUndo,
        redo: mockRedo,
        theme: 'dark',
        historyIndex: 2,
        history: [{}, {}, {}],
        nodes: [],
        edges: [],
      };
      return selector(state);
    });
    
    render(<PipelineToolbar />);
    const logicTab = screen.getByText('Logic');
    fireEvent.click(logicTab);
    expect(screen.getByTestId('node-math')).toBeInTheDocument();
  });

  it('calls save when save button is clicked', () => {
    useStore.mockImplementation((selector) => {
      const state = {
        save: mockSave,
        reset: mockReset,
        toggleTheme: mockToggleTheme,
        undo: mockUndo,
        redo: mockRedo,
        theme: 'dark',
        historyIndex: 2,
        history: [{}, {}, {}],
        nodes: [],
        edges: [],
      };
      return selector(state);
    });
    
    render(<PipelineToolbar />);
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    expect(mockSave).toHaveBeenCalled();
  });

  it('calls reset when reset button is clicked', () => {
    useStore.mockImplementation((selector) => {
      const state = {
        save: mockSave,
        reset: mockReset,
        toggleTheme: mockToggleTheme,
        undo: mockUndo,
        redo: mockRedo,
        theme: 'dark',
        historyIndex: 2,
        history: [{}, {}, {}],
        nodes: [],
        edges: [],
      };
      return selector(state);
    });
    
    render(<PipelineToolbar />);
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    expect(mockReset).toHaveBeenCalled();
  });

  it('calls undo when undo button is clicked', () => {
    useStore.mockImplementation((selector) => {
      const state = {
        save: mockSave,
        reset: mockReset,
        toggleTheme: mockToggleTheme,
        undo: mockUndo,
        redo: mockRedo,
        theme: 'dark',
        historyIndex: 2,
        history: [{}, {}, {}],
        nodes: [],
        edges: [],
      };
      return selector(state);
    });
    
    render(<PipelineToolbar />);
    const undoButton = screen.getByTitle('Undo (Ctrl+Z)');
    fireEvent.click(undoButton);
    expect(mockUndo).toHaveBeenCalled();
  });

  it('calls redo when redo button is clicked', () => {
    // Set up store with redo enabled
    useStore.mockImplementation((selector) => {
      const state = {
        save: mockSave,
        reset: mockReset,
        toggleTheme: mockToggleTheme,
        undo: mockUndo,
        redo: mockRedo,
        theme: 'dark',
        historyIndex: 0, // Set to 0 so redo is available (history length > index + 1)
        history: [{}, {}, {}], // history length is 3, so index 0 allows redo
        nodes: [],
        edges: [],
      };
      return selector(state);
    });
    
    const { container } = render(<PipelineToolbar />);
    
    // Use getAllByTitle and get the enabled one (not disabled)
    const redoButtons = screen.getAllByTitle('Redo (Ctrl+Y or Ctrl+Shift+Z)');
    // Find the button that's not disabled
    const enabledRedoButton = redoButtons.find(button => !button.hasAttribute('disabled'));
    
    expect(enabledRedoButton).toBeDefined();
    fireEvent.click(enabledRedoButton);
    expect(mockRedo).toHaveBeenCalled();
  });

  it('toggles theme when theme button is clicked', () => {
    useStore.mockImplementation((selector) => {
      const state = {
        save: mockSave,
        reset: mockReset,
        toggleTheme: mockToggleTheme,
        undo: mockUndo,
        redo: mockRedo,
        theme: 'dark',
        historyIndex: 2,
        history: [{}, {}, {}],
        nodes: [],
        edges: [],
      };
      return selector(state);
    });
    
    render(<PipelineToolbar />);
    const themeButton = screen.getByTitle('Switch to Light Mode');
    fireEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalled();
  });
});