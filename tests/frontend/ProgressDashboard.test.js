// Unit tests for ProgressDashboard (EPIC-6)
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

describe('ProgressDashboard (EPIC-6)', () => {
  it('renders progress summary text', async () => {
    render(<ProgressDashboard />);
    expect(await screen.findByText(/Progress Summary/i)).toBeInTheDocument();
  });

  it('shows completed / total lessons', async () => {
    render(<ProgressDashboard />);
    expect(await screen.findByText(/7 \/ 10 lessons completed/i)).toBeInTheDocument();
  });

  it('shows remaining lessons', async () => {
    render(<ProgressDashboard />);
    expect(await screen.findByText(/3 lessons remaining/i)).toBeInTheDocument();
  });

  it('does not render charts', async () => {
    render(<ProgressDashboard />);
    expect(screen.queryByTestId('progress-chart')).toBeNull();
  });
});
