// src/submit.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitButton } from './submit';
import { useStore } from './store';

jest.mock('./store', () => ({
  useStore: jest.fn()
}));

describe('SubmitButton', () => {
  const mockNodes = [{ id: 'node1', type: 'input' }, { id: 'node2', type: 'output' }];
  const mockEdges = [{ source: 'node1', target: 'node2' }];
  const mockApiResponse = { num_nodes: 2, num_edges: 1, is_dag: true };

  beforeEach(() => {
    useStore.mockImplementation((selector) => {
      const state = {
        nodes: mockNodes,
        edges: mockEdges
      };
      return selector(state);
    });
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });
  });

  it('renders submit button', () => {
    render(<SubmitButton />);
    expect(screen.getByText('SUBMIT')).toBeInTheDocument();
  });

  it('submits pipeline data to API', async () => {
    render(<SubmitButton />);
    const button = screen.getByText('SUBMIT');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/pipelines/parse',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes: mockNodes, edges: mockEdges })
        })
      );
    });
  });

  it('displays modal with pipeline summary on successful submission', async () => {
    render(<SubmitButton />);
    const button = screen.getByText('SUBMIT');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Pipeline Summary')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // num_nodes
      expect(screen.getByText('1')).toBeInTheDocument(); // num_edges
      expect(screen.getByText('YES')).toBeInTheDocument(); // is_dag
    });
  });

  it('shows error alert when API call fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    window.alert = jest.fn();
    
    render(<SubmitButton />);
    const button = screen.getByText('SUBMIT');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Error submitting pipeline')
      );
    });
  });

  it('closes modal when close button is clicked', async () => {
    render(<SubmitButton />);
    const button = screen.getByText('SUBMIT');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Pipeline Summary')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Pipeline Summary')).not.toBeInTheDocument();
    });
  });
});