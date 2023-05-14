import { useEffect } from "react";
import "./MoviesBanner.css";
import { useNavigate } from "react-router-dom";

/**
 * A banner component that displays a list of movie posters.
 * @param movies The list of movies to display.
 * @param details The movie details object with keys as imdbIDs and values as movie details.
 * @param style Any additional style of the banner.
 * @param className Any additional class name for the banner.
 * @returns The movies banner component.
 * */
export default function MoviesBanner({ movies, details, style, className }) {
  const navigate = useNavigate();
  // Filter for movies whose ID is in details
  movies = movies.filter((movie) => details[movie.imdbID]);

  useEffect(() => {
    // Gradually scroll through the banner to the right
    // unless the user hovered over the banner
    let scrollTimer = setInterval(() => {
      const banner = document.querySelector(".movies-banner-container");
      if (banner && !banner.matches(":hover")) {
        banner.scrollLeft += 1;
      }
    }, 50);

    return () => {
      clearInterval(scrollTimer);
    };
  }, [movies]);

  return (
    <div className={`movies-banner-container ${className}`} style={style}>
      {movies.map((movie, index) => {
        return (
          <div
            className="banner-cell"
            key={index}
            onClick={() => navigate(`/movies/data/${movie.imdbID}`)}
          >
            <img src={details[movie.imdbID].poster} alt={movie.title} />
          </div>
        );
      })}
    </div>
  );
}
