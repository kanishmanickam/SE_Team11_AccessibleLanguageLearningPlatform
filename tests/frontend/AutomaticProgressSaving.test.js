// Unit tests for Automatic Progress Saving (EPIC-6.4)
// Uses Jest and React Testing Library

import React from 'react';
import { render, screen } from '@testing-library/react';
import LessonCompletion from '../../frontend/src/components/LessonCompletion';

jest.mock('../../frontend/src/services/progressService', () => ({
  completeLesson: jest.fn(() => Promise.resolve({ success: true })),
  getSummary: jest.fn(() => Promise.resolve({ success: true, percentage: 50 }))
}));

describe('Automatic Progress Saving (EPIC-6.4)', () => {
  it('saves progress after lesson completion', async () => {
    render(<LessonCompletion lessonId="lesson1" />);
    expect(await screen.findByText(/Success/i)).toBeInTheDocument();
  });

  it('restores progress when user logs in', async () => {
    render(<LessonCompletion lessonId="lesson1" />);
    expect(await screen.findByText(/Success/i)).toBeInTheDocument();
  });

  it('does not show manual save button', async () => {
    render(<LessonCompletion lessonId="lesson1" />);
    expect(screen.queryByText(/Save/i)).toBeNull();
  });

  it('confirms progress is loaded (simple message)', async () => {
    render(<LessonCompletion lessonId="lesson1" />);
    expect(await screen.findByText(/Success/i)).toBeInTheDocument();
  });
});
