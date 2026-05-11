// src/draggableNode.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableNode } from './draggableNode';

describe('DraggableNode', () => {
  it('renders with correct label', () => {
    render(<DraggableNode type="test" label="Test Node" />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('has draggable attribute', () => {
    render(<DraggableNode type="test" label="Test Node" />);
    const element = screen.getByText('Test Node').parentElement;
    expect(element).toHaveAttribute('draggable', 'true');
  });

  it('handles drag start without errors', () => {
    render(<DraggableNode type="customInput" label="Input Node" />);
    const element = screen.getByText('Input Node').parentElement;
    
    // Create a mock drag event with dataTransfer
    const dragStartEvent = new Event('dragstart', { bubbles: true, cancelable: true });
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: {
        setData: jest.fn(),
        effectAllowed: 'move',
      },
    });
    
    // This should not throw an error
    expect(() => {
      element.dispatchEvent(dragStartEvent);
    }).not.toThrow();
  });

  it('changes cursor on drag start and end', () => {
    render(<DraggableNode type="test" label="Test Node" />);
    const element = screen.getByText('Test Node').parentElement;
    
    const dragStartEvent = new Event('dragstart', { bubbles: true, cancelable: true });
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: {
        setData: jest.fn(),
        effectAllowed: 'move',
      },
    });
    
    element.dispatchEvent(dragStartEvent);
    expect(element.style.cursor).toBe('grabbing');
    
    fireEvent.dragEnd(element);
    expect(element.style.cursor).toBe('grab');
  });
});