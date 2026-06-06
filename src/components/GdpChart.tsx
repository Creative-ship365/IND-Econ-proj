import React, { useRef, useState } from 'react';
import type { GdpRow, Milestone } from '../data/model';
import { PALETTE } from '../data/model';
import { type StateId, generateStateSpecificMilestones } from '../data/stateModel';

interface GdpChartProps {
  data: GdpRow[];
  showNominal: boolean;
  scrubYear: number;
  setScrubYear: (year: number) => void;
  activeState: StateId;
}

const PHASES = [
  { s: 2022, e: 2027, label: 'Actual', c: 'rgba(0,212,170,0.05)' },
  { s: 2028, e: 2035, label: 'Acceleration', c: 'rgba(74,158,255,0.04)' },
  { s: 2036, e: 2045, label: 'Maturation', c: 'rgba(167,139,250,0.04)' },
  { s: 2046, e: 2060, label: 'Normalization', c: 'rgba(255,181,71,0.04)' },
  { s: 2061, e: 2075, label: 'Steady State', c: 'rgba(255,107,107,0.04)' },
];

const GdpChart: React.FC<GdpChartProps> = ({
  data,
  showNominal,
  scrubYear,
  setScrubYear,
  activeState,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const W = 700,
    H = 310,
    PL = 60,
    PR = 20,
    PT = 24,
    PB = 44;
  const cW = W - PL - PR,
    cH = H - PT - PB;

  const allV = data.flatMap((d) =>
    [d.realGDP, showNominal ? d.nominalGDP : null].filter(Boolean)
  ) as number[];
  const maxY = Math.max(...allV) * 1.07;

  const xs = (yr: number) =>
    ((yr - data[0].year) / (data[data.length - 1].year - data[0].year)) * cW;
  const ys = (v: number) => cH - (v / maxY) * cH;

  const realPts = data.map((d) => `${xs(d.year)},${ys(d.realGDP)}`).join(' ');
  const nomPts = data.map((d) => `${xs(d.year)},${ys(d.nominalGDP)}`).join(' ');
  const rArea = `M ${xs(data[0].year)},${cH} L ${data
    .map((d) => `${xs(d.year)},${ys(d.realGDP)}`)
    .join(' L ')} L ${xs(data[data.length - 1].year)},${cH} Z`;
  const nArea = `M ${xs(data[0].year)},${cH} L ${data
    .map((d) => `${xs(d.year)},${ys(d.nominalGDP)}`)
    .join(' L ')} L ${xs(data[data.length - 1].year)},${cH} Z`;

  const sd = data.find((d) => d.year === scrubYear) || data[0];
  const sx = xs(scrubYear);
  
  let yTicks: number[] = [];
  if (maxY <= 2) yTicks = [0, 0.5, 1, 1.5, 2];
  else if (maxY <= 5) yTicks = [0, 1, 2, 3, 4, 5];
  else if (maxY <= 10) yTicks = [0, 2, 4, 6, 8, 10];
  else if (maxY <= 20) yTicks = [0, 5, 10, 15, 20];
  else yTicks = [0, 10, 20, 30, 40, 50, 60].filter((v) => v <= maxY);
  
  const milestones = generateStateSpecificMilestones(data, activeState);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const mx = ((e.clientX - r.left) / r.width) * W - PL;
    const ratio = Math.max(0, Math.min(1, mx / cW));
    const yr = Math.round(
      data[0].year + ratio * (data[data.length - 1].year - data[0].year)
    );
    setScrubYear(
      Math.max(data[0].year, Math.min(data[data.length - 1].year, yr))
    );
  };

  const hudX = Math.min(sx + 12, cW - 155);
  const hudY = Math.max(ys(sd.realGDP) - 68, 4);

  const hudLines = [
    {
      text: sd.year.toString(),
      color: sd.isActual ? PALETTE.teal : PALETTE.blue,
      bold: true,
    },
    { text: `Real: $${sd.realGDP.toFixed(2)}T`, color: PALETTE.teal, bold: false },
    { text: `Nominal: $${sd.nominalGDP.toFixed(2)}T`, color: PALETTE.gold, bold: false },
    { text: `Growth: ${sd.yoyGrowth}% real`, color: 'rgba(255,255,255,0.6)', bold: false },
    {
      text: `Per capita: $${sd.perCapita.toLocaleString()}`,
      color: 'rgba(255,255,255,0.5)',
      bold: false,
    },
  ];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ cursor: 'crosshair', userSelect: 'none', display: 'block' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE.teal} stopOpacity="0.22" />
          <stop offset="100%" stopColor={PALETTE.teal} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="ng2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE.gold} stopOpacity="0.16" />
          <stop offset="100%" stopColor={PALETTE.gold} stopOpacity="0.01" />
        </linearGradient>
        <clipPath id="cc2">
          <rect x="0" y="0" width={cW} height={cH} />
        </clipPath>
      </defs>

      <g transform={`translate(${PL},${PT})`}>
        {/* Phase backgrounds */}
        {PHASES.map((ph) => (
          <rect
            key={ph.s}
            x={xs(ph.s)}
            y={0}
            width={
              xs(Math.min(ph.e, data[data.length - 1].year)) - xs(ph.s)
            }
            height={cH}
            fill={ph.c}
          />
        ))}

        {/* Phase labels */}
        {PHASES.map((ph) => (
          <text
            key={`t${ph.s}`}
            x={xs(ph.s) + 6}
            y={14}
            fill="rgba(255,255,255,0.2)"
            fontSize="7.5"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="0.8"
          >
            {ph.label.toUpperCase()}
          </text>
        ))}

        {/* Actual/projected divider */}
        <line
          x1={xs(2026)}
          y1={0}
          x2={xs(2026)}
          y2={cH}
          stroke="rgba(0,212,170,0.4)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <text
          x={xs(2026) - 4}
          y={cH - 5}
          textAnchor="end"
          fill="rgba(0,212,170,0.5)"
          fontSize="7.5"
          fontFamily="'JetBrains Mono', monospace"
        >
          ACTUAL◄
        </text>
        <text
          x={xs(2026) + 4}
          y={cH - 5}
          fill="rgba(255,255,255,0.3)"
          fontSize="7.5"
          fontFamily="'JetBrains Mono', monospace"
        >
          ►PROJECTED
        </text>

        {/* Y-axis ticks */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={0}
              y1={ys(v)}
              x2={cW}
              y2={ys(v)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <text
              x={-8}
              y={ys(v) + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.28)"
              fontSize="9"
              fontFamily="'JetBrains Mono', monospace"
            >
              ${v}T
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {[2022, 2026, 2030, 2040, 2050, 2060, 2075].map((yr) => (
          <text
            key={yr}
            x={xs(yr)}
            y={cH + 24}
            textAnchor="middle"
            fill={
              yr === 2026
                ? 'rgba(0,212,170,0.6)'
                : 'rgba(255,255,255,0.26)'
            }
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
          >
            {yr}
          </text>
        ))}

        {/* Clipped chart area */}
        <g clipPath="url(#cc2)">
          {/* Real GDP */}
          <path d={rArea} fill="url(#rg2)" />
          <polyline
            points={realPts}
            fill="none"
            stroke={PALETTE.teal}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />

          {/* Nominal GDP */}
          {showNominal && (
            <>
              <path d={nArea} fill="url(#ng2)" />
              <polyline
                points={nomPts}
                fill="none"
                stroke={PALETTE.gold}
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeDasharray="5 3"
              />
            </>
          )}

          {/* Milestone markers */}
          {milestones.map((m: Milestone) => {
            if (
              m.year < data[0].year ||
              m.year > data[data.length - 1].year
            )
              return null;
            const x = xs(m.year);
            const d = data.find((dd) => dd.year === m.year);
            if (!d) return null;
            return (
              <g key={m.year}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={cH}
                  stroke="rgba(255,181,71,0.2)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={x}
                  cy={ys(d.realGDP)}
                  r="3.5"
                  fill={PALETTE.gold}
                />
              </g>
            );
          })}

          {/* Scrub line and HUD */}
          {isHovered && (
            <>
              <line
                x1={sx}
                y1={0}
                x2={sx}
                y2={cH}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
              />
              <circle
                cx={sx}
                cy={ys(sd.realGDP)}
                r="5"
                fill={PALETTE.teal}
                stroke="#0A0C10"
                strokeWidth="2"
              />
              {showNominal && (
                <circle
                  cx={sx}
                  cy={ys(sd.nominalGDP)}
                  r="4"
                  fill={PALETTE.gold}
                  stroke="#0A0C10"
                  strokeWidth="2"
                />
              )}

              {/* HUD tooltip */}
              <rect
                x={hudX}
                y={hudY}
                width={148}
                height={76}
                rx="6"
                fill="rgba(8,10,18,0.94)"
                stroke={
                  sd.isActual
                    ? 'rgba(0,212,170,0.4)'
                    : 'rgba(74,158,255,0.3)'
                }
                strokeWidth="0.6"
              />
              {sd.isActual && (
                <text
                  x={hudX + 9}
                  y={hudY + 12}
                  fill={PALETTE.teal}
                  fontSize="7"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  ● IMF/WORLD BANK DATA
                </text>
              )}
              {hudLines.map((l, i) => (
                <text
                  key={i}
                  x={hudX + 9}
                  y={hudY + (sd.isActual ? 24 : 16) + i * 12}
                  fill={l.color}
                  fontSize={l.bold ? '11.5' : '9.5'}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={l.bold ? '700' : '400'}
                >
                  {l.text}
                </text>
              ))}
            </>
          )}
        </g>
      </g>
    </svg>
  );
};

export default GdpChart;
