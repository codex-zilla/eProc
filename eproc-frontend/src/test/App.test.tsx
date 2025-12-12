import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple test to verify Vitest setup works
describe('Vitest Setup', () => {
  it('renders a simple div', () => {
    render(<div data-testid="test">Hello World</div>);
    expect(screen.getByTestId('test')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('basic assertion works', () => {
    expect(1 + 1).toBe(2);
  });
});
