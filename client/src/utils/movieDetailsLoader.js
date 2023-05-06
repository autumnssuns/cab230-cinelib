const getEndpoint = require("../utils/fetchTransform").getEndpoint;

export class MovieDetailsLoader {
  constructor(setMovies, setMovieDetails, user) {
    this.setMovies = setMovies;
    this.setMoviesDetails = setMovieDetails;
    this.user = user;
  }

  /**
   * Fetches the endpoint and updates the movie's data.
   * @param {*} movie The movie to update.
   * @param {*} abortSignal The abort signal to cancel the fetch.
   * @param {*} waitBeforeFetch The number of milliseconds to wait before fetching the data from the API.
   * @returns
   */
  fetchAndUpdate = async (movie, abortSignal, waitBeforeFetch) => {
    console.log("Fetching:");
    return getEndpoint(
      `/movies/data/${movie.imdbID}`,
      this.user.bearerToken.token,
      abortSignal,
      waitBeforeFetch
    ).then((data) => {
      movie.data = data;
      this.setMoviesDetails((details) => {
        console.log("Details:", details);
        return {
          ...details,
          [movie.imdbID]: movie.data,
        };
      });
    });
  };

  /**
   * Loads the details of the movies.
   * @param {*} movies The movies to transform.
   * @param {*} abortSignal The abort signal to cancel the fetch.
   */
  loadDetails = async (movies, setMovies, abortSignal) => {
    // Show all movies' names before loading the details.
    console.log("Loading details for:", movies);

    const INITIAL_FETCH_LIMIT = 10;
    const DELAY_BEFORE_EACH_FETCH = 1800;

    for (let i = 0; i < movies.length; i++) {
      console.log("Loading details for:", movies[i].Title);
      let delay = i < INITIAL_FETCH_LIMIT ? 0 : DELAY_BEFORE_EACH_FETCH;
      // To avoid overloading, have a long delay after the first 10 fetches.
      if (i == INITIAL_FETCH_LIMIT) {
        delay = INITIAL_FETCH_LIMIT * DELAY_BEFORE_EACH_FETCH;
      }
      try {
        await this.fetchAndUpdate(movies[i], abortSignal, delay);
        setMovies((movies) => [...movies]);        
      } catch (error) {
        console.log(error);
      }
    }
  };
}
