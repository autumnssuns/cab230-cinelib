import { useEffect } from "react";
import { MovieDetailsLoader } from "../utils/movieDetailsLoader";

/**
 * Custom hook to load movie details in-place. This is used to load movie details
 * gradually by adding details to each movie in the movies array in-place.
 * @param {*} movies The movies array. Must contain an imdbID and title.
 * @param {*} setMovies The movies array setter.
 * @param {*} setDetails The movie details setter.
 */
export default function useMovieDetails(movies, setMovies, setDetails) {
  // The movie details loader handles the actual loading.
  const detailsLoader = new MovieDetailsLoader(setMovies, setDetails);

  // Recursively load the movie details by updating its own dependencies.
  useEffect(() => {
    if (!movies) return;
    // Base case: no movies to load.
    if (movies.length === 0) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    // Recursive case: Find and load the first movie that does not have details.
    detailsLoader.loadDetails(
      [movies.filter((movie) => !movie.data)[0]],
      setMovies,
      signal,
      0
    );

    return () => {
      abortController.abort();
    };
  }, [movies]);
}
