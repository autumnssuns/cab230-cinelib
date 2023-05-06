import { useDetailedMovies } from '../hooks/useDetailedMovies';
import { useState, useEffect, useContext } from 'react';
import { getEndpoint } from '../utils/fetchTransform';
import MovieGrid from '../components/MovieGrid/MovieGrid';
import MoviesBanner from '../components/MoviesBanner/MoviesBanner';
import { MovieDetailsLoader } from '../utils/movieDetailsLoader';
import { CacheContext } from '../contexts/CacheContext';

export default function HomePage(){
    // const { isError, movies, details } = useDetailedMovies(
    //     {
    //         title: 'batman',
    //         year: 2019,
    //         page: 1,
    //     }
    // );
    
    
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
          const moviesSearch = await getEndpoint(
            "/movies/search",
            user.bearerToken.token,
            signal
          );
      
          if (moviesSearch.error) {
            setIsError(true);
            return;
          }
          setMovies(moviesSearch.data);
          await detailsLoader.loadDetails(moviesSearch.data, setMovies, signal);
      
          console.log("Movies search:", moviesSearch);
        };

        fetchMovies();
    
        return () => {
          abortController.abort();
          console.log("Aborted");
        };
    }, []);

    if (isError) {
        return <div>Something went wrong...</div>
    }

    return (
        <>
            <MoviesBanner movies={movies} details={details}/>
            <MovieGrid movies={movies} details={details}/>
        </>
    )
}