/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Gauge, Moon, Sun } from 'lucide-react';
import { StandingView } from './components/StandingView';
import { SprintPlannerView } from './components/SprintPlannerView';
import { SyllabusView } from './components/SyllabusView';
import { ReferenceView } from './components/ReferenceView';
import { InteractiveLabsView, LabId } from './components/InteractiveLabsView';
import { FatMockView, MockPresetRequest } from './components/FatMockView';
import { ExamCountdown } from './components/ExamCountdown';
import { FormulaQuickRef } from './components/FormulaQuickRef';
import { COURSE_META, FAT_QUESTIONS, MODULES, SPRINT_BLOCKS } from './data/bacse202Data';
import type { StandingQuestion } from './data/standingData';
import { TOPIC_NOTES } from './data/topicNotes';
import { calculateExamReadiness } from './utils/readinessEngine';
import { FLASHCARD_DECK } from './utils/erFlashcardEngine';
import {
  ModuleStandingScore,
  recordWeakTopicWrong,
  StandingScoresMap,
  toggleWeakTopicResolved,
  WeakTopicEntry,
} from './utils/standingEngine';
import {
  clearResolvedWeakTopics,
  countUnresolvedWeakTopics,
  markWeakTopicReviewed,
} from './utils/weakTopicsEngine';
import {
  extractRetainedCardIds,
  migrateLegacyKnownIds,
  reviewCard,
  SrsMode,
  SrsProgressMap,
  SrsRating,
} from './utils/srsEngine';
import {
  applyDarkModeClass,
  DARK_MODE_STORAGE_KEY,
  parseStoredDarkMode,
  resolveInitialDarkMode,
  serializeDarkModePreference,
} from './utils/darkModeEngine';

type AppView = 'standing' | 'plan' | 'syllabus' | 'reference' | 'labs' | 'mock';
type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

const STORAGE_KEYS = {
  blocks: 'bacse202_completed_blocks_v1',
  topics: 'bacse202_mastered_topics_v1',
  answers: 'bacse202_mock_answers_v1',
  upgradeChecklist: 'bacse202_upgrade_checklist_v9',
  selfChecks: 'bacse202_self_checks_v1',
  rubricScores: 'bacse202_rubric_scores_v1',
  flashcards: 'bacse202_known_flashcards_v1',
  flashcardSrs: 'bacse202_flashcard_srs_v1',
  flashcardSrsMode: 'bacse202_flashcard_srs_mode_v1',
  drillStats: 'bacse202_drill_stats_v1',
  lockedTraps: 'bacse202_traps_locked_v1',
  standingAnswers: 'bacse202_standing_answers_v1',
  standingScores: 'bacse202_standing_scores_v1',
  weakTopics: 'bacse202_weak_topics_v1',
  pomodoro: 'bacse202_pomodoro_v1',
  darkMode: DARK_MODE_STORAGE_KEY,
};

function loadJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// 7-Division Color Wheel from rw-manual-acetate-tab-board
export const DIVISION_WHEEL: Record<
  ModuleId,
  { hex: string; name: string; code: string; hours: number }
> = {
  m1: { hex: '#E5B82E', name: 'Chrome Yellow', code: 'M1', hours: 7 },
  m2: { hex: '#E06D2B', name: 'Oxide Orange', code: 'M2', hours: 10 },
  m3: { hex: '#4F8A3D', name: 'Grass Green', code: 'M3', hours: 9 },
  m4: { hex: '#147E7B', name: 'Teal', code: 'M4', hours: 10 },
  m5: { hex: '#22559C', name: 'Ultramarine', code: 'M5', hours: 7 },
};

