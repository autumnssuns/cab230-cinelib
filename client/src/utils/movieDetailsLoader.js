const getEndpoint = require("../utils/fetchTransform").getEndpoint;

export class MovieDetailsLoader {
  constructor(setMovies, setMovieDetails) {
    this.setMovies = setMovies;
    this.setMoviesDetails = setMovieDetails;
  }

  /**
   * Fetches the endpoint and updates the movie's data.
   * @param {*} movie The movie to update.
   * @param {*} abortSignal The abort signal to cancel the fetch.
   * @param {*} waitBeforeFetch The number of milliseconds to wait before fetching the data from the API.
   * @returns
   */
  fetchAndUpdate = async (movie, abortSignal, waitBeforeFetch) => {
    return getEndpoint(
      `/movies/data/${movie.imdbID}`,
      null,
      abortSignal,
      waitBeforeFetch
    ).then((data) => {
      movie.data = data;
      this.setMoviesDetails((details) => {
        return {
          ...details,
          [movie.imdbID]: movie.data,
        };
      });
    });
  };

  /**
   * Loads the details of the movies and updates the movies' data in-place.
   * @param {*} movies The movies to transform, should contain a subset of the movies in a state.
   * @param {*} abortSignal The abort signal to cancel the fetch.
   */
  loadDetails = async (movies, setMovies, abortSignal, initialBatchSize = 10) => {
    // Show all movies' names before loading the details.
    
    const DELAY_BEFORE_EACH_FETCH = 1800;

    for (let i = 0; i < movies.length; i++) {
      let delay = i < initialBatchSize ? 0 : DELAY_BEFORE_EACH_FETCH;
      // To avoid overloading, have a long delay after the first 10 fetches.
      if (i == initialBatchSize) {
        delay = (initialBatchSize + 1) * DELAY_BEFORE_EACH_FETCH;
      }
      try {
        await this.fetchAndUpdate(movies[i], abortSignal, delay);
        setMovies(prevMovies => [...prevMovies]);     
      } catch (error) {
        console.log(error);
      }
    }
  };
}
