import React, { useEffect, useState } from 'react';
import { submitInteraction } from '../../services/interactionService';
import './InteractionCard.css';

const normalizeAnswer = (value) => {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  return String(value ?? '').trim().toLowerCase();
};

const InteractionCard = ({ lessonId, interaction, onContinue, disableContinue, useLocalSubmission }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedAnswer('');
    setResult(null);
    setError('');
    setIsSubmitting(false);
  }, [interaction?.id, lessonId]);

  const options =
    interaction.type === 'true_false'
      ? ['True', 'False']
      : interaction.options || [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (useLocalSubmission) {
        const isCorrect =
          normalizeAnswer(selectedAnswer) === normalizeAnswer(interaction.correctAnswer);
        setResult({
          isCorrect,
          feedback: isCorrect ? interaction.feedback.correct : interaction.feedback.incorrect,
        });
      } else {
        const response = await submitInteraction({
          lessonId,
          interactionId: interaction.id,
          selectedAnswer,
        });
        setResult(response);
      }
    } catch (submitError) {
      setError('Unable to submit your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (option) => {
    if (result && !result.isCorrect) {
      setResult(null);
      setError('');
    }
    setSelectedAnswer(option);
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedAnswer('');
    setError('');
  };

  const isAnswered = Boolean(result);
  const isCorrect = Boolean(result?.isCorrect);
  const isLocked = isSubmitting || isCorrect;

  return (
    <form className="interaction-card" onSubmit={handleSubmit} aria-live="polite">
      <fieldset disabled={isLocked}>
        <legend className="interaction-question">{interaction.question}</legend>

        {interaction.type === 'click' ? (
          <div className="interaction-click-group" role="list">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`interaction-click ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                aria-pressed={selectedAnswer === option}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="interaction-options" role="radiogroup" aria-label={interaction.question}>
            {options.map((option) => (
              <label key={option} className="interaction-option">
                <input
                  type="radio"
                  name={interaction.id}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={() => handleSelect(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {error && <p className="interaction-feedback error">{error}</p>}
      {isAnswered && (
        <p className={`interaction-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          {result.feedback}
        </p>
      )}

      <div className="interaction-actions">
        {!isAnswered ? (
          <button type="submit" className="btn-submit" disabled={!selectedAnswer || isSubmitting}>
            {isSubmitting ? 'Checking…' : 'Submit Answer'}
          </button>
        ) : (
          <>
            {!isCorrect && (
              <button type="button" className="btn-retry" onClick={handleRetry}>
                Try Again
              </button>
            )}
            {isCorrect && onContinue && (
              <button
                type="button"
                className="btn-continue"
                onClick={onContinue}
                disabled={disableContinue}
              >
                Continue
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
};

export default InteractionCard;
