import React from 'react';
import './GuidedSupport.css';

const GuidedSupport = ({ message, tone, onHelp, isLoading }) => {
  return (
    <div className="guided-support" aria-live="polite">
      <button
        type="button"
        className="btn-help"
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
