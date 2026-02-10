// Unit tests for Learning History (EPIC-6.3)
// Uses Jest and React Testing Library

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressPage from '../../frontend/src/components/ProgressPage';

jest.mock('../../frontend/src/services/progressService', () => ({
  getSummary: jest.fn(() => Promise.resolve({
    success: true,
    completedLessons: [
      { id: 'lesson1', title: 'Lesson 1', completedAt: '2026-02-10T10:00:00Z' },
      { id: 'lesson2', title: 'Lesson 2', completedAt: '2026-02-11T10:00:00Z' }
    ],
    totalLessons: 10,
    completedCount: 2,
    remaining: 8,
    percentage: 20
  }))
}));

describe('Learning History (EPIC-6.3)', () => {
  it('displays list of completed lessons', async () => {
    render(<ProgressPage />);
    expect(await screen.findByText(/Lesson 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Lesson 2/i)).toBeInTheDocument();
  });

  it('shows lessons in order', async () => {
    render(<ProgressPage />);
    const lessons = await screen.findAllByText(/Lesson \d/i);
    expect(lessons[0]).toHaveTextContent('Lesson 1');
    expect(lessons[1]).toHaveTextContent('Lesson 2');
  });

  it('keeps history read-only (no edits)', async () => {
    render(<ProgressPage />);
    expect(screen.queryByText(/Edit/i)).toBeNull();
  });
});
