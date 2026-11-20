import React from 'react';

export interface DiagramFrameProps {
  title: string;
  caption?: string;
  viewBox: string;
  children: React.ReactNode;
}

export const DiagramFrame: React.FC<DiagramFrameProps> = ({
  title,
  caption,
  viewBox,
  children,
}) => (
  <figure className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 sm:p-4 space-y-2">
    <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-bold text-[#1C1B18] uppercase tracking-wider">
      <span>PLATE · {title}</span>
    </div>
    <div className="bg-[#FAF7F0] border border-[#C5BEB0] rounded-[2px] p-2 overflow-hidden">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={title}
        className="w-full h-auto block select-none"
        style={{ fontFamily: "'Archivo', system-ui, sans-serif" }}
      >
        <SvgMarkers />
        {children}
      </svg>
    </div>
    {caption && (
      <figcaption className="text-xs font-mono text-[#434038] leading-relaxed">
        {caption}
      </figcaption>
    )}
  </figure>
);

export const SvgMarkers: React.FC = () => (
  <defs>
    <marker
      id="arrow-slate"
      viewBox="0 0 10 10"
      refX="8.5"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#1C1B18" />
    </marker>
    <marker
      id="arrow-sky"
      viewBox="0 0 10 10"
      refX="8.5"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#22559C" />
    </marker>
    <marker
      id="arrow-emerald"
      viewBox="0 0 10 10"
      refX="8.5"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#4F8A3D" />
    </marker>
    <marker
      id="arrow-rose"
      viewBox="0 0 10 10"
      refX="8.5"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#A62B2B" />
    </marker>
    <marker
      id="arrow-amber"
      viewBox="0 0 10 10"
      refX="8.5"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#E06D2B" />
    </marker>
  </defs>
);

export type NodeTone = 'neutral' | 'sky' | 'emerald' | 'amber' | 'rose' | 'dark';

const TONE_MAP: Record<
  NodeTone,
  { fill: string; stroke: string; text: string; sub: string }
> = {
  neutral: { fill: '#FAF7F0', stroke: '#1C1B18', text: '#1C1B18', sub: '#434038' },
  sky: { fill: '#EAE4D7', stroke: '#22559C', text: '#1C1B18', sub: '#22559C' },
  emerald: { fill: '#EDF4EB', stroke: '#4F8A3D', text: '#1C1B18', sub: '#2F5922' },
  amber: { fill: '#FBF3DC', stroke: '#E5B82E', text: '#1C1B18', sub: '#854D2B' },
  rose: { fill: '#F9ECEC', stroke: '#A62B2B', text: '#1C1B18', sub: '#A62B2B' },
  dark: { fill: '#26231E', stroke: '#1C1B18', text: '#FAF7F0', sub: '#EAE4D7' },
};

export const SvgBox: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle?: string;
  tone?: NodeTone;
  rx?: number;
  fontSize?: number;
  subFontSize?: number;
}> = ({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  tone = 'neutral',
  rx = 8,
  fontSize = 12,
  subFontSize = 10,
}) => {
  const c = TONE_MAP[tone];
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={1.6}
      />
      {subtitle ? (
        <>
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={600}
            fill={c.text}
          >
            {title}
          </text>
          <text
            x={cx}
            y={cy + 11}
            textAnchor="middle"
            fontSize={subFontSize}
            fill={c.sub}
          >
            {subtitle}
          </text>
        </>
      ) : (
        <text
          x={cx}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={600}
          fill={c.text}
        >
          {title}
        </text>
      )}
    </g>
  );
};

