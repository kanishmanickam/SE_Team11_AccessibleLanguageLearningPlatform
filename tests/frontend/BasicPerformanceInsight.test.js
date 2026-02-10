// Unit tests for Basic Performance Insight (EPIC-6.6)
// Uses Jest and React Testing Library

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressDashboard from '../../frontend/src/components/ProgressDashboard';

jest.mock('../../frontend/src/services/progressService', () => ({
  getProgressSummary: jest.fn(() => Promise.resolve({
    totalLessons: 10,
    completedLessons: 7,
    remainingLessons: 3,
    percentage: 70,
  })),
}));

describe('Basic Performance Insight (EPIC-6.6)', () => {
  it('shows total lessons completed', async () => {
    render(<ProgressDashboard />);
    expect(await screen.findByText(/7 \/ 10 lessons completed/i)).toBeInTheDocument();
  });

  it('shows remaining lessons', async () => {
    render(<ProgressDashboard />);
    expect(await screen.findByText(/3 lessons remaining/i)).toBeInTheDocument();
  });

  it('keeps insight text-based (no charts)', async () => {
    render(<ProgressDashboard />);
    expect(screen.queryByTestId('progress-chart')).toBeNull();
  });

  it('avoids complex analytics', async () => {
    render(<ProgressDashboard />);
    expect(screen.queryByText(/Analytics/i)).toBeNull();
  });
});