/**
 * WEB LEVERAGE (rw-manual-acetate-tab-board):
 * Binary search sRGB source-over compositing of milk-acetate leaf (#FAF7F0)
 * over the active division board hue until the reading field lands in the
 * target relative luminance band (0.91), then publish as --leaf-alpha.
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function solveLeafAlpha(boardHex: string, targetLuminance = 0.91): number {
  const boardRgb = hexToRgb(boardHex);
  const leafRgb: [number, number, number] = [250, 247, 240]; // #FAF7F0
  let low = 0.75;
  let high = 0.98;
  for (let step = 0; step < 12; step++) {
    const mid = (low + high) / 2;
    const comp: [number, number, number] = [
      leafRgb[0] * mid + boardRgb[0] * (1 - mid),
      leafRgb[1] * mid + boardRgb[1] * (1 - mid),
      leafRgb[2] * mid + boardRgb[2] * (1 - mid),
    ];
    if (relativeLuminance(comp) < targetLuminance) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return Number(((low + high) / 2).toFixed(3));
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('standing');
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('m1');
  const [activeLab, setActiveLab] = useState<LabId>('normalization');

  const [completedBlockIds, setCompletedBlockIds] = useState<string[]>(() =>
    loadJsonStorage<string[]>(STORAGE_KEYS.blocks, [])
  );
  const [masteredTopicIds, setMasteredTopicIds] = useState<string[]>(() =>
    loadJsonStorage<string[]>(STORAGE_KEYS.topics, [])
  );
  const [mockAnswers, setMockAnswers] = useState<Record<string, number>>(() =>
    loadJsonStorage<Record<string, number>>(STORAGE_KEYS.answers, {})
  );
  const [completedUpgradeIds, setCompletedUpgradeIds] = useState<string[]>(() =>
    loadJsonStorage<string[]>(STORAGE_KEYS.upgradeChecklist, [
      'imp-1',
      'imp-2',
      'imp-3',
      'imp-4',
      'imp-5',
      'imp-6',
      'imp-7',
      'imp-8',
      'imp-9',
      'imp-10',
      'imp-11',
      'imp-12',
      'imp-13',
    ])
  );
  const [selfCheckSelections, setSelfCheckSelections] = useState<Record<string, number>>(() =>
    loadJsonStorage<Record<string, number>>(STORAGE_KEYS.selfChecks, {})
  );
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(() =>
    loadJsonStorage<Record<string, number>>(STORAGE_KEYS.rubricScores, {})
  );
  const [srsProgress, setSrsProgress] = useState<SrsProgressMap>(() => {
    const savedMap = loadJsonStorage<SrsProgressMap>(STORAGE_KEYS.flashcardSrs, {});
    const legacyIds = loadJsonStorage<string[]>(STORAGE_KEYS.flashcards, []);
    return migrateLegacyKnownIds(legacyIds, savedMap, Date.now());
  });
  const [srsMode, setSrsMode] = useState<SrsMode>(() =>
    loadJsonStorage<SrsMode>(STORAGE_KEYS.flashcardSrsMode, 'fat48h')
  );
  const [drillStats, setDrillStats] = useState<{
    solved: number;
    bestStreak: number;
    currentStreak: number;
  }>(() =>
    loadJsonStorage(STORAGE_KEYS.drillStats, { solved: 0, bestStreak: 0, currentStreak: 0 })
  );
  const [lockedTrapIds, setLockedTrapIds] = useState<string[]>(() =>
    loadJsonStorage<string[]>(STORAGE_KEYS.lockedTraps, [])
  );
  const [standingAnswers, setStandingAnswers] = useState<Record<string, number>>(() =>
    loadJsonStorage<Record<string, number>>(STORAGE_KEYS.standingAnswers, {})
  );
  const [standingScores, setStandingScores] = useState<StandingScoresMap>(() =>
    loadJsonStorage<StandingScoresMap>(STORAGE_KEYS.standingScores, {})
  );
  const [weakTopics, setWeakTopics] = useState<WeakTopicEntry[]>(() =>
    loadJsonStorage<WeakTopicEntry[]>(STORAGE_KEYS.weakTopics, [])
  );
  const [mockPresetRequest, setMockPresetRequest] = useState<MockPresetRequest | null>(null);
  const [focusedTopicId, setFocusedTopicId] = useState<string | null>(null);
  const [openMissedQueueSignal, setOpenMissedQueueSignal] = useState<number>(0);
  const [openFlashcardsSignal, setOpenFlashcardsSignal] = useState<number>(0);
  const [openPlaybookSignal, setOpenPlaybookSignal] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const storedRaw = window.localStorage.getItem(STORAGE_KEYS.darkMode);
      const systemPrefersDark = Boolean(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      return resolveInitialDarkMode(storedRaw, systemPrefersDark);
    } catch {
      return false;
    }
  });

  // Sync 'dark' class on <html> and respect OS prefers-color-scheme changes if user hasn't explicitly chosen yet
  useEffect(() => {
    applyDarkModeClass(document.documentElement, isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (event: MediaQueryListEvent) => {
      try {
        const stored = parseStoredDarkMode(window.localStorage.getItem(STORAGE_KEYS.darkMode));
        if (stored === null) {
          setIsDarkMode(event.matches);
        }
      } catch {
        setIsDarkMode(event.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEYS.darkMode, serializeDarkModePreference(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  // Publish solved acetate leaf alpha and active division accent to :root
  useEffect(() => {
    const activeHex =
      activeView === 'standing'
        ? '#6B21A8'
        : activeView === 'labs'
        ? '#6F539B'
        : activeView === 'mock'
        ? '#854D2B'
        : DIVISION_WHEEL[activeModuleId].hex;
    const alpha = solveLeafAlpha(activeHex, 0.91);
    document.documentElement.style.setProperty('--division-accent', activeHex);
    document.documentElement.style.setProperty('--leaf-alpha', String(alpha));
  }, [activeView, activeModuleId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.blocks, JSON.stringify(completedBlockIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [completedBlockIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.topics, JSON.stringify(masteredTopicIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [masteredTopicIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(mockAnswers));
    } catch {
      // Ignore storage quota errors
    }
  }, [mockAnswers]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.upgradeChecklist,
        JSON.stringify(completedUpgradeIds)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [completedUpgradeIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.selfChecks,
        JSON.stringify(selfCheckSelections)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [selfCheckSelections]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.rubricScores,
        JSON.stringify(rubricScores)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [rubricScores]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.flashcardSrs, JSON.stringify(srsProgress));
    } catch {
      // Ignore storage quota errors
    }
  }, [srsProgress]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.flashcardSrsMode, JSON.stringify(srsMode));
    } catch {
      // Ignore storage quota errors
    }
  }, [srsMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.drillStats, JSON.stringify(drillStats));
    } catch {
      // Ignore storage quota errors
    }
  }, [drillStats]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.lockedTraps, JSON.stringify(lockedTrapIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [lockedTrapIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.standingAnswers,
        JSON.stringify(standingAnswers)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [standingAnswers]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.standingScores,
        JSON.stringify(standingScores)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [standingScores]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.weakTopics, JSON.stringify(weakTopics));
    } catch {
      // Ignore storage quota errors
    }
  }, [weakTopics]);

  const handleRateFlashcard = (cardId: string, rating: SrsRating) => {
    setSrsProgress((prev) => ({
      ...prev,
      [cardId]: reviewCard(prev[cardId], cardId, rating, srsMode, Date.now()),
    }));
  };

  const handleResetFlashcards = () => {
    setSrsProgress({});
    try {
      window.localStorage.removeItem(STORAGE_KEYS.flashcards);
    } catch {
      // Ignore storage quota errors
    }
  };

  const retainedFlashcardIds = useMemo(
    () => extractRetainedCardIds(FLASHCARD_DECK, srsProgress),
    [srsProgress]
  );

  const handleRecordDrillResult = (correct: boolean) => {
    setDrillStats((prev) => {
      const nextStreak = correct ? prev.currentStreak + 1 : 0;
      return {
        solved: correct ? prev.solved + 1 : prev.solved,
        currentStreak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });
  };

  const toggleTrapLocked = (trapId: string) => {
    setLockedTrapIds((prev) =>
      prev.includes(trapId) ? prev.filter((id) => id !== trapId) : [...prev, trapId]
    );
  };

  const allSelfCheckMeta = useMemo(() => {
    const items: Array<{
      key: string;
      moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
      correctIndex: number;
    }> = [];
    for (const mod of MODULES) {
      for (const topic of mod.topics) {
        TOPIC_NOTES[topic.id]?.selfChecks?.forEach((sc, idx) => {
          items.push({
            key: `${topic.id}-sc-${idx}`,
            moduleId: mod.id,
            correctIndex: sc.correctIndex,
          });
        });
      }
    }
    return items;
  }, []);

  const examReadiness = useMemo(
    () =>
      calculateExamReadiness({
        modules: MODULES,
        sprintBlocks: SPRINT_BLOCKS,
        completedBlockIds,
        masteredTopicIds,
        selfCheckItems: allSelfCheckMeta,
        selfCheckSelections,
        fatQuestions: FAT_QUESTIONS,
        mockAnswers,
        rubricScores,
        knownFlashcardIds: retainedFlashcardIds,
        drillSolvedCount: drillStats.solved,
        lockedTrapIds,
      }),
    [
      completedBlockIds,
      masteredTopicIds,
      allSelfCheckMeta,
      selfCheckSelections,
      mockAnswers,
      rubricScores,
      retainedFlashcardIds,
      drillStats.solved,
      lockedTrapIds,
    ]
  );

  const toggleBlock = (blockId: string) => {
    setCompletedBlockIds((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const toggleUpgrade = (upgradeId: string) => {
    setCompletedUpgradeIds((prev) =>
      prev.includes(upgradeId) ? prev.filter((id) => id !== upgradeId) : [...prev, upgradeId]
    );
  };

  const toggleTopicMastered = (topicId: string) => {
    setMasteredTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    const previousChoice = mockAnswers[questionId];
    setMockAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (previousChoice === optionIndex) return;
    const fatQ = FAT_QUESTIONS.find((q) => q.id === questionId);
    if (fatQ && optionIndex !== fatQ.correctIndex) {
      setWeakTopics((prev) =>
        recordWeakTopicWrong(prev, {
          questionId: fatQ.id,
          moduleId: fatQ.moduleId,
          source: 'mock',
          prompt: fatQ.prompt,
        })
      );
    }
  };

  const handleRecordStandingAnswer = (
    question: StandingQuestion,
    optionIndex: number
  ) => {
    setStandingAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
    if (optionIndex !== question.correctIndex) {
      setWeakTopics((prev) =>
        recordWeakTopicWrong(prev, {
          questionId: question.id,
          moduleId: question.moduleId,
          tier: question.tier,
          source: 'standing',
          prompt: question.prompt,
        })
      );
    }
  };

  const handleResetModuleStandingAnswers = (moduleId: ModuleId) => {
    const prefix = `s_${moduleId}_`;
    setStandingAnswers((prev) => {
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!k.startsWith(prefix)) next[k] = v;
      }
      return next;
    });
  };

  const handleSaveModuleScore = (moduleId: ModuleId, score: ModuleStandingScore) => {
    setStandingScores((prev) => ({ ...prev, [moduleId]: score }));
  };

  const handleReviewWeakTopic = (questionId: string) => {
    setWeakTopics((prev) => markWeakTopicReviewed(prev, questionId));
  };

  const handleToggleWeakTopicResolved = (questionId: string) => {
    setWeakTopics((prev) => toggleWeakTopicResolved(prev, questionId));
  };

  const handleClearResolvedWeakTopics = () => {
    setWeakTopics((prev) => clearResolvedWeakTopics(prev));
  };

  const unresolvedWeakCount = useMemo(
    () => countUnresolvedWeakTopics(weakTopics),
    [weakTopics]
  );

  const handleSelectSelfCheck = (key: string, optionIdx: number) => {
    setSelfCheckSelections((prev) => ({ ...prev, [key]: optionIdx }));
  };

  const handleResetTopicSelfChecks = (topicId: string, count: number) => {
    setSelfCheckSelections((prev) => {
      const next = { ...prev };
      for (let i = 0; i < count; i++) {
        delete next[`${topicId}-sc-${i}`];
      }
      return next;
    });
  };

  const handleResetAllSelfChecks = () => {
    setSelfCheckSelections({});
  };

  const handleSetRubricScore = (scoreKey: string, value: number | null) => {
    setRubricScores((prev) => {
      const next = { ...prev };
      if (value === null) {
        delete next[scoreKey];
      } else {
        next[scoreKey] = value;
      }
      return next;
    });
  };

  const handleResetRubricScores = (paperPrefix: string) => {
    setRubricScores((prev) => {
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!k.startsWith(paperPrefix)) {
          next[k] = v;
        }
      }
      return next;
    });
  };

  const navItems: Array<{
    id: AppView;
    label: string;
    isStanding?: boolean;
    isMock?: boolean;
  }> = [
    { id: 'standing', label: 'Standing', isStanding: true },
    { id: 'plan', label: '48h Plan' },
    { id: 'syllabus', label: 'Syllabus' },
    { id: 'reference', label: 'Reference' },
    { id: 'labs', label: 'Interactive Labs' },
    { id: 'mock', label: 'FAT Mock', isMock: true },
  ];

  const isFullWidthSyllabus = activeView === 'syllabus';
  const containerClass = isFullWidthSyllabus
    ? 'w-full px-4 sm:px-7 lg:px-9'
    : 'w-full max-w-7xl mx-auto px-4 sm:px-6';

  const foreEdgeTabs: Array<{
    id: string;
    label: string;
    hex: string;
    lightText: boolean;
    heightClass: string;
    isActive: boolean;
    onClick: () => void;
  }> = [
    {
      id: 'm1',
      label: 'M1 · 7H',
      hex: '#E5B82E',
      lightText: false,
      heightClass: 'h-24',
      isActive: (activeView === 'syllabus' || activeView === 'reference') && activeModuleId === 'm1',
      onClick: () => {
        setActiveModuleId('m1');
        if (activeView !== 'reference') setActiveView('syllabus');
      },
    },
    {
      id: 'm2',
      label: 'M2 · 10H',
      hex: '#E06D2B',
      lightText: false,
      heightClass: 'h-32',
      isActive: (activeView === 'syllabus' || activeView === 'reference') && activeModuleId === 'm2',
      onClick: () => {
        setActiveModuleId('m2');
        if (activeView !== 'reference') setActiveView('syllabus');
      },
    },
    {
      id: 'm3',
      label: 'M3 · 9H',
      hex: '#4F8A3D',
      lightText: true,
      heightClass: 'h-28',
      isActive: (activeView === 'syllabus' || activeView === 'reference') && activeModuleId === 'm3',
      onClick: () => {
        setActiveModuleId('m3');
        if (activeView !== 'reference') setActiveView('syllabus');
      },
    },
    {
      id: 'm4',
      label: 'M4 · 10H',
      hex: '#147E7B',
      lightText: true,
      heightClass: 'h-32',
      isActive: (activeView === 'syllabus' || activeView === 'reference') && activeModuleId === 'm4',
      onClick: () => {
        setActiveModuleId('m4');
        if (activeView !== 'reference') setActiveView('syllabus');
      },
    },
    {
      id: 'm5',
      label: 'M5 · 7H',
      hex: '#22559C',
      lightText: true,
      heightClass: 'h-24',
      isActive: (activeView === 'syllabus' || activeView === 'reference') && activeModuleId === 'm5',
      onClick: () => {
        setActiveModuleId('m5');
        if (activeView !== 'reference') setActiveView('syllabus');
      },
    },
    {
      id: 'labs',
      label: 'LABS',
      hex: '#6F539B',
      lightText: true,
      heightClass: 'h-24',
      isActive: activeView === 'labs',
      onClick: () => setActiveView('labs'),
    },
    {
      id: 'mock',
      label: '100M FAT',
      hex: '#854D2B',
      lightText: true,
      heightClass: 'h-24',
      isActive: activeView === 'mock',
      onClick: () => setActiveView('mock'),
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#26231E] dark:bg-[#100F0D] text-[#1C1B18] dark:text-[#E6E2DA] p-0 xl:p-3 transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2.5 focus:left-4 focus:z-50 focus:px-3.5 focus:py-2 focus:bg-[#E5B82E] focus:text-[#1C1B18] focus:border focus:border-[#1C1B18] focus:text-xs focus:font-mono focus:font-semibold focus:rounded-[4px]"
      >
        Skip to main content
      </a>

      {/* Open Manual Section Board */}
      <div className="flex-1 flex bg-[#EAE4D7] dark:bg-[#171613] border border-[#1C1B18] dark:border-[#312E29] rounded-none xl:rounded-l-[6px] min-w-0 transition-colors duration-200">
        {/* Left Punched Binder Margin & Folio Stamp (Desktop) */}
        <aside
          aria-hidden="true"
          className="hidden xl:flex flex-col items-center justify-between py-12 w-11 border-r border-[#C5BEB0] dark:border-[#312E29] bg-[#E5DEC9]/60 dark:bg-[#1C1A16] shrink-0 select-none transition-colors duration-200"
        >
          <div className="binder-hole" />
          <div className="binder-hole" />
          <div
            className="font-mono text-[10px] tracking-[0.22em] text-[#6E695D] dark:text-[#8F897D] uppercase whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            BACSE202 REFERENCE MANUAL · VER. 2026.11
          </div>
          <div className="binder-hole" />
        </aside>

        {/* Primary Manual Sheet Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Strict 3-Zone Top Bar Contract */}
          <header className="sticky top-0 z-30 bg-[#EAE4D7]/95 dark:bg-[#171613]/95 backdrop-blur-xs border-b border-[#1C1B18] dark:border-[#312E29] transition-colors duration-200">
            <div className={`${containerClass} h-14 flex items-center justify-between gap-2 sm:gap-6`}>
              {/* Zone 1: Single-element Brand Wordmark */}
              <button
                type="button"
                onClick={() => setActiveView('standing')}
                className="text-sm sm:text-lg font-display font-extrabold tracking-[0.05em] sm:tracking-[0.08em] uppercase text-[#1C1B18] dark:text-[#E6E2DA] whitespace-nowrap shrink-0 rounded-[3px]"
              >
                BACSE202 Sprint
              </button>

              {/* Zone 2: Single-line text nav links (Standing first with #6B21A8 accent) */}
              <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-4 lg:gap-5">
                {navItems.map((item) => {
                  const isActive = activeView === item.id;
                  const activeBorder = item.isStanding
                    ? 'text-[#6B21A8] font-bold border-[#6B21A8]'
                    : 'text-[#1C1B18] font-semibold border-[#1C1B18]';
                  const idleStyle = item.isStanding
                    ? 'text-[#6B21A8] border-transparent hover:border-[#6B21A8]/50 font-semibold'
                    : 'text-[#434038] border-transparent hover:text-[#1C1B18]';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveView(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={
                        item.isMock && unresolvedWeakCount > 0
                          ? `FAT Mock (${unresolvedWeakCount} unresolved weak topics)`
                          : undefined
                      }
                      title={
                        item.isMock && unresolvedWeakCount > 0
                          ? `FAT Mock (${unresolvedWeakCount} unresolved weak topics)`
                          : undefined
                      }
                      className={`inline-flex items-center ${
                        item.isMock && unresolvedWeakCount > 0 ? 'gap-2.5' : 'gap-1.5'
                      } py-1 text-xs font-mono uppercase tracking-[0.08em] step-hinge whitespace-nowrap shrink-0 border-b-2 ${
                        isActive ? activeBorder : idleStyle
                      }`}
                    >
                      {item.isStanding && (
                        <Gauge className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      )}
                      {item.isMock && (
                        <span className="relative inline-flex items-center shrink-0">
                          <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          {unresolvedWeakCount > 0 && (
                            <span
                              data-testid="nav-weak-topics-badge"
                              aria-hidden="true"
                              className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-mono font-extrabold leading-none inline-flex items-center justify-center border border-[#FAF7F0] tabular-nums"
                            >
                              {unresolvedWeakCount}
                            </span>
                          )}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Zone 3: Dark Mode Toggle + Primary CTA */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  data-testid="dark-mode-toggle"
                  onClick={handleToggleDarkMode}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-pressed={isDarkMode}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-[#FAF7F0] dark:bg-[#201E1A] hover:bg-[#F4EFE4] dark:hover:bg-[#2A2722] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] step-hinge shrink-0"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-[#D8B048]" aria-hidden="true" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#1C1B18]" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('mock')}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.05em] sm:tracking-[0.06em] text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8aa22] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                >
                  <span>Start FAT Mock →</span>
                  {unresolvedWeakCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="md:hidden min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-mono font-extrabold leading-none inline-flex items-center justify-center tabular-nums"
                    >
                      {unresolvedWeakCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Navigation Bar (static flow, zero sticky bloat) */}
          <nav
            aria-label="Mobile navigation"
            className="md:hidden bg-[#F4EFE4] border-b border-[#1C1B18] px-3 py-2 flex items-center gap-1.5 overflow-x-auto"
          >
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={
                    item.isMock && unresolvedWeakCount > 0
                      ? `FAT Mock (${unresolvedWeakCount} unresolved weak topics)`
                      : undefined
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-[3px] whitespace-nowrap shrink-0 border ${
                    isActive
                      ? item.isStanding
                        ? 'bg-[#6B21A8] text-[#FAF7F0] border-[#1C1B18] font-semibold'
                        : 'bg-[#E5B82E] text-[#1C1B18] border-[#1C1B18] font-semibold'
                      : item.isStanding
                      ? 'bg-transparent text-[#6B21A8] border-[#6B21A8]/40 font-semibold'
                      : 'bg-transparent text-[#434038] border-transparent hover:border-[#C5BEB0]'
                  }`}
                >
                  {item.isStanding && (
                    <Gauge className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  {item.isMock && (
                    <ClipboardCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                  {item.isMock && unresolvedWeakCount > 0 && (
                    <span
                      data-testid="mobile-nav-weak-topics-badge"
                      aria-hidden="true"
                      className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-mono font-extrabold leading-none inline-flex items-center justify-center tabular-nums"
                    >
                      {unresolvedWeakCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <main id="main-content" className={`flex-1 ${containerClass} py-6 sm:py-8`}>
            {activeView !== 'plan' && (
              <ExamCountdown variant="compact" onOpenPlan={() => setActiveView('plan')} />
            )}

            {activeView === 'standing' && (
              <StandingView
                divisionColors={DIVISION_WHEEL}
                standingAnswers={standingAnswers}
                standingScores={standingScores}
                weakTopics={weakTopics}
                onRecordStandingAnswer={handleRecordStandingAnswer}
                onResetModuleStandingAnswers={handleResetModuleStandingAnswers}
                onSaveModuleScore={handleSaveModuleScore}
                onReviewWeakTopic={handleReviewWeakTopic}
                onToggleWeakTopicResolved={handleToggleWeakTopicResolved}
                onClearResolvedWeakTopics={handleClearResolvedWeakTopics}
                onGoToNotes={(modId) => {
                  setActiveModuleId(modId);
                  setActiveView('syllabus');
                }}
                onGoToLabs={(modId) => {
                  const mod = MODULES.find((m) => m.id === modId);
                  setActiveLab(mod?.recommendedLab ?? 'integrity');
                  setActiveView('labs');
                }}
                onGoToMock={(modId) => {
                  setMockPresetRequest({
                    subView: 'mcq',
                    moduleId: modId,
                    nonce: Date.now(),
                  });
                  setActiveView('mock');
                }}
                onReviewWeakTopics={(modId) => {
                  setMockPresetRequest({
                    subView: 'weak_topics',
                    moduleId: modId ?? 'all',
                    nonce: Date.now(),
                  });
                  setActiveView('mock');
                }}
              />
            )}

            {activeView === 'plan' && (
              <SprintPlannerView
                activeModuleId={activeModuleId}
                divisionColors={DIVISION_WHEEL}
                completedBlockIds={completedBlockIds}
                masteredTopicIds={masteredTopicIds}
                readiness={examReadiness}
                onToggleBlock={toggleBlock}
                onResetProgress={() => setCompletedBlockIds([])}
                completedUpgradeIds={completedUpgradeIds}
                onToggleUpgrade={toggleUpgrade}
                onNavigateToModule={(modId) => {
                  setActiveModuleId(modId);
                  setActiveView('syllabus');
                }}
                onNavigateToLab={(lab) => {
                  setActiveLab(lab);
                  setActiveView('labs');
                }}
                onStartMock={() => setActiveView('mock')}
                onOpenMissedQueue={() => {
                  setOpenMissedQueueSignal((n) => n + 1);
                  setActiveView('syllabus');
                }}
                onOpenSyllabus={() => setActiveView('syllabus')}
                onOpenReference={() => setActiveView('reference')}
                onOpenFlashcards={() => {
                  setOpenFlashcardsSignal((n) => n + 1);
                  setActiveView('reference');
                }}
                onOpenPlaybook={() => {
                  setOpenPlaybookSignal((n) => n + 1);
                  setActiveView('reference');
                }}
              />
            )}

            {activeView === 'syllabus' && (
              <SyllabusView
                activeModuleId={activeModuleId}
                onSelectModule={setActiveModuleId}
                masteredTopicIds={masteredTopicIds}
                onToggleTopicMastered={toggleTopicMastered}
                onNavigateToLab={(lab) => {
                  setActiveLab(lab);
                  setActiveView('labs');
                }}
                selfCheckSelections={selfCheckSelections}
                onSelectSelfCheck={handleSelectSelfCheck}
                onResetTopicSelfChecks={handleResetTopicSelfChecks}
                onResetAllSelfChecks={handleResetAllSelfChecks}
                focusedTopicId={focusedTopicId}
                onClearFocusedTopic={() => setFocusedTopicId(null)}
                openMissedQueueSignal={openMissedQueueSignal}
              />
            )}

            {activeView === 'reference' && (
              <ReferenceView
                activeModuleId={activeModuleId}
                divisionColors={DIVISION_WHEEL}
                onSelectModule={setActiveModuleId}
                onNavigateToSyllabus={(modId) => {
                  setActiveModuleId(modId);
                  setActiveView('syllabus');
                }}
                openFlashcardsSignal={openFlashcardsSignal}
                openPlaybookSignal={openPlaybookSignal}
                srsProgress={srsProgress}
                srsMode={srsMode}
                onRateFlashcard={handleRateFlashcard}
                onChangeSrsMode={setSrsMode}
                onResetFlashcards={handleResetFlashcards}
                lockedTrapIds={lockedTrapIds}
                onToggleTrap={toggleTrapLocked}
                onResetTraps={() => setLockedTrapIds([])}
              />
            )}

            {activeView === 'labs' && (
              <InteractiveLabsView
                activeLab={activeLab}
                onSelectLab={setActiveLab}
                drillSolvedCount={drillStats.solved}
                drillBestStreak={drillStats.bestStreak}
                onRecordDrillResult={handleRecordDrillResult}
                onResetDrillStats={() =>
                  setDrillStats({ solved: 0, bestStreak: 0, currentStreak: 0 })
                }
              />
            )}

            {activeView === 'mock' && (
              <FatMockView
                savedAnswers={mockAnswers}
                onSelectAnswer={handleSelectAnswer}
                onResetAnswers={() => setMockAnswers({})}
                rubricScores={rubricScores}
                onSetRubricScore={handleSetRubricScore}
                onResetRubricScores={handleResetRubricScores}
                weakTopics={weakTopics}
                divisionColors={DIVISION_WHEEL}
                onReviewWeakTopic={handleReviewWeakTopic}
                onToggleWeakTopicResolved={handleToggleWeakTopicResolved}
                onClearResolvedWeakTopics={handleClearResolvedWeakTopics}
                presetRequest={mockPresetRequest}
                onNavigateToTopic={(modId, topicId) => {
                  setActiveModuleId(modId);
                  setFocusedTopicId(topicId);
                  setActiveView('syllabus');
                }}
              />
            )}
          </main>

          <footer className="border-t border-[#1C1B18] bg-[#E5DEC9]/70">
            <div className={`${containerClass} py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-[#434038]`}>
              <span>
                {COURSE_META.code} {COURSE_META.title} · {COURSE_META.institution} · {COURSE_META.examDate}
              </span>
              <span>SYLLABUS MANUAL REV 1.0 (MODULES 1–5 · 43 LECTURE HOURS)</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Stepped Fore-Edge Division Tab Rail (rw-manual-acetate-tab-board signature topology) */}
      <aside
        aria-label="Manual division tab rail"
        className="hidden xl:flex flex-col w-9 pt-14 shrink-0 select-none"
      >
        {foreEdgeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={tab.onClick}
            title={`Switch to ${tab.label}`}
            style={{ backgroundColor: tab.hex }}
            className={`fore-edge-tab ${tab.heightClass} relative flex flex-col items-center justify-between py-2.5 border-y border-r border-[#1C1B18] dark:border-[#312E29] rounded-r-[6px] step-hinge ${
              tab.isActive ? 'w-9 -ml-px z-10 font-bold' : 'w-7 opacity-90 hover:w-8 hover:opacity-100'
            } ${tab.lightText ? 'text-[#FAF7F0]' : 'text-[#1C1B18]'}`}
          >
            <span
              className="w-2 h-2 rounded-full bg-[#FAF7F0] border border-[#1C1B18]/40 shrink-0"
              aria-hidden="true"
            />
            <span
              className="font-mono text-[10px] tracking-[0.14em] uppercase whitespace-nowrap tabular-nums"
              style={{ writingMode: 'vertical-rl' }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </aside>

      {/* Global Floating Formula Quick Reference Widget (Ctrl+K / Cmd+K) */}
      <FormulaQuickRef divisionColors={DIVISION_WHEEL} />
    </div>
  );
}
