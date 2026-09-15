import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, expect } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null, loading: false }) }));
test('redirects unauthenticated users', () => {
  render(<MemoryRouter initialEntries={['/private']}><ProtectedRoute><p>Private</p></ProtectedRoute></MemoryRouter>);
  expect(screen.queryByText('Private')).not.toBeInTheDocument();
});
