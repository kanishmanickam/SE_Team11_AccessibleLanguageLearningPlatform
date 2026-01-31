import React from 'react';
import './LessonNav.css';

const LessonNav = ({
  onBack,
  onNext,
  onReplay,
  canGoBack,
  canGoNext,
  canReplay,
  isReplay,
}) => {
  return (
    <div className="lesson-nav" role="navigation" aria-label="Lesson navigation">
      <button
        type="button"
        className="lesson-nav__button lesson-nav__button--back fx-pressable fx-focus"
        onClick={onBack}
        disabled={!canGoBack}
      >
        Back
      </button>
      <button
        type="button"
        className={`lesson-nav__button lesson-nav__button--replay fx-pressable fx-focus${isReplay ? ' is-active' : ''}`}
        onClick={onReplay}
        aria-pressed={isReplay}
        disabled={!canReplay && !isReplay}
      >
        Replay
      </button>
      <button
        type="button"
        className="lesson-nav__button lesson-nav__button--next fx-pressable fx-focus"
        onClick={onNext}
        disabled={!canGoNext}
      >
        Next
      </button>
    </div>
  );
};

export default LessonNav;
