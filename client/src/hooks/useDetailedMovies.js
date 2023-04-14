import { useState, useEffect, useCallback } from 'react';
import { fetchTransform } from '../utils/fetchTransform';

export function useDetailedMovies({title, year, page}){
    const [isError, setIsError] = useState(false);
    const [movies, setMovies] = useState([]);
    const [details, setDetails] = useState({});
  
    const addDetailsToMovies = useCallback((moviesData, success) => {
          // Queue the requests to fetch the movie data.
          const requests = moviesData.map((movie) => fetchTransform(`/movies/data/${movie.imdbID}`));
  
          // Recursively fetch the movie data.
          const resolvedDetails = [];
          const fetchRecur = (requests) => {
            if (requests.length === 0) {
              return Promise.resolve(resolvedDetails);
            }
            // Push the data to the details array and fetch the rest of the requests recursively.
            // If get an error, wait 60 seconds and try again.
            return requests[0].then((data) => {
              resolvedDetails.push(data);
              return new Promise((resolve) => {
                resolve(fetchRecur(requests.slice(1)));
              }).catch((error) => {
                return new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(fetchRecur(requests));
                  }, 60000);
                });
              });
            });
          };
      
          // Fetch the movie data and add it to the movie object.
          fetchRecur(requests).then((data) => {
            moviesData.forEach((movie, index) => {
              movie.data = data[index];
              setDetails((details) => {
                return {
                  ...details,
                  [movie.imdbID]: movie.data,
                };
              });
            });
          });
    }, []);
  
    /**
     * Transforms by adding the movies' data to each movie object.
     * @param {*} movies The movies to transform. 
     * @returns The transformed movies with added data.
     */
    const transformer = useCallback((movies) => {
        // Show all movies' names before loading the details.
        setMovies(movies.data);
  
        const INITIAL_FETCH_LIMIT = 10;
        const INITIAL_FETCH_DELAY = 1800 * INITIAL_FETCH_LIMIT; // Approximately 1.8 seconds per request.
  
        const SUBSEQUENT_FETCH_LIMIT = 1;
        const SUBSEQUENT_FETCH_DELAY = 1800 * SUBSEQUENT_FETCH_LIMIT; // Approximately 1.8 seconds per request.
  
        const addRequest = (i, limit, delay) => {
          requests.push(addDetailsToMovies(movies.data.slice(i, i + limit)));
        }
  
        // Fetches the movies in batches. The first batch is larger than the subsequent batches.
        const requests = [];
        // Add the initial request.
        addRequest(0, INITIAL_FETCH_LIMIT, INITIAL_FETCH_DELAY);
        // Add the subsequent requests.
        for (let i = INITIAL_FETCH_LIMIT; i < movies.data.length; i += SUBSEQUENT_FETCH_LIMIT) {
          addRequest(i, SUBSEQUENT_FETCH_LIMIT, SUBSEQUENT_FETCH_DELAY);
        }
  
        // Resolve each request in order.
        requests.reduce((promiseChain, currentTask) => {
          return promiseChain.then(chainResults =>
            currentTask.then(currentResult =>
              [...chainResults, currentResult]
            )
          );
        }, Promise.resolve([]))
        return movies;
    }, []);
  
    useEffect(() => {
      fetchTransform('/movies/search', transformer).then((data) => {
        console.log(movies)
      }).catch((error) => {
        setIsError(true);
      });
    }, []);

    return { isError, movies, details };
}