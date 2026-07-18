import React from 'react';

interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, maxScore = 100, size = 160, strokeWidth = 12, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / maxScore, 1);
  const offset = circumference * (1 - pct);

  const getColor = (p: number) => p >= 0.8 ? 'text-success' : p >= 0.6 ? 'text-warning' : 'text-error';
  const getGrade = (p: number) => p >= 0.9 ? 'A+' : p >= 0.8 ? 'A' : p >= 0.7 ? 'B' : p >= 0.6 ? 'C' : p >= 0.5 ? 'D' : 'F';
  const colorClass = getColor(pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" className="stroke-base-300" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" className={`${colorClass} transition-all duration-1000 ease-out`}
            stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colorClass}`}>{score}</span>
          <span className="text-xs text-base-content/60">/ {maxScore}</span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <div className="text-sm font-medium text-base-content">{label}</div>
          <div className={`text-xs font-bold ${colorClass}`}>Grade: {getGrade(pct)}</div>
        </div>
      )}
    </div>
  );
};
