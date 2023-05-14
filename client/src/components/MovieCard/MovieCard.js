import "./MovieCard.css";
import CardSpinner from "../CardSpinner/CardSpinner";
import { useNavigate } from "react-router-dom";

/**
 * A card component that displays a movie poster and title.
 * @param movie The movie object, must contain an imdbID and title.
 * @param details The movie details object that contains the poster.
 * @param width The width of the card. Default is 200px.
 * @param height The height of the card. Default is 300px.
 * @param showTitle Whether to show the title or not. Default is true.
 * @returns The movie card component.
 */
export default function MovieCard({
  movie,
  details,
  width = "200px",
  height = "300px",
  showTitle = true,
}) {
  const navigate = useNavigate();

  return (
    <div
      className="movie-card"
      style={{
        "--width": width,
        "--height": height,
      }}
      onClick={() => navigate(`/movies/data/${movie.imdbID}`)}
    >
      {
        <div className="movie-poster-container">
          {details ? (
            <img className="movie-poster" src={details.poster} />
          ) : (
            <CardSpinner size={"100px"} />
          )}
        </div>
      }
      {showTitle && <div className="movie-title">{movie.title}</div>}
    </div>
  );
}
