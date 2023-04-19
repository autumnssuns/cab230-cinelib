import React from 'react';
import { createBoard } from '@wixc3/react-board';
import MovieCard from '../../../components/MovieCard/MovieCard';

export default createBoard({
    name: 'MovieCard',
    Board: () => <MovieCard />
});
