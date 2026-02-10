import React from 'react';
import './GuidedSupport.css';

const GuidedSupport = ({ message, tone, onHelp, isLoading }) => {
  return (
    // EPIC 2.4.1-2.4.4: Guided support surface for hints/explanations, manual help, and encouraging messages.
    <div className="guided-support" aria-live="polite">
      <button
        type="button"
        className="btn-help fx-pressable fx-focus"
        onClick={onHelp}
        disabled={isLoading}
      >
        {isLoading ? 'Getting help…' : 'Need help?'}
      </button>
      {message && (
        <div className={`guided-message ${tone || ''}`} role="status">
          {message}
        </div>
      )}
    </div>
  );
};

export default GuidedSupport;
