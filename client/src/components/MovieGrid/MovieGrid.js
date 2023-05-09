import MovieCard from "../MovieCard/MovieCard"
import './MovieGrid.css'
import { AnimationOnScroll } from 'react-animation-on-scroll';

export default function MovieGrid({movies, details}){
    return (
        <div className="movie-grid-container">
            {
                movies.map((movie, index) => {
                    return (
                        <MovieCard key={movie.imdbID}
                                movie={movie} 
                                details={details[movie.imdbID]} 
                                width="225px" 
                                height="300px"/>
                    )
                })
            }
        </div>
    )
}