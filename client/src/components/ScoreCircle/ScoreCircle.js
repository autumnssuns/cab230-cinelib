import { useState, useEffect } from "react";
import "./ScoreCircle.css";

export function ScoreCircle({ score, max, unit, radius, color, style }) {
  const strokeSize = radius / 5;
  const innerRadius = radius - strokeSize;
  const dashArray = Math.PI * innerRadius * 2;
  const targetDashOffset = dashArray * (1 - score / max);

  // const dashOffset = dashArray * (1 - score/max);
  const [dashOffset, setDashOffset] = useState(dashArray);

  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset((dashOffset) => {
        const step = (targetDashOffset - dashOffset) / 10;
        return dashOffset + step;
      });
    }, 10);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="score-circle-container" style={style}>
      <svg
        className="score-circle"
        viewBox={`${-strokeSize} ${-strokeSize} ${radius * 2} ${radius * 2}`}
        width={radius * 2}
        height={radius * 2}
      >
        <circle
          className="score-circle-background"
          cx={innerRadius}
          cy={innerRadius}
          r={innerRadius}
          strokeWidth={strokeSize}
        />
        <circle
          className="score-circle-foreground"
          cx={innerRadius}
          cy={innerRadius}
          r={innerRadius}
          strokeWidth={strokeSize}
          color={color}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
          }}
          transform={`rotate(-90 ${innerRadius} ${innerRadius})`}
        />
        <text
          className="score-circle-label"
          x={innerRadius}
          y={innerRadius + strokeSize / 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={innerRadius * 0.75}
        >
          {score}
          {unit}
        </text>
      </svg>
    </div>
  );
}
