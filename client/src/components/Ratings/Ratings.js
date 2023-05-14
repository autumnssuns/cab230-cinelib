import { Rating } from "../Rating/Rating";
import "./Ratings.css";

/**
 * A component that houses multiple ratings.
 * @param ratings The ratings array.
 * @param radius The radius of the circle. Default is 50px.
 * @param animate Whether to animate the circle or not. Default is true.
 * @returns The ratings component.
 */
export function Ratings({ ratings, radius = 50, animate = true }) {
  return (
    <div className="ratings-container">
      {ratings
        .filter((rating) => {
          return typeof rating.value === "number";
        })
        .map((rating) => {
          return (
            <Rating
              rating={rating}
              radius={radius}
              key={rating.source}
              animate={animate}
            ></Rating>
          );
        })}
    </div>
  );
}
