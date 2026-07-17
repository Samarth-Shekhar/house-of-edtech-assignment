"use client";

import { getScoreGradient } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreRing({ score, size = 100, strokeWidth = 8, label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const [colorStart, colorEnd] = getScoreGradient(score);
  const gradientId = `score-gradient-${score}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorStart} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth={strokeWidth}
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-ring-circle"
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono font-bold"
            style={{ fontSize: size * 0.24, color: colorEnd }}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-[var(--color-text-muted)] font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