export const DbCylinder: React.FC<{
  cx: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: NodeTone;
}> = ({ cx, y, w, h, label, tone = 'sky' }) => {
  const c = TONE_MAP[tone];
  const x = cx - w / 2;
  const ry = 8;
  return (
    <g>
      <path
        d={`M ${x} ${y + ry} L ${x} ${y + h - ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + h - ry} L ${x + w} ${y + ry} Z`}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={1.6}
      />
      <ellipse
        cx={cx}
        cy={y + ry}
        rx={w / 2}
        ry={ry}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={1.6}
      />
      <text
        x={cx}
        y={y + h / 2 + 6}
        textAnchor="middle"
        fontSize={11.5}
        fontWeight={600}
        fill={c.text}
      >
        {label}
      </text>
    </g>
  );
};

/** Chen Strong or Weak Entity (double rectangle when weak=true) */
export const ChenEntity: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  weak?: boolean;
  tone?: NodeTone;
  fontSize?: number;
}> = ({ cx, cy, w, h, label, weak = false, tone = 'neutral', fontSize = 11 }) => {
  const c = TONE_MAP[tone];
  return (
    <g>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={2}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={1.6}
      />
      {weak && (
        <rect
          x={cx - w / 2 + 3.5}
          y={cy - h / 2 + 3.5}
          width={w - 7}
          height={h - 7}
          rx={1}
          fill="none"
          stroke={c.stroke}
          strokeWidth={1.2}
        />
      )}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={700}
        fill={c.text}
      >
        {label}
      </text>
    </g>
  );
};

/** Chen Relationship Diamond (double diamond when identifying=true) */
export const ChenDiamond: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  label: string;
  identifying?: boolean;
  tone?: NodeTone;
  fontSize?: number;
}> = ({ cx, cy, rx, ry, label, identifying = false, tone = 'sky', fontSize = 9.5 }) => {
  const c = TONE_MAP[tone];
  const pts = `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
  const innerPts = `${cx},${cy - ry + 4.5} ${cx + rx - 6.5},${cy} ${cx},${cy + ry - 4.5} ${cx - rx + 6.5},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} />
      {identifying && (
        <polygon points={innerPts} fill="none" stroke={c.stroke} strokeWidth={1.15} />
      )}
      <text
        x={cx}
        y={cy + 3.5}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={600}
        fill={c.text}
      >
        {label}
      </text>
    </g>
  );
};

/** Chen Attribute Oval (key, partialKey, multivalued, derived) */
export const ChenAttr: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  label: string;
  keyAttr?: boolean;
  partialKey?: boolean;
  multivalued?: boolean;
  derived?: boolean;
  fontSize?: number;
}> = ({
  cx,
  cy,
  rx,
  ry = 12,
  label,
  keyAttr = false,
  partialKey = false,
  multivalued = false,
  derived = false,
  fontSize = 9.5,
}) => (
  <g>
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="#ffffff"
      stroke="#475569"
      strokeWidth={1.25}
      strokeDasharray={derived ? '3.5 2.5' : undefined}
    />
    {multivalued && (
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx - 3}
        ry={ry - 2.6}
        fill="none"
        stroke="#475569"
        strokeWidth={1}
      />
    )}
    <text
      x={cx}
      y={cy + 3}
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight={keyAttr || partialKey ? 600 : 500}
      fill="#0f172a"
    >
      {label}
    </text>
    {(keyAttr || partialKey) && (
      <line
        x1={cx - rx * 0.65}
        y1={cy + 5.5}
        x2={cx + rx * 0.65}
        y2={cy + 5.5}
        stroke="#0f172a"
        strokeWidth={1.1}
        strokeDasharray={partialKey ? '3 2' : undefined}
      />
    )}
  </g>
);

/** Double participation line between (x1,y1) and (x2,y2) */
export const DoubleLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
}> = ({ x1, y1, x2, y2, stroke = '#334155' }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * 2.2;
  const oy = (dx / len) * 2.2;
  return (
    <g>
      <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} stroke={stroke} strokeWidth={1.4} />
      <line x1={x1 - ox} y1={y1 - oy} x2={x2 - ox} y2={y2 - oy} stroke={stroke} strokeWidth={1.4} />
    </g>
  );
};
