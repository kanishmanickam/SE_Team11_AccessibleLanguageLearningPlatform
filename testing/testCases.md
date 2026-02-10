# Test Cases Document

> **Project**: Accessible Language Learning Platform – Team 11  
> **Scope**: Unit tests for **Dyslexia Page** and **Lesson Page**  
> **Date**: 2026-02-11  

---

## 1. Dyslexia-Friendly Reading Support (User Story 1.4)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-DYS-001 | Dyslexia-friendly font | 1.4.1 | Verify `.dyslexia-view` container renders so CSS font rules apply | Render `<DyslexiaView />` | Root element has class `dyslexia-view`; all lesson text lives within it | Container with class `.dyslexia-view` is in the DOM |
| TC-DYS-002 | Text size adjustment | 1.4.2 | Welcome heading renders with expected text (syllable mode) | Render `<DyslexiaView />` (syllable mode ON) | Heading shows "Wel-come to Your Learn-ing Space" | Text is present in the document |
| TC-DYS-003 | Line / letter spacing | 1.4.3 | Subtitle element exists with `.subtitle` class (CSS line-height: 1.8) | Render `<DyslexiaView />` | `.subtitle` element is in the DOM | Element is present |
| TC-DYS-004 | Persistence of settings | 1.4.4 | Syllable mode persists to and reads from localStorage | Call `setDyslexiaSyllableMode(true/false)` | localStorage key `dyslexiaSyllableMode` matches; `getDyslexiaSyllableMode` returns persisted value | localStorage value matches; getter returns correct boolean |
| TC-DYS-005 | Readability consistency | 1.4.5 | Syllable toggle switches text between normal and syllable variants | Click toggle button | Lesson titles switch between e.g., "Greetings" / "Greet-ings"; toggle label shows On/Off | Correct text variant is displayed after toggle |

---

## 2. Syllable Mode Utilities (supporting 1.4)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-DYS-006 | decorateDyslexiaText | 1.4 | Decorates known words, leaves unknowns, prevents double-decoration | `"Hello World"`, `"Keyboard"`, `"Hello (Hel-lo)"` | Known words get `(Hel-lo)` suffix; unknown words stay unchanged; no duplication | Output matches expected pattern |
| TC-DYS-007 | getSyllableHint | 1.4 | Returns syllable hint for known tokens | `"hello"`, `"rocket"`, `null` | `"Hel-lo"`, `""`, `""` | Exact string match |
| TC-DYS-008 | getDyslexiaLessonTitle | 1.4 | Maps lesson IDs to syllable-friendly titles | `"lesson-greetings"`, `"lesson-unknown"` | `"Greet-ings"`, fallback or ID string | Exact string match |
| TC-DYS-009 | isDyslexiaLessonId | 1.4 | Identifies known dyslexia lesson IDs | `"lesson-greetings"`, `null`, `"lesson-xyz"` | `true`, `false`, `false` | Boolean match |

---

## 3. Highlight Text Utilities (supporting 2.5)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-DYS-010 | buildHighlightRanges | 2.5.1 | Computes highlight ranges; handles explicit positions, missing phrases, overlaps | Text + highlight configs | Array of range objects with correct `start`/`end` | Ranges match expected values; overlaps deduplicated |
| TC-DYS-011 | buildHighlightedSegments | 2.5.1 | Splits text into highlighted and non-highlighted segments | `"Say Hello to everyone."` + highlight `"Hello"` | 3 segments: before, highlighted, after | Segment count and text match expected |

---

## 4. Dyslexia Progress Service (supporting 1.4 / 2.6)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-DYS-012 | normalizeUserId | 1.4.4 | Returns user id or "anonymous" | `{ id: 'u1' }`, `null` | `"u1"`, `"anonymous"` | Exact match |
| TC-DYS-013 | getAllLessonProgress | 2.6.4 | Returns stored progress object | User key `"u1"` | Object type returned | `typeof result === 'object'` |

---

