import React from 'react';

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreCircle({ score, size = 120, label }: Props) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}/>
      </svg>
      <div style={{ marginTop: -size/2 - 15, fontSize: size/3.5, fontWeight: 800, color }}>{score}</div>
      <div style={{ marginTop: size/5, fontSize: 13, color: '#6b7280' }}>{label || 'SEO Score'}</div>
    </div>
  );
}
