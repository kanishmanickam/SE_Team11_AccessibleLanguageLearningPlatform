// Unit tests for LessonCompletion (EPIC-6)
// Uses Jest and React Testing Library

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonCompletion from '../../frontend/src/components/LessonCompletion';

jest.mock('../../frontend/src/services/progressService', () => ({
  completeLesson: jest.fn(() => Promise.resolve({ success: true })),
}));

describe('LessonCompletion (EPIC-6)', () => {
  it('calls progress API automatically', async () => {
    render(<LessonCompletion lessonId="lesson1" />);
    expect(await screen.findByText(/Success/i)).toBeInTheDocument();
  });

  it('shows encouraging success message', async () => {
    render(<LessonCompletion lessonId="lesson2" />);
    expect(await screen.findByText(/Congratulations|Well done|Success/i)).toBeInTheDocument();
  });

  it('does not show negative messages', async () => {
    render(<LessonCompletion lessonId="lesson3" />);
    expect(screen.queryByText(/Failed|Error|Try again/i)).toBeNull();
  });

  it('shows “Loading…” while lesson loads', async () => {
    render(<LessonCompletion lessonId="lesson4" />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('shows error message on failure', async () => {
    jest.spyOn(require('../../frontend/src/services/progressService'), 'completeLesson').mockImplementationOnce(() => Promise.reject(new Error('fail')));
    render(<LessonCompletion lessonId="lesson5" />);
    expect(await screen.findByText(/Error/i)).toBeInTheDocument();
  });

  it('retry button refetches lesson', async () => {
    const { getByText } = render(<LessonCompletion lessonId="lesson6" />);
    fireEvent.click(getByText(/Retry/i));
    await waitFor(() => expect(screen.getByText(/Loading/i)).toBeInTheDocument());
  });
});
