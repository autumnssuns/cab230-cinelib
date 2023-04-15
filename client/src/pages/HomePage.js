import { useState, useEffect, useCallback } from 'react';
import { getEndpoint } from '../utils/fetchTransform';
import { useDetailedMovies } from '../hooks/useDetailedMovies';
import MovieCard from '../components/MovieCard/MovieCard';
import MovieGrid from '../components/MovieGrid/MovieGrid';
import MoviesBanner from '../components/MoviesBanner/MoviesBanner';

export default function HomePage(){
    const { isError, movies, details } = useDetailedMovies(
        {
            title: 'batman',
            year: 2019,
            page: 1,
        }
    );
    
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