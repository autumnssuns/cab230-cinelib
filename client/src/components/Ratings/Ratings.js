import { Rating } from "../Rating/Rating";
import "./Ratings.css";

export function Ratings({ ratings, radius = 50, animate = true }) {
  return (
    <div className="ratings-container">
        {ratings
            .filter((rating) => {
            return typeof rating.value === "number";
            })
            .map((rating) => {
            return <Rating rating={rating} radius={radius} key={rating.source} animate={animate}></Rating>;
            })}
    </div>
  );
}
