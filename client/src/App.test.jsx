import { render, screen } from '@testing-library/react';
import App from './App';

test('renders farm marketplace app', () => {
  render(<App />);
  // Test that the app renders without crashing
  expect(screen.getByText(/Farm Produce Marketplace/i)).toBeInTheDocument();
});
