import { useState, useEffect, useContext } from 'react';
import { getEndpoint } from '../../utils/fetcher';
import MovieGrid from '../../components/MovieGrid/MovieGrid';
import MoviesBanner from '../../components/MoviesBanner/MoviesBanner';
import { MovieDetailsLoader } from '../../utils/movieDetailsLoader';
import { Separator } from '../../components/Separator/Separator';
import "./HomePage.css";

const START_YEAR = 2023;
const END_YEAR = 2020;
const SIZE = 20;

/**
 * Gets the movies from the specified year.
 * @param {*} movies The movies array.
 * @param {*} year The year to get movies from.
 * @returns The movies from the specified year.
 */
function getMoviesByYear(movies, year) {
    return movies.filter((movie) => movie.year === year);
}

/**
 * The home page component.
 * @returns The home page component.
 */
export default function HomePage(){
    const [movies, setMovies] = useState([]);
    const [details, setDetails] = useState({});
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const detailsLoader = new MovieDetailsLoader(setMovies, setDetails);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        
        async function fetchMovies() {
          // Search for movies from 2023 to 2020
          const requests = [];
          for (let year = START_YEAR; year >= END_YEAR; year--) {
            const request = getEndpoint(
              `/movies/search?year=${year}&page=1`,
              null,
              signal
            );
            requests.push(request);
          }

          // Fetch all movies in parallel and load their details.
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

    // Create a grid for each year.
    const moviesGrids = [];
    for (let year = START_YEAR; year >= END_YEAR; year--) {
      const moviesByYear = getMoviesByYear(movies, year);
      moviesGrids.push(
        <div className='movie-year-grid'>
          <h2 className='year-label'>{year}</h2>
          <MovieGrid key={year} movies={moviesByYear} details={details}/>
        </div>
      );
    }

    return (
        <>
          <div className="banner curtain-frame">
            <div className="welcome-message overlay-child">
              <h1 className="title">Welcome to Cine<b className="title-emphasised">Lib</b></h1>
              <Separator direction='horizontal' width='100%' color='red'/>
              <h3 className="message">Your ultimate movie library - find all the information about your favorite movies in one place.</h3>
            </div>
            <MoviesBanner className="overlay-child" movies={movies} details={details} style={{width: "80%"}}/>
            <div className="curtain left overlay-child"></div>
            <div className="curtain right overlay-child"></div>
          </div>
            {moviesGrids}
        </>
    )
}