import { ScoreCircle } from "../ScoreCircle/ScoreCircle";

export function Rating({rating, radius = 50, animate = true}) {
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