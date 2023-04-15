import './MovieCard.css'
import CardSpinner from '../CardSpinner/CardSpinner'
import { useNavigate } from 'react-router-dom'

export default function MovieCard({ movie, details, width = "200px", height = "300px" }) {
    const navigate = useNavigate();
    
    return (
        <div 
            className="movie-card" 
            style={
            {
                "--width": width,
                "--height": height
            }}
            onClick={() => navigate(`/movies/data/${movie.imdbID}`)}
        >
            {
                <div className="movie-poster-container">
                    {
                        details ? <img className='movie-poster' src={details.poster} />
                        : <CardSpinner size={"100px"} />
                    }
                </div>
            }
            <div className='movie-title'>
                {movie.title}
            </div>
        </div>
    )
}