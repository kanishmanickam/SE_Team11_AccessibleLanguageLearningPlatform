import React, { useEffect, useMemo, useState } from 'react';
import LessonLayout from './LessonLayout';
import LessonNav from './LessonNav';
import LessonSectionView from './LessonSectionView';
import { getLessonSections } from '../../services/lessonSectionService';
import { getProgress, updateProgress } from '../../services/progressService';
import lessonSectionSamples from './lessonSectionSamples';
import './LessonReplay.css';

const LessonReplay = ({ lessonId, isSample, lessonTitle, lessonSubtitle, notice }) => {
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [replaySectionId, setReplaySectionId] = useState('');
  const [currentInteractionSectionId, setCurrentInteractionSectionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (isSample && lessonSectionSamples[lessonId]) {
          const sampleSections = lessonSectionSamples[lessonId].sort((a, b) => a.order - b.order);
          if (isMounted) {
            setSections(sampleSections);
            setActiveSectionId(sampleSections[0]?.id || '');
            setProgress({
              currentSectionId: sampleSections[0]?.id || '',
              completedSections: [],
            });
          }
          return;
        }

        const [sectionsData, progressData] = await Promise.all([
          getLessonSections(lessonId),
          getProgress(lessonId),
        ]);

        if (isMounted) {
          setSections(sectionsData);
          setProgress(progressData);
          setActiveSectionId(progressData?.currentSectionId || sectionsData[0]?._id || '');
        }
      } catch (loadError) {
        if (isMounted) {
          setError('Unable to load lesson sections.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [lessonId, isSample]);

  const sectionList = useMemo(() => {
    return sections.map((section) => ({
      id: section._id || section.id,
      title: section.title,
      order: section.order || 0,
    }));
  }, [sections]);

  const sectionMap = useMemo(() => {
    const map = new Map();
    sections.forEach((section) => {
      map.set(section._id || section.id, section);
    });
    return map;
  }, [sections]);

  const displayedSectionId = replaySectionId || activeSectionId;
  const displayedSection = displayedSectionId ? sectionMap.get(displayedSectionId) : null;
  const completedSections = progress?.completedSections || [];
  const isReplay = Boolean(replaySectionId);
  const lastCompletedSectionId = completedSections[completedSections.length - 1] || '';

  const handleInteractionChange = (sectionId, interactionIndex) => {
    setCurrentInteractionSectionId(sectionId);
  };

  const handleSelectSection = (sectionId) => {
    if (!sectionId) return;
    if (sectionId === activeSectionId) {
      setReplaySectionId('');
      return;
    }

    if (completedSections.includes(sectionId)) {
      setReplaySectionId(sectionId);
    }
  };

  const exitReplay = () => {
    setReplaySectionId('');
  };

  const handleReplayToggle = () => {
    if (isReplay) {
      exitReplay();
      return;
    }
    if (lastCompletedSectionId) {
      setReplaySectionId(lastCompletedSectionId);
    }
  };

  const getSectionIndex = (sectionId) => sectionList.findIndex((section) => section.id === sectionId);

  const handleNavigate = async (direction) => {
    if (!displayedSectionId) return;
    const currentIndex = getSectionIndex(displayedSectionId);
    if (currentIndex < 0) return;
    const nextIndex = currentIndex + direction;
    const nextSection = sectionList[nextIndex];
    if (!nextSection) return;

    if (isReplay) {
      if (completedSections.includes(nextSection.id)) {
        setReplaySectionId(nextSection.id);
      }
      return;
    }

    if (direction < 0) {
      if (completedSections.includes(nextSection.id)) {
        setReplaySectionId(nextSection.id);
      }
      return;
    }

    const nextCompleted = Array.from(new Set([...completedSections, displayedSectionId]));
    setActiveSectionId(nextSection.id);

    if (!isSample) {
      const updated = await updateProgress({
        lessonId,
        currentSectionId: nextSection.id,
        completedSections: nextCompleted,
        isReplay: false,
      });
      setProgress(updated);
    } else {
      setProgress((prev) => ({
        ...(prev || {}),
        currentSectionId: nextSection.id,
        completedSections: nextCompleted,
      }));
    }
  };

  const prevSection = displayedSectionId ? sectionList[getSectionIndex(displayedSectionId) - 1] : null;
  const nextSection = displayedSectionId ? sectionList[getSectionIndex(displayedSectionId) + 1] : null;
  const canGoBack = Boolean(prevSection && completedSections.includes(prevSection.id));
  const canGoNext = Boolean(nextSection && (!isReplay || completedSections.includes(nextSection.id)));
  const canReplay = Boolean(lastCompletedSectionId) || isReplay;

  const guidanceText = error
    ? error
    : notice
      ? notice
      : isReplay
        ? 'Replaying a completed section. Your progress remains saved.'
        : 'Select a completed section to replay at any time.';

  const resolvedTitle = lessonTitle || 'Lesson';
  const resolvedSubtitle = lessonSubtitle || 'Move through one section at a time for steady progress.';

  return (
    <LessonLayout
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
      guidance={(
        <div className="lesson-guidance">
          <p className="lesson-guidance__label">Guidance</p>
          <p className={`lesson-guidance__text${error ? ' is-error' : ''}`}>{guidanceText}</p>
        </div>
      )}
      footer={(
        <LessonNav
          onBack={() => handleNavigate(-1)}
          onNext={() => handleNavigate(1)}
          onReplay={handleReplayToggle}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          canReplay={canReplay}
          isReplay={isReplay}
        />
      )}
    >
      <div className="lesson-replay">
        <div className="lesson-replay-grid">
          <div className="lesson-replay-panel fx-card">
            <div className="lesson-replay-panel__header">
              <h2>Lesson timeline</h2>
              <p>Select a completed section to replay.</p>
            </div>
            {isLoading ? (
              <p className="lesson-replay-loading">Loading sections…</p>
            ) : (
              <nav className="lesson-timeline" aria-label="Lesson sections">
                {sectionList.map((section, index) => {
                  const isCurrent = section.id === (currentInteractionSectionId || activeSectionId);
                  const isCompleted = completedSections.includes(section.id);
                  const isSelected = section.id === displayedSectionId;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      className={`timeline-item fx-pressable fx-focus ${isSelected ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => handleSelectSection(section.id)}
                      aria-current={isCurrent ? 'step' : undefined}
                      disabled={!isCompleted && section.id !== activeSectionId}
                    >
                      <span className="timeline-index">{index + 1}</span>
                      <span className="timeline-title">{section.title}</span>
                      {isCompleted && <span className="timeline-tag">Completed</span>}
                      {isCurrent && <span className="timeline-tag accent">Current</span>}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="lesson-section-panel">
            {isLoading ? (
              <div className="lesson-replay-loading fx-card">Preparing the lesson section…</div>
            ) : displayedSection ? (
              <div className="lesson-content-fade" key={displayedSectionId}>
                {isReplay && <div className="replay-banner">Replaying a completed section</div>}
                <LessonSectionView 
                  section={displayedSection} 
                  isReplay={isReplay} 
                  useLocalSubmission={isSample}
                  onInteractionChange={handleInteractionChange}
                />
              </div>
            ) : (
              <div className="lesson-replay-empty fx-card">Select a section to begin.</div>
            )}
          </div>
        </div>
      </div>
    </LessonLayout>
  );
};

export default LessonReplay;
