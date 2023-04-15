import { useState, useEffect, useCallback, useContext } from 'react';
import { getEndpoint } from '../utils/fetchTransform';
import { CacheContext } from '../contexts/CacheContext';

export function useDetailedMovies({title, year, page}){
    const {user, updateUser} = useContext(CacheContext);
    const [isError, setIsError] = useState(false);
    const [movies, setMovies] = useState([]);
    const [moviesDetails, setMoviesDetails] = useState({});
    
    const addDetailsToMovies = useCallback((moviesData, success) => {
          // Queue the requests to fetch the movie data.
          const requests = moviesData.map((movie) => getEndpoint(`/movies/data/${movie.imdbID}`,
            user.bearerToken.token
          ));
  
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
              setMoviesDetails((details) => {
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
        console.log(movies)
        // Show all movies' names before loading the details.
        setMovies(movies.data);
  
        // Fetches the movies in batches. The first batch is larger than the subsequent batches.
        const INITIAL_FETCH_LIMIT = 10;
        const INITIAL_FETCH_DELAY = 1800 * INITIAL_FETCH_LIMIT; // Approximately 1.8 seconds per request.
  
        const SUBSEQUENT_FETCH_LIMIT = 1;
        const SUBSEQUENT_FETCH_DELAY = 1800 * SUBSEQUENT_FETCH_LIMIT; // Approximately 1.8 seconds per request.
        
        
        const requests = [];
        /**
         * Add a request to the requests array, but resolve it after a delay
         * to reduce the number of requests sent at once.
         * @param {*} i The index of the first movie to fetch.
         * @param {*} limit The number of movies to fetch.
         * @param {*} delay The delay in milliseconds before resolving the request.
         */
        const addRequest = (i, limit, delay) => {
          requests.push(new Promise((resolve) => {
            setTimeout(() => {
              addDetailsToMovies(movies.data.slice(i, i + limit));
              resolve();
            }, delay);
          }));
        }
          // Add the initial request.
        addRequest(0, INITIAL_FETCH_LIMIT, 0);
        // Add the subsequent requests.
        for (let i = INITIAL_FETCH_LIMIT; i < movies.data.length; i += SUBSEQUENT_FETCH_LIMIT) {
          addRequest(i, SUBSEQUENT_FETCH_LIMIT, SUBSEQUENT_FETCH_DELAY * (i / SUBSEQUENT_FETCH_LIMIT) + INITIAL_FETCH_DELAY);
        }
        console.log(requests)
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
      getEndpoint('/movies/search', user.bearerToken.token, transformer).then((data) => {
        console.log(movies)
      }).catch((error) => {
        setIsError(true);
      });
    }, []);

    return { isError, movies, details: moviesDetails };
}