## 5. DyslexiaView Dashboard Layout (User Story 2.7)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-DYS-014 | Navbar consistency | 2.7.1 | Navbar renders brand, greeting, nav buttons in fixed structure | Render `<DyslexiaView />` | "LinguaEase Learning", user greeting, Progress/Settings/Logout buttons visible | All elements present |
| TC-DYS-015 | Lesson card structure | 2.7.2 | Exactly 3 lesson cards, each with icon, title, description, badge, CTA | Render `<DyslexiaView />` | 3 `.lesson-card` elements with required children | DOM count and children checks pass |
| TC-DYS-016 | No layout disruption on settings | 2.7.3 | Opening/closing ProfileSettings doesn't remove navbar | Click Settings → close | Navbar remains; ProfileSettings appears/disappears | Both states verified |
| TC-DYS-017 | Progress bar rendering | 2.7 | Progress bars show 0% when no progress | Render `<DyslexiaView />` | 3 × "0% Complete"; fill width = "0%" | Text and style assertions pass |
| TC-DYS-018 | Navigation actions | 2.7 | Start Learning, Progress, Logout trigger correct navigation/actions | Click each button | `navigate('/lessons/lesson-greetings')`, `navigate('/progress')`, `logout()` called | Mock function assertions pass |
| TC-DYS-019 | Reading Guide section | 1.4 / 2.7 | Guide section renders 3 cards with aria-label | Render `<DyslexiaView />` | 3 `.guide-card` elements; section has `aria-label="Reading guide"` | DOM checks pass |
| TC-DYS-020 | Tips section | 1.4 / 2.7 | Tips section renders 3 tip cards | Render `<DyslexiaView />` | 3 `.tip-card` elements with headings | DOM checks pass |
| TC-DYS-021 | Syllable chip visual | 1.4 / 2.5 | Syllable chip renders with syllable text | Render `<DyslexiaView />` | `.syllable-chip` contains "fan–tas–tic" (syllable mode ON) | Text content match |
| TC-DYS-022 | Missing user edge case | 1.4 | normalizeUserId returns "anonymous" for undefined | `undefined` | `"anonymous"` | Exact match |
| TC-DYS-023 | Syllable toggle ARIA | 1.4 / a11y | Toggle button `aria-pressed` matches state | Click toggle | `aria-pressed` flips between "true" and "false" | Attribute value matches |
| TC-DYS-024 | Status pill rendering | 2.7 | Default status pills show "Not Started" | Render `<DyslexiaView />` | ≥3 elements with text "Not Started" | Count assertion passes |
| TC-DYS-025 | Icon gradient backgrounds | 2.5 / 2.7 | Lesson icons have inline gradient background | Render `<DyslexiaView />` | `.lesson-icon` style includes `linear-gradient` | Style assertion passes |

---

## 6. Multi-Format Lesson Display (User Story 2.1)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-LP-001 | Lesson text rendering | 2.1.1 | LessonDisplay renders title, paragraphs, loading, error, and empty states | Various lesson objects | Correct text, loading message, error message, or "No text content" | Text present in DOM for each case |
| TC-LP-002 | Audio controls | 2.1.2 | Play button, "no audio" message, seek slider disabled state, time display | Lesson with/without audioUrl | Play button or unavailable message; slider disabled at duration 0 | Element presence & disabled state |
| TC-LP-003 | Visual aids rendering | 2.1.3 | Visual figures with images, alt text, captions render; empty state message | Lesson with/without visuals | Figures with `<img>` and `<figcaption>`; "No visuals" message | DOM element checks |
| TC-LP-004 | Text/audio/visual sync | 2.1.4 | All three content sections render in the same view | Lesson with audioUrl | `aria-label` sections for text, audio, visuals all present | All three `aria-label` selectors found |
| TC-LP-005 | Close button callback | 2.1.5 | Close button triggers onClose | Click close button | `onClose` called once | Mock assertion |

---

## 7. Interactive Lesson Engagement (User Story 2.3)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-LP-006 | Interaction registration | 2.3.1 | Question renders; radio/click/short_answer inputs work; selection enables submit | Select True / click option / type answer | Submit button becomes enabled; `aria-pressed` set for click type | Button state & attribute assertions |
| TC-LP-007 | Questions at correct points | 2.3.2 | Interactions have sequential positions; first interaction shown initially | Render InteractiveLesson | Position values 0,1,2…; first question text visible | Position assertion; text found |
| TC-LP-008 | Immediate feedback | 2.3.3 | Correct → positive feedback + celebration; incorrect → negative feedback + try-again | Submit correct/incorrect answer | Feedback text; `.answer-celebration` or `.answer-try-again` in DOM | Text & class assertions |
| TC-LP-009 | No overwhelm | 2.3.4 | Only one interaction visible at a time; timer can be disabled | Render lesson with multiple interactions | Second question not visible; "No timer" label shown | `queryByText` returns null; text present |
| TC-LP-010 | Invalid interaction handling | 2.3.5 | Submit disabled with no selection; readOnly shows replay msg; Try Again resets | No selection / readOnly / retry after wrong | Disabled button; "Replay mode" text; feedback cleared on retry | State assertions |

---

## 8. Guided Learning Support (User Story 2.4)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-LP-011 | Hints on struggle | 2.4.1 | After 2 wrong attempts, hint text appears | Submit wrong answer twice | Hint text "Hel-lo" visible | Text assertion |
| TC-LP-012 | Explanations on incorrect | 2.4.2 | Wrong answer triggers guided-message | Submit wrong answer | `.guided-message` element in DOM | Element presence |
| TC-LP-013 | Manual help request | 2.4.3 | "Need help?" button renders, calls callback, shows loading state | Click "Need help?" | `onHelp` called; "Getting help…" when loading; button disabled | Mock & state assertions |
| TC-LP-014 | Encouraging messages | 2.4.4 | Message renders with `role="status"`; `aria-live="polite"` on container | Provide message prop | Message text visible; correct ARIA attributes | Text & attribute assertions |
| TC-LP-015 | Message stability | 2.4.5 | Message unchanged on re-render with same props; empty message shows nothing | Re-render; empty message | Same text; no `.guided-message` element | DOM assertions |

