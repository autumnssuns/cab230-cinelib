import MovieCard from "../MovieCard/MovieCard"
import './MovieGrid.css'

export default function MovieGrid({movies, details}){
    return (
        <div className="movie-grid-container">
            {
                movies.map((movie, index) => {
                    return <MovieCard movie={movie} details={details[index]} width="150px" height="200px"/>
                })
            }
        </div>
    )
}