import React from 'react';
import { motion } from 'motion/react';
import {
  computeRadarPoint,
  computeRadarPolygonPath,
  MODULE_ORDER,
  ModuleId,
  StandingScoresMap,
  TIER_META,
} from '../utils/standingEngine';

interface RadarChartProps {
  scores: StandingScoresMap;
  divisionColors: Record<ModuleId, { hex: string; code: string }>;
}

const AXIS_LABELS: Record<ModuleId, { short: string; title: string }> = {
  m1: { short: 'M1', title: 'Data Models' },
  m2: { short: 'M2', title: 'ER & Norm.' },
  m3: { short: 'M3', title: 'Physical & RA' },
  m4: { short: 'M4', title: 'Tx & Recovery' },
  m5: { short: 'M5', title: 'DDBMS & NoSQL' },
};

export const RadarChart: React.FC<RadarChartProps> = ({ scores, divisionColors }) => {
  const width = 440;
  const height = 360;
  const cx = width / 2;
  const cy = 186;
  const radius = 104;
  const ringLevels = [3.33, 6.67, 10]; // 3 concentric rings (Foundation/Application/Analysis scale 0–10)

  const foundationValues = MODULE_ORDER.map((id) => scores[id]?.foundation ?? 0);
  const applicationValues = MODULE_ORDER.map((id) => scores[id]?.application ?? 0);
  const analysisValues = MODULE_ORDER.map((id) => scores[id]?.analysis ?? 0);

  const series = [
    {
      key: 'foundation',
      label: 'Foundation',
      color: TIER_META.foundation.colorHex,
      fillOpacity: 0.22,
      values: foundationValues,
      path: computeRadarPolygonPath(foundationValues, radius, cx, cy),
      delay: 0.05,
    },
    {
      key: 'application',
      label: 'Application',
      color: TIER_META.application.colorHex,
      fillOpacity: 0.22,
      values: applicationValues,
      path: computeRadarPolygonPath(applicationValues, radius, cx, cy),
      delay: 0.18,
    },
    {
      key: 'analysis',
      label: 'Analysis',
      color: TIER_META.analysis.colorHex,
      fillOpacity: 0.24,
      values: analysisValues,
      path: computeRadarPolygonPath(analysisValues, radius, cx, cy),
      delay: 0.3,
    },
  ];

  // Clean directional offsets so axis labels sit clearly outside the outer pentagon vertices
  const labelOffsets: Array<{ dx: number; dy: number; anchor: 'middle' | 'start' | 'end' }> = [
    { dx: 0, dy: -26, anchor: 'middle' }, // M1 (Top)
    { dx: 14, dy: -4, anchor: 'start' },  // M2 (Upper Right)
    { dx: 12, dy: 18, anchor: 'start' },  // M3 (Lower Right)
    { dx: -12, dy: 18, anchor: 'end' },   // M4 (Lower Left)
    { dx: -14, dy: -4, anchor: 'end' },   // M5 (Upper Left)
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full" data-testid="standing-radar-chart">
      <div className="w-full max-w-[440px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Cross-module Standing Radar Chart showing Foundation, Application, and Analysis scores across Modules 1 through 5"
          className="w-full h-auto"
        >
          {/* 3 Concentric Reference Rings */}
          {ringLevels.map((lvl, idx) => {
            const ringPath = computeRadarPolygonPath(
              MODULE_ORDER.map(() => lvl),
              radius,
              cx,
              cy
            );
            return (
              <path
                key={lvl}
                d={ringPath}
                fillOpacity={idx === 2 ? 0.55 : 0}
                strokeWidth={idx === 2 ? 1.25 : 1}
                strokeDasharray={idx === 2 ? undefined : '3 3'}
                className={
                  idx === 2
                    ? 'fill-[#F4EFE4] dark:fill-[#282520] stroke-[#C5BEB0] dark:stroke-[#3D3A33]'
                    : 'fill-none stroke-[#C5BEB0] dark:stroke-[#3D3A33]'
                }
              />
            );
          })}

          {/* Scale Tick Numbers on Top Axis (nudged right of axis, below top vertex) */}
          {[
            { label: '3', norm: 0.333 },
            { label: '7', norm: 0.667 },
            { label: '10', norm: 0.96 },
          ].map((tick) => {
            const pt = computeRadarPoint(0, 5, tick.norm, radius, cx, cy);
            return (
              <text
                key={tick.label}
                x={pt.x + 7}
                y={pt.y + 3}
                className="fill-[#6E695D] dark:fill-slate-400 font-mono text-[9px]"
              >
                {tick.label}
              </text>
            );
          })}

          {/* 5 Module Axes colored by DIVISION_WHEEL */}
          {MODULE_ORDER.map((modId, idx) => {
            const outer = computeRadarPoint(idx, 5, 1, radius, cx, cy);
            const off = labelOffsets[idx];
            const labelX = outer.x + off.dx;
            const labelY = outer.y + off.dy;
            const assessed = Boolean(scores[modId]);
            const modColor = divisionColors[modId].hex;

            return (
              <g key={modId}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={modColor}
                  strokeWidth={assessed ? 2 : 1.25}
                  strokeOpacity={assessed ? 0.85 : 0.35}
                />
                <circle
                  cx={outer.x}
                  cy={outer.y}
                  r={4.5}
                  fill={assessed ? modColor : undefined}
                  strokeWidth={1.25}
                  className={
                    assessed
                      ? 'stroke-[#1C1B18] dark:stroke-[#E6E2DA]'
                      : 'fill-[#FAF7F0] dark:fill-[#201E1A] stroke-[#1C1B18] dark:stroke-[#8F897D]'
                  }
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={off.anchor}
                  className="fill-[#1C1B18] dark:fill-[#E6E2DA] font-mono text-[11px] font-bold"
                >
                  {AXIS_LABELS[modId].short}
                </text>
                <text
                  x={labelX}
                  y={labelY + 13}
                  textAnchor={off.anchor}
                  className="fill-[#434038] dark:fill-[#B9B3A7] font-sans text-[10.5px] font-medium"
                >
                  {AXIS_LABELS[modId].title}
                </text>
              </g>
            );
          })}

          {/* 3 Overlapping Animated Tier Polygons */}
          {series.map((s) => (
            <motion.g
              key={s.key}
              initial={{ opacity: 0, scale: 0.25 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.55,
                delay: s.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <path
                d={s.path}
                fill={s.color}
                fillOpacity={s.fillOpacity}
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {s.values.map((val, idx) => {
                const modId = MODULE_ORDER[idx];
                if (!scores[modId]) return null;
                const pt = computeRadarPoint(idx, 5, val / 10, radius, cx, cy);
                return (
                  <circle
                    key={`${s.key}-${modId}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={3}
                    fill={s.color}
                    stroke="#FAF7F0"
                    strokeWidth={1}
                  />
                );
              })}
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Crisp Legend (Zero Pill Bloat) */}
      <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-mono text-[#434038]">
        {series.map((s) => (
          <div key={s.key} className="inline-flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-[2px] border border-[#1C1B18] shrink-0"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            <span className="font-semibold text-[#1C1B18]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
