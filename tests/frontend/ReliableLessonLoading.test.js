// Unit tests for Reliable Lesson Loading (EPIC-6.5)
// Uses Jest and React Testing Library

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LessonPage from '../../frontend/src/components/learning/LessonPage';

jest.mock('../../frontend/src/services/progressService', () => ({
  getProgress: jest.fn(() => Promise.resolve({ completed: false })),
  updateProgress: jest.fn(() => Promise.resolve({ completed: true }))
}));

jest.mock('../../frontend/src/services/lessonService', () => ({
  getLessonById: jest.fn((id) => Promise.resolve({ id, title: `Lesson ${id}` }))
}));

describe('Reliable Lesson Loading (EPIC-6.5)', () => {
  it('loads lesson content from backend correctly', async () => {
    render(<LessonPage lessonId="lesson1" />);
    expect(await screen.findByText(/Lesson 1/i)).toBeInTheDocument();
  });

  it('shows “Loading…” while lesson loads', async () => {
    render(<LessonPage lessonId="lesson1" />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('shows friendly error message if lesson fails', async () => {
    jest.spyOn(require('../../frontend/src/services/lessonService'), 'getLessonById').mockImplementationOnce(() => Promise.reject(new Error('fail')));
    render(<LessonPage lessonId="lesson2" />);
    expect(await screen.findByText(/Unable to load/i)).toBeInTheDocument();
  });

  it('provides a retry button', async () => {
    render(<LessonPage lessonId="lesson3" />);
    const retryBtn = screen.getByText(/Retry/i);
    fireEvent.click(retryBtn);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
