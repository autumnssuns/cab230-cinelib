import { useState, useEffect } from "react";
import "./ScoreCircle.css";

/**
 * A component that displays a score in a circle. Used in the rating component.
 * @param score The score.
 * @param max The maximum score.
 * @param unit The unit of the score.
 * @param radius The radius of the circle. 
 * @param color The color of the circle.
 * @param style The style of the circle.
 * @param animate Whether to animate the circle or not. Default is true.
 * @returns The score circle component.
 */
export function ScoreCircle({ score, max, unit, radius, color, style, animate = true }) {
  const strokeSize = radius / 5;
  const innerRadius = radius - strokeSize;
  const dashArray = Math.PI * innerRadius * 2;
  const targetDashOffset = dashArray * (1 - score / max);

  const [dashOffset, setDashOffset] = useState(dashArray);

  // Animate the circle.
  useEffect(() => {
    if (!animate) {
      setDashOffset(targetDashOffset);
      return;
    }
    const interval = setInterval(() => {
      setDashOffset((dashOffset) => {
        const step = (targetDashOffset - dashOffset) / 10;
        return dashOffset + step;
      });
    }, 10);
    return () => clearInterval(interval);
  }, []);

  // Use svg to draw the circle. Based on https://www.youtube.com/watch?v=H1W_SeoouAI&t=608s
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
