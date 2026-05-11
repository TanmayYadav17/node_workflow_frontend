// src/nodes/BaseNode.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

// Mock the store
jest.mock('../store', () => ({
  useStore: jest.fn()
}));

// Mock CSS
jest.mock('./BaseNode.css', () => ({}));

describe('BaseNode', () => {
  const mockDeleteNode = jest.fn();
  const mockUpdateNodeField = jest.fn();
  
  beforeEach(() => {
    mockDeleteNode.mockClear();
    mockUpdateNodeField.mockClear();
    
    const mockNodes = [{ id: 'test_1', data: { name: 'Test Node', outputs: ['output1'] } }];
    
    useStore.mockImplementation((selector) => {
      const state = {
        deleteNode: mockDeleteNode,
        updateNodeField: mockUpdateNodeField,
        nodes: mockNodes,
      };
      return selector(state);
    });
  });

  it('renders with title', () => {
    render(<BaseNode id="test_1" title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <BaseNode id="test_1" title="Test">
        <div>Child Content</div>
      </BaseNode>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('calls deleteNode when delete button is clicked', () => {
    render(<BaseNode id="test_1" title="Test Title" />);
    // Get all buttons with '×' and use the first one (the delete node button)
    const deleteButtons = screen.getAllByText('×');
    // The first '×' button is the delete node button
    const deleteNodeButton = deleteButtons[0];
    fireEvent.click(deleteNodeButton);
    expect(mockDeleteNode).toHaveBeenCalledWith('test_1');
  });

  it('allows name editing', () => {
    render(<BaseNode id="test_1" title="Test Title" />);
    const nameInput = screen.getByLabelText('Name:');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(mockUpdateNodeField).toHaveBeenCalledWith('test_1', 'name', 'New Name');
  });
});