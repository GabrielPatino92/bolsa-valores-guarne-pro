import { render, screen } from '@testing-library/react';
import App from '../src/app/App.jsx';

describe('App smoke test', () => {
  it('renders the application shell', () => {
    render(<App />);

    expect(screen.getByText(/bolsa de valores guarne pro/i)).toBeTruthy();
    expect(screen.getByText(/scaffold limpio para el frontend del monorepo/i)).toBeTruthy();
  });
});
