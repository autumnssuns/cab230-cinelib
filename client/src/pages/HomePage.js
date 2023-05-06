import { useDetailedMovies } from '../hooks/useDetailedMovies';
import { useState, useEffect, useContext } from 'react';
import { getEndpoint } from '../utils/fetchTransform';
import MovieGrid from '../components/MovieGrid/MovieGrid';
import MoviesBanner from '../components/MoviesBanner/MoviesBanner';
import { MovieDetailsLoader } from '../utils/movieDetailsLoader';
import { CacheContext } from '../contexts/CacheContext';

const START_YEAR = 2023;
const END_YEAR = 2020;
const SIZE = 20;

function getMoviesByYear(movies, year) {
    return movies.filter((movie) => movie.year === year);
}

export default function HomePage(){
    const [movies, setMovies] = useState([]);
    const [details, setDetails] = useState({});
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const {user} = useContext(CacheContext);
    const detailsLoader = new MovieDetailsLoader(setMovies, setDetails, user);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        
        async function fetchMovies() {
          // Search for movies from 2023 to 2020
          const requests = [];
          for (let year = START_YEAR; year >= END_YEAR; year--) {
            const request = getEndpoint(
              `/movies/search?year=${year}&page=1`,
              user.bearerToken.token,
              signal
            );
            requests.push(request);
          }

          try {
            const responses = await Promise.all(requests);
            const movies = responses.map((response) => response.data.slice(0, SIZE)).flat();
            setMovies(movies);
            setIsLoading(false);
            
            await detailsLoader.loadDetails(movies, setMovies, signal);
            console.log("Movies search:", movies);
          }
          catch (error) {
            setIsError(true);
            setIsLoading(false);
            console.log(error);
          }

        };

        fetchMovies();
    
        return () => {
          abortController.abort();
          console.log("Aborted");
        };
    }, []);

    if (isLoading) {
        return <div>Loading...</div>
    }
    
    if (isError) {
        return <div>Something went wrong...</div>
    }

    const moviesGrids = [];
    for (let year = START_YEAR; year >= END_YEAR; year--) {
      const moviesByYear = getMoviesByYear(movies, year);
      moviesGrids.push(
        <>
          <h2>{year}</h2>
          <MovieGrid key={year} movies={moviesByYear} details={details}/>
        </>
      );
    }

    return (
        <>
            <MoviesBanner movies={movies} details={details}/>
            
            {/* <MovieGrid movies={movies} details={details}/> */}
            {moviesGrids}
        </>
    )
}