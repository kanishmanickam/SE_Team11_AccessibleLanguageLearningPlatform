import React, { useEffect, useMemo, useState } from 'react';
import { requestInteractionHelp, submitInteraction } from '../../services/interactionService';
import GuidedSupport from './GuidedSupport';
import './InteractionCard.css';

const normalizeAnswer = (value) => {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  return String(value ?? '').trim().toLowerCase();
};

const encouragementMessages = [
  "You're getting closer!",
  "Nice try — let's look at this together.",
  'Learning takes practice. Keep going!',
  'Good effort! Try once more.',
  'You are making progress. Keep it up!',
];

const pickEncouragement = () => {
  return encouragementMessages[
    Math.floor(Math.random() * encouragementMessages.length)
  ];
};

const InteractionCard = ({
  lessonId,
  interaction,
  onContinue,
  disableContinue = false,
  useLocalSubmission = false,
  readOnly = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [guidance, setGuidance] = useState(null);
  const [isHelping, setIsHelping] = useState(false);

  const hintTriggerAttempts = useMemo(() => 2, []);

  useEffect(() => {
    setSelectedAnswer('');
    setResult(null);
    setError('');
    setIsSubmitting(false);
    setAttempts(0);
    setGuidance(null);
  }, [interaction?.id, lessonId]);

  const options =
    interaction.type === 'true_false'
      ? ['True', 'False']
      : interaction.options || [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (readOnly || !selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (useLocalSubmission) {
        const isCorrect =
          normalizeAnswer(selectedAnswer) === normalizeAnswer(interaction.correctAnswer);
        const payload = {
          isCorrect,
          feedback: isCorrect ? interaction.feedback.correct : interaction.feedback.incorrect,
        };

        if (!isCorrect) {
          if (interaction.explanation) {
            payload.explanation = interaction.explanation;
          }
          if (interaction.hint && nextAttempts >= hintTriggerAttempts) {
            payload.hint = interaction.hint;
          }
          payload.encouragement = pickEncouragement();
        }

        setResult(payload);
        setGuidance(resolveGuidance(payload));
      } else {
        const response = await submitInteraction({
          lessonId,
          interactionId: interaction.id,
          selectedAnswer,
        });
        setResult(response);
        setGuidance(resolveGuidance(response));
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
      setGuidance(null);
    }
    setSelectedAnswer(option);
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedAnswer('');
    setError('');
    setGuidance(null);
  };

  const handleHelp = async () => {
    setIsHelping(true);
    setError('');
    try {
      if (useLocalSubmission) {
        const payload = {};
        if (interaction.hint && attempts >= hintTriggerAttempts) {
          payload.hint = interaction.hint;
        } else if (interaction.explanation) {
          payload.explanation = interaction.explanation;
        } else if (interaction.hint) {
          payload.hint = interaction.hint;
        }
        payload.encouragement = pickEncouragement();
        setGuidance(resolveGuidance(payload));
      } else {
        const response = await requestInteractionHelp({
          lessonId,
          interactionId: interaction.id,
        });
        setGuidance(resolveGuidance(response));
      }
    } catch (helpError) {
      setError('Unable to load help right now.');
    } finally {
      setIsHelping(false);
    }
  };

  const isAnswered = Boolean(result);
  const isCorrect = Boolean(result?.isCorrect);
  const isLocked = isSubmitting || isCorrect;

  const guidanceMessage = guidance?.message || '';
  const guidanceTone = guidance?.tone || '';

  return (
    <form className="interaction-card fx-card" onSubmit={handleSubmit} aria-live="polite">
      <fieldset disabled={isLocked || readOnly}>
        <legend className="interaction-question">{interaction.question}</legend>

        {interaction.type === 'click' ? (
          <div className="interaction-click-group" role="list">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`interaction-click fx-pressable fx-focus ${selectedAnswer === option ? 'selected' : ''}`}
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

      {error && (
        <p className="interaction-feedback error" role="status">
          ⚠️ {error}
        </p>
      )}
      {isAnswered && (
        <p
          className={`interaction-feedback ${isCorrect ? 'correct' : 'incorrect'}`}
          role="status"
        >
          {isCorrect ? '✅ ' : '❌ '}
          {result?.feedback}
        </p>
      )}

      {readOnly && (
        <p className="interaction-feedback" role="status">
          🔒 Replay mode: interactions are read-only.
        </p>
      )}

      <GuidedSupport
        message={guidanceMessage}
        tone={guidanceTone}
        onHelp={handleHelp}
        isLoading={isHelping}
      />

      <div className="interaction-actions">
        {!isAnswered ? (
          <button type="submit" className="btn-submit fx-pressable fx-focus" disabled={readOnly || !selectedAnswer || isSubmitting}>
            {isSubmitting ? 'Checking…' : 'Submit Answer'}
          </button>
        ) : (
          <>
            {!isCorrect && (
              <button type="button" className="btn-retry fx-pressable fx-focus" onClick={handleRetry}>
                Try Again
              </button>
            )}
            {isCorrect && onContinue && (
              <button
                type="button"
                className="btn-continue fx-pressable fx-focus"
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

const resolveGuidance = (payload) => {
  if (!payload) return null;
  if (payload.explanation) {
    return { message: payload.explanation, tone: 'explanation' };
  }
  if (payload.hint) {
    return { message: payload.hint, tone: 'hint' };
  }
  if (payload.encouragement) {
    return { message: payload.encouragement, tone: 'encouragement' };
  }
  return null;
};

export default InteractionCard;