---

## 9. Visual Learning Aids (User Story 2.5)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-LP-016 | Word highlighting | 2.5.1 | VisualLesson applies `.highlight` class; correct emphasis type class | Paragraphs + highlight config | `.highlight` and `.highlight-background` spans present | Class assertions |
| TC-LP-017 | Image correspondence | 2.5.2 | Inline visual aid renders `<img>` with correct src/alt; figcaption matches | Paragraphs + visualAids | Image with src `/visuals/wave.svg`, alt "Wave icon"; caption "Hello" | Attribute & text assertions |
| TC-LP-018 | Simple layout | 2.5.3 | Paragraphs in separate `.visual-paragraph` blocks with `<p>` tags | 2 paragraphs | 2 `.visual-paragraph` divs; 2 `<p>` tags | Count assertions |
| TC-LP-019 | Visual update on change | 2.5.4 | Re-render updates paragraphs; `activeWord` adds `.highlight-active` | New paragraphs / activeWord prop | Updated block count; active class present | DOM assertions |
| TC-LP-020 | Side visual exclusion | 2.5.5 | Side-placement visuals not rendered inline | Visual with `placement: 'side'` | 0 `.visual-aid` figures in inline area | Count assertion |

---

## 10. Lesson Replay and Revision (User Story 2.6)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-LP-021 | Replay button | 2.6.1 | LessonNav Replay button renders, disabled state, active class, aria-pressed | Various `canReplay`/`isReplay` props | Button enabled/disabled; `.is-active` class; `aria-pressed` | State & attribute assertions |
| TC-LP-022 | Replay audio/visuals | 2.6.2 | ReadOnly InteractionCard shows question but disables submit | `readOnly={true}` | Question visible; submit disabled | Text & disabled assertions |
| TC-LP-023 | Previous steps accessible | 2.6.3 | Back button calls onBack; disabled when canGoBack is false | Click back button | `onBack` called; button disabled | Mock & state assertions |
| TC-LP-024 | Progress preserved | 2.6.4 | saveLessonProgress is callable and receives correct args | Call with progress data | Function called with expected arguments | Mock assertion |
| TC-LP-025 | No unrelated reset | 2.6.5 | "Finish" label shown for last section | `nextLabel="Finish"` | Button text is "Finish" | Text assertion |

---

## 11. Consistent Lesson Layout (User Story 2.7)

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-LP-026 | Layout regions | 2.7.1 | LessonLayout renders banner, main, contentinfo roles; title, subtitle, eyebrow | Render LessonLayout | ARIA roles present; text content matches | Role & text assertions |
| TC-LP-027 | Nav button positions | 2.7.2 | Back, Replay, Next buttons render in fixed order; nav has aria-label | Render LessonNav | 3 buttons in order; `role="navigation"` with label | Order & ARIA assertions |
| TC-LP-028 | No unexpected changes | 2.7.3 | Back button appears/hides based on onBack; children render inside main | Provide/omit onBack | Button present/absent; child in main | Presence & containment assertions |
| TC-LP-029 | Predictable transitions | 2.7.4 | Guidance section has `aria-live="polite"`; InteractionCard form has `aria-live` | Render components | `aria-live` attribute on expected elements | Attribute assertions |

---

## 12. LessonPage & Edge Cases

| Test Case ID | Feature Name | User Story | Test Description | Input | Expected Output | Pass/Fail Criteria |
|---|---|---|---|---|---|---|
| TC-LP-030 | LessonPage mount | 2.1 / 2.7 | LessonPage renders `#learning-container`; sets `data-user-condition` | Render `<LessonPage />` | Container in DOM; attribute = "dyslexia" | Element & attribute assertions |
| TC-LP-031 | Empty interactions | 2.3 edge | InteractiveLesson shows "No interactions" when array is empty | Lesson with `interactions: []` | "No interactions" text | Text assertion |
| TC-LP-032 | Empty textContent | 2.1 edge | InteractiveLesson shows "No text content" when textContent is empty | Lesson with `textContent: ''` | "No text content" text | Text assertion |
| TC-LP-033 | Empty paragraphs | 2.5 edge | VisualLesson renders 0 blocks for empty paragraphs | `paragraphs: []` | 0 `.visual-paragraph` elements | Count = 0 |
| TC-LP-034 | Default nextLabel | 2.7 edge | LessonNav uses "Next" when nextLabel not provided | Omit `nextLabel` | Button text "Next" | Text assertion |
| TC-LP-035 | Tone class on guidance | 2.4 edge | GuidedSupport applies tone as a CSS class | `tone="hint"` | `.guided-message` has class `hint` | Class assertion |
