import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonDisplay from '../LessonDisplay';

jest.mock('lucide-react', () => ({
  ImageOff: () => null,
  X: () => null,
}));

describe('LessonDisplay audio narration (EPIC 3.1)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('plays and pauses lesson audio via the narration button', async () => {
    const user = userEvent.setup();

    const playSpy = jest
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    const pauseSpy = jest
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});

    const lesson = {
      _id: 'lesson-1',
      title: 'Test Lesson',
      textContent: 'Hello world',
      audioUrl: 'https://example.com/audio.mp3',
      visuals: [],
    };

    const { container } = render(
      <LessonDisplay lesson={lesson} isLoading={false} error={null} onClose={() => {}} />
    );

    const audioEl = container.querySelector('audio');
    expect(audioEl).toBeTruthy();

    // Ensure we skip load/wait logic in JSDOM.
    Object.defineProperty(audioEl, 'readyState', {
      value: 4,
      configurable: true,
    });

    const button = screen.getByRole('button', { name: /play audio narration/i });
    await user.click(button);

    await waitFor(() => expect(playSpy).toHaveBeenCalled());

    const pauseButton = screen.getByRole('button', { name: /pause audio narration/i });
    await user.click(pauseButton);

    expect(pauseSpy).toHaveBeenCalled();
  });
});
