# Test Summary

> **Project**: Accessible Language Learning Platform – Team 11  
> **Scope**: Unit tests for **Dyslexia Page** and **Lesson Page**  
> **Date**: 2026-02-11  
> **Framework**: Jest + React Testing Library (via `react-scripts test`)  

---

## 1. Total Number of Unit Tests

| Test File | Describe Blocks | Individual `test()` Cases |
|---|---|---|
| `dyslexiaPage.unit.test.js` | 21 | 43 |
| `lessonPage.unit.test.js` | 30 | 52 |
| **Total** | **51** | **95** |

---

## 2. Features Covered

| # | Feature (User Story) | Dyslexia Page Tests | Lesson Page Tests |
|---|---|---|---|
| 1 | **1.4 – Dyslexia-Friendly Reading Support** | TC-DYS-001 → TC-DYS-009 | — |
| 2 | **2.1 – Multi-Format Lesson Display** | — | TC-LP-001 → TC-LP-005 |
| 3 | **2.3 – Interactive Lesson Engagement** | — | TC-LP-006 → TC-LP-010 |
| 4 | **2.4 – Guided Learning Support** | — | TC-LP-011 → TC-LP-015 |
| 5 | **2.5 – Visual Learning Aids** | TC-DYS-010, TC-DYS-011, TC-DYS-021, TC-DYS-025 | TC-LP-016 → TC-LP-020 |
| 6 | **2.6 – Lesson Replay and Revision** | TC-DYS-012, TC-DYS-013 | TC-LP-021 → TC-LP-025 |
| 7 | **2.7 – Consistent Lesson Layout** | TC-DYS-014 → TC-DYS-020 | TC-LP-026 → TC-LP-029 |

---

## 3. Edge Cases Tested

| Edge Case | Test ID(s) | Description |
|---|---|---|
| Null / undefined user | TC-DYS-022 | `normalizeUserId` returns `"anonymous"` for missing user |
| Empty string input | TC-DYS-006 | `decorateDyslexiaText` handles `""`, `null`, `undefined` |
| Double-decoration prevention | TC-DYS-006 | Already-decorated text is not decorated again |
| Unknown words | TC-DYS-007 | `getSyllableHint` returns `""` for unknown tokens |
| Unknown lesson IDs | TC-DYS-008, TC-DYS-009 | Fallback title used; `isDyslexiaLessonId` returns `false` |
| No localStorage value | TC-DYS-004 | Default value is returned when storage key is absent |
| Overlapping highlight ranges | TC-DYS-010 | First-wins deduplication of overlapping ranges |
| Empty highlights array | TC-DYS-010 | Returns empty array gracefully |
| Null highlight entries | TC-DYS-010 | Filters out `null` / `undefined` entries |
| Missing textContent | TC-LP-001, TC-LP-032 | "No text content available" message shown |
| No audio URL | TC-LP-002 | "Audio narration is not available" message shown |
| Empty visuals array | TC-LP-003 | "No visuals are attached" message shown |
| No lesson data (null) | TC-LP-001 | Component returns `null` (nothing rendered) |
| No selection before submit | TC-LP-010 | Submit button remains disabled |
| Read-only / replay mode | TC-LP-010, TC-LP-022 | Submit disabled; "Replay mode" text shown |
| Try Again resets state | TC-LP-010 | Feedback cleared; submit button reappears |
| Empty interactions array | TC-LP-031 | "No interactions" message shown |
| Empty paragraphs array | TC-LP-033 | Zero `.visual-paragraph` blocks rendered |
| Default nextLabel | TC-LP-034 | "Next" used when prop omitted |
| Side-placed visuals | TC-LP-020 | Excluded from inline rendering |
| Missing `onBack` prop | TC-LP-028 | Back button not rendered |
| Timer disabled | TC-LP-009 | "No timer" label displayed |

---

## 4. Accessibility Focus Summary

All tests were written with an **accessibility-first mindset**:

