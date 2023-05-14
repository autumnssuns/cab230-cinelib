import MovieCard from "../MovieCard/MovieCard";
import "./MovieGrid.css";

/**
 * Displays a grid of movie cards.
 * @param movies The movies to display.
 * @param details The movie details object with keys as imdbIDs and values as movie details.
 * @param width The width of each card. Default is 192px.
 * @param height The height of each card. Default is 256px.
 * @param showTitle Whether to show the title or not. Default is true.
 * @returns The movie grid component.
 */
export default function MovieGrid({
  movies,
  details,
  width = "192px",
  height = "256px",
  showTitle = true,
}) {
  return (
    <div className="movie-grid-container">
      {movies.map((movie, index) => {
        return (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            details={details[movie.imdbID]}
            width={width}
            height={height}
            showTitle={showTitle}
          />
        );
      })}
    </div>
  );
}
