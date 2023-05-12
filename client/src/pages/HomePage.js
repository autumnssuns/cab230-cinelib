import { useDetailedMovies } from '../hooks/useDetailedMovies';
import { useState, useEffect, useContext } from 'react';
import { getEndpoint } from '../utils/fetchTransform';
import MovieGrid from '../components/MovieGrid/MovieGrid';
import MoviesBanner from '../components/MoviesBanner/MoviesBanner';
import { MovieDetailsLoader } from '../utils/movieDetailsLoader';
import { CacheContext } from '../contexts/CacheContext';
import "./HomePage.css";

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
          <h2 className='year-label'>{year}</h2>
          <MovieGrid key={year} movies={moviesByYear} details={details}/>
        </>
      );
    }

    return (
        <>
          <div className="banner curtain-frame">
            <h2 className="welcome-message overlay-child">Your ultimate movie guide - find all the information about your favorite movies in one place.</h2>
            <MoviesBanner className="overlay-child" movies={movies} details={details} style={{width: "80%"}}/>
            <div className="curtain left overlay-child"></div>
            <div className="curtain right overlay-child"></div>
          </div>
            {moviesGrids}
        </>
    )
}