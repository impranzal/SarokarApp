import { render, screen } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import FeedbackForm from '../components/FeedbackForm';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
test('prompts visitors to log in', () => {
  render(<FeedbackForm consultation={{ _id: '1' }} />);
  expect(screen.getByText(/log in as a citizen/i)).toBeInTheDocument();
});
