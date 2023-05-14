import { ScoreCircle } from "../ScoreCircle/ScoreCircle";

/**
 * The constant map of rating sources to their max value and unit.
 */
const RATINGS_MAP = {
  "Internet Movie Database": {
    max: 10,
    unit: "",
  },
  "Rotten Tomatoes": {
    max: 100,
    unit: "%",
  },
  "Metacritic": {
    max: 100,
    unit: "%",
  },
};

/**
 * A component that displays a rating in a circle.
 * @param rating The rating object that contains the value and source.
 * @param radius The radius of the circle. Default is 50px.
 * @param animate Whether to animate the circle or not. Default is true.
 * @returns The rating component.
 */
export function Rating({rating, radius = 50, animate = true}) {  
    return (
      <div className="rating-container">
        <ScoreCircle
          score={rating.value}
          max={RATINGS_MAP[rating.source].max}
          unit={RATINGS_MAP[rating.source].unit}
          radius={radius}
          color="#007bff"
          animate={animate}
        />
        <span className="rating-source">
          {rating.source}
        </span>
      </div>
    );
  }