/**
 * Pure, deterministic particle & milestone generator for the Acetate Tab Board
 * topic-mastery celebration. Uses exclusively compositor-friendly transform
 * coordinates (dx, peakY, endY, rotation, scale) and the 7-division manual palette.
 */

export type ConfettiShape = 'punch' | 'tab' | 'diamond';

export interface ConfettiParticle {
  id: number;
  color: string;
  shape: ConfettiShape;
  widthPx: number;
  heightPx: number;
  /** Horizontal travel at peak/apex (px) */
  midX: number;
  /** Vertical travel at apex (negative = upward lift, px) */
  midY: number;
  /** Final horizontal displacement (px) */
  endX: number;
  /** Final vertical displacement after gentle gravity drop (px) */
  endY: number;
  /** Final rotation in degrees */
  rotateDeg: number;
  /** Stagger delay before launch (ms) */
  delayMs: number;
  /** Total flight duration (ms) */
  durationMs: number;
}

export interface MasteryMilestone {
  kind: 'topic' | 'module' | 'syllabus';
  headline: string;
  detail: string;
}

export const ACETATE_CONFETTI_PALETTE = [
  '#4F8A3D', // Grass Green (Mastery)
  '#E5B82E', // Chrome Yellow (M1)
  '#E06D2B', // Oxide Orange (M2)
  '#147E7B', // Teal (M4)
  '#22559C', // Ultramarine (M5)
  '#6F539B', // Violet (Labs)
] as const;

/** Simple deterministic Mulberry32 PRNG for reproducible tests & balanced bursts. */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GenerateParticlesOptions {
  seed: number;
  accentHex?: string;
  intensity?: 'subtle' | 'milestone';
  direction?: 'up' | 'down';
}

export function generateConfettiParticles({
  seed,
  accentHex,
  intensity = 'subtle',
  direction = 'up',
}: GenerateParticlesOptions): ConfettiParticle[] {
  const rand = createSeededRandom(seed);
  const count = intensity === 'milestone' ? 34 : 22;
  const shapes: ConfettiShape[] = ['tab', 'punch', 'tab', 'diamond'];

  // Weight Grass Green (#4F8A3D) and the active module accent slightly higher
  const palette: string[] = [
    '#4F8A3D',
    '#4F8A3D',
    ...(accentHex ? [accentHex, accentHex] : []),
    ...ACETATE_CONFETTI_PALETTE,
  ];

  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    // Upward fan (-165 deg to -15 deg) for normal cards; downward cascade (+15 deg to +165 deg) near top edge
    const baseSlice =
      direction === 'down'
        ? (i / count) * Math.PI * 0.88 + Math.PI * 0.06
        : (i / count) * Math.PI * 1.45 - Math.PI * 1.225;
    const jitter = (rand() - 0.5) * 0.24;
    const angle = baseSlice + jitter;

    const speed =
      intensity === 'milestone'
        ? 62 + rand() * 88
        : 44 + rand() * 64;

    const midX = Math.round(Math.cos(angle) * speed * 0.65);
    const midY =
      direction === 'down'
        ? Math.round(Math.sin(angle) * speed * 0.65 + (10 + rand() * 14))
        : Math.round(Math.sin(angle) * speed - (18 + rand() * 20));
    const endX = Math.round(Math.cos(angle) * speed * 1.15);
    // Gentle gravity fall below the apex
    const gravityDrop = intensity === 'milestone' ? 56 + rand() * 44 : 40 + rand() * 34;
    const endY = Math.round(midY + gravityDrop);

    const shape = shapes[Math.floor(rand() * shapes.length)];
    const widthPx =
      shape === 'punch'
        ? 5 + Math.round(rand() * 2)
        : shape === 'diamond'
        ? 6 + Math.round(rand() * 2)
        : 7 + Math.round(rand() * 3);
    const heightPx =
      shape === 'tab' ? 4 + Math.round(rand() * 2) : widthPx;

    const color = palette[Math.floor(rand() * palette.length)];
    const spinDir = rand() < 0.5 ? -1 : 1;
    const rotateDeg = Math.round(spinDir * (140 + rand() * 220));
    const delayMs = Math.round(rand() * (intensity === 'milestone' ? 90 : 55));
    const durationMs = Math.round(
      (intensity === 'milestone' ? 860 : 720) + rand() * 260
    );

    particles.push({
      id: i,
      color,
      shape,
      widthPx,
      heightPx,
      midX,
      midY,
      endX,
      endY,
      rotateDeg,
      delayMs,
      durationMs,
    });
  }

  return particles;
}

export function getBurstLifetimeMs(particles: ConfettiParticle[]): number {
  if (particles.length === 0) return 0;
  let maxMs = 0;
  for (const p of particles) {
    const end = p.delayMs + p.durationMs;
    if (end > maxMs) maxMs = end;
  }
  return maxMs + 120;
}

export function buildMasteryMilestoneMessage(params: {
  topicTitle: string;
  moduleNumber: number;
  newModuleMasteredCount: number;
  moduleTotalTopics: number;
  newTotalMasteredCount: number;
  totalSyllabusTopics: number;
}): MasteryMilestone {
  const {
    topicTitle,
    moduleNumber,
    newModuleMasteredCount,
    moduleTotalTopics,
    newTotalMasteredCount,
    totalSyllabusTopics,
  } = params;

  if (newTotalMasteredCount >= totalSyllabusTopics) {
    return {
      kind: 'syllabus',
      headline: `Full Syllabus Mastered (${newTotalMasteredCount}/${totalSyllabusTopics})`,
      detail: 'All 5 modules locked in for the FAT exam.',
    };
  }

  if (newModuleMasteredCount >= moduleTotalTopics) {
    return {
      kind: 'module',
      headline: `Module ${moduleNumber} Complete (${newModuleMasteredCount}/${moduleTotalTopics})`,
      detail: `${newTotalMasteredCount} of ${totalSyllabusTopics} total syllabus topics mastered.`,
    };
  }

  const shortTitle =
    topicTitle.length > 42 ? `${topicTitle.slice(0, 41).trimEnd()}…` : topicTitle;

  return {
    kind: 'topic',
    headline: `Topic Mastered · M${moduleNumber} (${newModuleMasteredCount}/${moduleTotalTopics})`,
    detail: shortTitle,
  };
}
