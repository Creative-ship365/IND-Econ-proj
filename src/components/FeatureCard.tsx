import React from 'react';
import type { Feature } from '../data/model';
import { PALETTE } from '../data/model';

interface FeatureCardProps {
  f: Feature;
  index: number;
  visible: boolean;
}

const TAG_COLORS: Record<string, string> = {
  'Visual Identity': PALETTE.teal,
  Animation: PALETTE.purple,
  'Data Integrity': PALETTE.teal,
  'Statistical Rigor': PALETTE.coral,
  Interactivity: PALETTE.gold,
  'Data Structure': PALETTE.blue,
  Demographics: PALETTE.purple,
  Context: PALETTE.blue,
  Transparency: PALETTE.coral,
  Methodology: PALETTE.gold,
  Storytelling: PALETTE.purple,
  Utility: PALETTE.blue,
};

const FeatureCard: React.FC<FeatureCardProps> = ({ f, index, visible }) => {
  const tagColor = TAG_COLORS[f.tag] || PALETTE.teal;

  return (
    <div
      className="feature-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(14px)',
        transitionDelay: `${index * 0.04}s`,
      }}
    >
      <div
        className="feature-accent"
        style={{
          background: `linear-gradient(90deg, ${tagColor}60, transparent)`,
        }}
      />
      <div className="feature-body">
        <div
          className="feature-icon-wrap"
          style={{
            background: `${tagColor}16`,
            border: `1px solid ${tagColor}30`,
            color: tagColor,
          }}
        >
          {f.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="feature-header">
            <span className="feature-title">{f.title}</span>
            <span
              className="feature-tag"
              style={{
                background: `${tagColor}16`,
                color: tagColor,
                border: `1px solid ${tagColor}28`,
              }}
            >
              {f.tag}
            </span>
          </div>
          <p className="feature-desc">{f.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
