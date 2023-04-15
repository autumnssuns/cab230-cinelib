import MovieCard from "../MovieCard/MovieCard"
import './MovieGrid.css'

export default function MovieGrid({movies, details}){
    console.log(movies)
    console.log(details)
    return (
        <div className="movie-grid-container">
            {
                movies.map((movie, index) => {
                    return <MovieCard key={movie.imdbID}
                                movie={movie} 
                                details={details[movie.imdbID]} 
                                width="150px" 
                                height="200px"/>
                })
            }
        </div>
    )
}