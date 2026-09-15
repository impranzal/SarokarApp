import { render, screen, waitFor } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import Dashboard from '../pages/Dashboard';

vi.mock('react-router-dom', () => ({ useParams: () => ({ consultationId: 'consultation-1' }) }));
vi.mock('../api/client', () => ({
  default: {
    defaults: { baseURL: '/api' },
    get: vi.fn().mockResolvedValue({
      data: {
        consultation: { title: 'Test consultation' },
        totalFeedback: 2,
        stanceBreakdown: [{ _id: 'support', count: 1 }, { _id: 'oppose', count: 1 }],
        volumeOverTime: [{ _id: '2026-01-01', count: 2 }],
        topCategories: [{ _id: 'economic-impact', count: 2 }],
        keywordCloud: [{ _id: 'tax', count: 2 }],
        representativeByCategory: {},
        flaggedQueue: [],
      },
    }),
  },
}));

test('renders dashboard summary and chart sections from API data', async () => {
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Test consultation')).toBeInTheDocument());
  expect(screen.getByText('Stance breakdown')).toBeInTheDocument();
  expect(screen.getByText('Volume over time')).toBeInTheDocument();
  expect(screen.getByText('tax')).toBeInTheDocument();
});
