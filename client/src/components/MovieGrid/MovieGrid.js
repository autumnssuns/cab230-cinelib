import MovieCard from "../MovieCard/MovieCard"
import './MovieGrid.css'

export default function MovieGrid({movies, details, width="192px", height="256px", showTitle=true}){
    return (
        <div className="movie-grid-container">
            {
                movies.map((movie, index) => {
                    return (
                        <MovieCard key={movie.imdbID}
                                movie={movie} 
                                details={details[movie.imdbID]} 
                                width={width}
                                height={height}
                                showTitle={showTitle}
                        />
                    )
                })
            }
        </div>
    )
}