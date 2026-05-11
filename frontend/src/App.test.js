// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock child components to simplify testing
jest.mock('./toolbar', () => ({
  PipelineToolbar: () => <div data-testid="mock-toolbar">Toolbar</div>
}));

jest.mock('./ui', () => ({
  PipelineUI: () => <div data-testid="mock-ui">UI</div>
}));

jest.mock('./submit', () => ({
  SubmitButton: () => <div data-testid="mock-submit">Submit</div>
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('mock-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-ui')).toBeInTheDocument();
    expect(screen.getByTestId('mock-submit')).toBeInTheDocument();
  });
});