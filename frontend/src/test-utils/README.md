# Test Utilities

This directory contains shared testing utilities and helper functions.

## Files

- **`autismTestUtils.js`** - Helper functions and mocks for Autism module testing
- **`index.js`** - Central export point

## Usage

```javascript
import { renderWithProviders, completeSteps } from '../test-utils';

test('example', () => {
  renderWithProviders(<MyComponent />);
  // ... test code
});
```

## Available Utilities

### `renderWithProviders(component, authValue)`
Renders component with Router and Auth context providers.

### `completeSteps(fireEvent, screen, steps, waitFor)`
Helper to complete multiple lesson steps in tests.

### `setupSpeechMock()`
Mocks Web Speech API for text-to-speech testing.

### `setupAudioMock()`
Mocks HTML5 Audio API for audio playback testing.

### `selectAnswer(fireEvent, screen, optionText)`
Helper to select an answer option in tests.

See individual files for complete documentation.
