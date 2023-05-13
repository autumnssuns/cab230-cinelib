import { useEffect } from 'react';
import { MovieDetailsLoader} from '../utils/movieDetailsLoader';

export default function useMovieDetails(movies, setMovies, setDetails){
    const detailsLoader = new MovieDetailsLoader(setMovies, setDetails);

    useEffect(() => {
        if (!movies) return;
        if (movies.length === 0) return;
        const abortController = new AbortController();
        const signal = abortController.signal;
    
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