| Accessibility Aspect | How Tested |
|---|---|
| **ARIA attributes** | `aria-pressed` on syllable toggle (TC-DYS-023); `aria-pressed` on click interactions (TC-LP-006); `aria-pressed` on replay button (TC-LP-021); `aria-label` on navigation, layout, audio, and visual sections (TC-LP-027, TC-LP-026, TC-LP-004) |
| **`aria-live` regions** | Guidance section `aria-live="polite"` (TC-LP-029); InteractionCard form `aria-live="polite"` (TC-LP-029); GuidedSupport container `aria-live="polite"` (TC-LP-014) |
| **`role` landmarks** | `role="banner"` (header), `role="main"`, `role="contentinfo"` (footer), `role="navigation"`, `role="status"`, `role="region"` verified across layout components (TC-LP-026, TC-LP-027, TC-LP-014) |
| **Dyslexia-friendly fonts** | Verified `.dyslexia-view` container class presence ensuring CSS OpenDyslexic rules apply (TC-DYS-001) |
| **Syllable mode** | Toggle persistence, state switching, visual label (On/Off), and decorateDyslexiaText utility thoroughly tested (TC-DYS-004 → TC-DYS-009) |
| **Readable spacing** | `.subtitle` class with line-height: 1.8 verified (TC-DYS-003) |
| **Screen reader support** | `role="status"` on feedback messages (TC-LP-014); `aria-label` on "Close lesson", "Seek audio", "Play/Pause audio" buttons (TC-LP-002, TC-LP-005) |
| **Keyboard accessibility** | Form-based submission (`<form onSubmit>`) ensures Enter-key support; radio groups with standard `<input type="radio">` for keyboard navigation (TC-LP-006) |
| **Non-overwhelming UX** | Only one interaction shown at a time (TC-LP-009); timer can be disabled (TC-LP-009); read-only replay mode prevents accidental input (TC-LP-010, TC-LP-022) |

---

## 5. Assumptions and Limitations

### Assumptions

1. **Test runner**: Tests are designed for Jest with React Testing Library, as configured by `react-scripts test` in the project's `package.json`.
2. **Module resolution**: Test files import from `../../src/...` relative to the `testing/` folder. This matches the default Jest module resolution in Create React App when `roots` or `testMatch` are configured to include the `testing/` directory.
3. **Mocking strategy**: All external services (`lessonService`, `interactionService`, `progressService`, `lessonSectionService`), context providers (`AuthContext`, `PreferencesContext`, `ThemeContext`), and browser APIs (`Audio`, `SpeechSynthesis`, `fetch`, `localStorage`) are mocked to isolate unit behavior.
4. **Sample data**: `lessonSamples.js` is used as the canonical test fixture for lesson content, interactions, highlights, and visual aids. Tests assume this file remains stable.
5. **CSS behavior**: CSS rules (font-family, line-height, letter-spacing) are validated by asserting the presence of the correct CSS class names, not computed styles, since JSDOM does not compute CSS.

### Limitations

1. **No integration tests**: Tests do not verify actual HTTP calls, database interactions, or cross-component data flow through real context providers.
2. **No visual regression**: Pixel-level rendering, font rendering, and animation behavior are not tested (JSDOM limitation).
3. **No audio playback verification**: Actual audio playback, seek, and timing behavior cannot be tested in JSDOM. Tests verify button states, ARIA attributes, and callback invocations instead.
4. **No TTS verification**: `SpeechSynthesis` and backend TTS calls are mocked; actual speech output is not tested.
5. **CSS computed styles**: Tests assert class presence, not computed CSS property values. Actual font-family, letter-spacing, and line-height values require a real browser environment.
6. **Timer behavior**: The countdown timer in InteractionCard is not exhaustively tested with fake timers to avoid flaky timing issues; the "No timer" disabled state is verified instead.
7. **Scope restriction**: Only the Dyslexia Page (`DyslexiaView`) and Lesson Page (`LessonPage`, `LessonDisplay`, `InteractiveLesson`, `InteractionCard`, `GuidedSupport`, `VisualLesson`, `LessonReplay`, `LessonLayout`, `LessonNav`) are tested. Other pages (Dashboard, Register, Login, ProgressPage, ADHD/Autism views) are out of scope.

---

## 6. How to Run

```bash
cd frontend
npx react-scripts test --watchAll=false --testPathPattern=testing/
```

To run only the Dyslexia page tests:

```bash
npx react-scripts test --watchAll=false --testPathPattern=testing/dyslexiaPage
```

To run only the Lesson page tests:

```bash
npx react-scripts test --watchAll=false --testPathPattern=testing/lessonPage
```
