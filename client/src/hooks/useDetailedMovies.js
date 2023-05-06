import { useState, useEffect, useCallback, useContext } from "react";
import { getEndpoint } from "../utils/fetchTransform";
import { CacheContext } from "../contexts/CacheContext";

export function useDetailedMovies({ title, year, page }) {
  const { user, updateUser } = useContext(CacheContext);
  const [isError, setIsError] = useState(false);
  const [movies, setMovies] = useState([]);
  const [moviesDetails, setMoviesDetails] = useState({});

    /**
     * Fetches the endpoint and updates the movie's data.
     * @param {*} movie The movie to update.
     * @param {*} abortSignal The abort signal to cancel the fetch.
     * @param {*} waitBeforeFetch The number of milliseconds to wait before fetching the data from the API.
     * @returns 
     */
    const fetchAndUpdate = useCallback(async (movie, abortSignal, waitBeforeFetch) => {
      return getEndpoint(
        `/movies/data/${movie.imdbID}`,
        user.bearerToken.token,
        abortSignal,
        waitBeforeFetch
      ).then((data) => {
        movie.data = data;
        setMoviesDetails((details) => {
          console.log("Details:", details);
          return {
            ...details,
            [movie.imdbID]: movie.data,
          };
        });
      });
    }, []);

  /**
   * Loads the details of the movies.
   * @param {*} movies The movies to transform.
   * @param {*} abortSignal The abort signal to cancel the fetch.
   */
  const loadDetails = useCallback(async (movies, abortSignal) => {
    // Show all movies' names before loading the details.

    const INITIAL_FETCH_LIMIT = 10;
    const DELAY_BEFORE_EACH_FETCH = 1800;

    for (let i = 0; i < movies.length; i++) {
      let delay = i < INITIAL_FETCH_LIMIT ? 0 : DELAY_BEFORE_EACH_FETCH;
      // To avoid overloading, have a long delay after the first 10 fetches.
      if (i == INITIAL_FETCH_LIMIT) {
        delay = INITIAL_FETCH_LIMIT * DELAY_BEFORE_EACH_FETCH;
      }
      await fetchAndUpdate(movies[i], abortSignal, delay);
      setMovies((movies) => [...movies]);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    async function fetchMovies() {
  
      try {
        const moviesSearch = await getEndpoint(
          "/movies/search",
          user.bearerToken.token,
          signal
        );
    
        setMovies(moviesSearch.data);
        await loadDetails(moviesSearch.data, signal);
    
        console.log("Movies search:", moviesSearch);
      } catch (error) {
        console.log(error);
        setIsError(true);
      }
    };
    fetchMovies();

    return () => {
      abortController.abort();
      console.log("Aborted");
    };
  }, []);

  return { isError, movies, details: moviesDetails };
}
