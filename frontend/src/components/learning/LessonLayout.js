import React from 'react';
import './LessonLayout.css';

const LessonLayout = ({ title, subtitle, children, guidance, footer, onBack, backLabel = 'Back' }) => {
  return (
    <div className="lesson-layout" role="region" aria-label="Lesson layout">
      <header className="lesson-layout__header" role="banner">
        <div className="lesson-layout__header-inner">
          <div className="lesson-layout__header-top">
            <div className="lesson-layout__header-left">
              <p className="lesson-layout__eyebrow">Lesson</p>
            </div>
            {onBack && (
              <button
                type="button"
                className="lesson-layout__back fx-pressable fx-focus"
                onClick={onBack}
              >
                ← {backLabel}
              </button>
            )}
          </div>
          <h1 className="lesson-layout__title">{title}</h1>
          {subtitle && <p className="lesson-layout__subtitle">{subtitle}</p>}
        </div>
      </header>

      <main className="lesson-layout__main" role="main">
        {children}
      </main>

      <section className="lesson-layout__guidance" aria-live="polite">
        {guidance}
      </section>

      <footer className="lesson-layout__footer" role="contentinfo">
        {footer}
      </footer>
    </div>
  );
};

export default LessonLayout;
