import React from 'react';
import { Award, Check } from 'lucide-react';
import { ConfettiParticle, MasteryMilestone } from '../utils/confettiEngine';

export interface ConfettiBurstInstance {
  id: number;
  originX: number;
  originY: number;
  particles: ConfettiParticle[];
  accentHex: string;
}

interface MasteryConfettiOverlayProps {
  bursts: ConfettiBurstInstance[];
  toast: { id: number; milestone: MasteryMilestone } | null;
}

export const MasteryConfettiOverlay: React.FC<MasteryConfettiOverlayProps> = ({
  bursts,
  toast,
}) => {
  if (bursts.length === 0 && !toast) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[70] overflow-hidden no-print"
      aria-hidden={toast ? undefined : true}
    >
      {/* Subtle Paper-Punch & Acetate-Tab Confetti Bursts */}
      {bursts.map((burst) => (
        <div
          key={burst.id}
          data-testid="mastery-confetti-burst"
          aria-hidden="true"
          style={{
            transform: `translate3d(${Math.round(burst.originX)}px, ${Math.round(burst.originY)}px, 0)`,
          }}
          className="fixed top-0 left-0 will-change-transform"
        >
          {/* Subtle single radial shock-ring around clicked check button */}
          <span
            style={{ borderColor: burst.accentHex }}
            className="absolute -left-4 -top-4 w-8 h-8 rounded-full border-2 mastery-ring-pulse"
          />

          {burst.particles.map((p) => {
            const shapeClass =
              p.shape === 'punch'
                ? 'rounded-full'
                : p.shape === 'diamond'
                ? 'rounded-[1px]'
                : 'rounded-[1.5px]';

            return (
              <span
                key={p.id}
                data-testid="confetti-particle"
                style={
                  {
                    width: `${p.widthPx}px`,
                    height: `${p.heightPx}px`,
                    marginLeft: `${-p.widthPx / 2}px`,
                    marginTop: `${-p.heightPx / 2}px`,
                    backgroundColor: p.color,
                    border: '1px solid rgba(28, 27, 24, 0.35)',
                    animationDelay: `${p.delayMs}ms`,
                    animationDuration: `${p.durationMs}ms`,
                    '--confetti-mid-x': `${p.midX}px`,
                    '--confetti-mid-y': `${p.midY}px`,
                    '--confetti-end-x': `${p.endX}px`,
                    '--confetti-end-y': `${p.endY}px`,
                    '--confetti-rot': `${p.rotateDeg}deg`,
                  } as React.CSSProperties
                }
                className={`absolute top-0 left-0 mastery-confetti-piece ${shapeClass}`}
              />
            );
          })}
        </div>
      ))}

      {/* Crisp, Non-Blocking Reinforcement Notice (also works under prefers-reduced-motion) */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          data-testid="mastery-celebration-toast"
          className="fixed bottom-5 right-5 max-w-xs sm:max-w-sm bg-[#FAF7F0] border-2 border-[#1C1B18] rounded-[4px] px-3.5 py-2.5 shadow-[3px_3px_0px_#1C1B18] flex items-center gap-3 mastery-toast-enter"
        >
          <span
            className={`w-7 h-7 rounded-full border border-[#1C1B18] flex items-center justify-center shrink-0 ${
              toast.milestone.kind === 'topic'
                ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                : 'bg-[#E5B82E] text-[#1C1B18]'
            }`}
            aria-hidden="true"
          >
            {toast.milestone.kind === 'topic' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Award className="w-4 h-4" />
            )}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-mono font-extrabold uppercase tracking-[0.05em] text-[#1C1B18] tabular-nums">
              {toast.milestone.headline}
            </div>
            <div className="text-xs text-[#434038] truncate">
              {toast.milestone.detail}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
