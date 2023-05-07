import { useEffect } from 'react';
import './MoviesBanner.css'
import { useNavigate } from 'react-router-dom'

export default function MoviesBanner({movies, details, style}){
    const navigate = useNavigate();
    // Filter for movies whose ID is in details
    movies = movies.filter(movie => details[movie.imdbID])
    
    useEffect(() => {
        // Gradually scroll through the banner
        // unless the user hovered over the banner
        let scrollTimer = setInterval(() => {
            const banner = document.querySelector(".movies-banner-container");
            if (banner && !banner.matches(":hover")) {
                banner.scrollLeft += 1;
            }
        }, 50);

        return () => {
            clearInterval(scrollTimer);
        }
    }, [movies])

    return (
        <div className="movies-banner-container" style={style}>
            {
                movies.map((movie, index) => {
                    return <div className="banner-cell"
                        key={index}
                        onClick={() => navigate(`/movies/data/${movie.imdbID}`)}
                    >
                        <img src={details[movie.imdbID].poster}/>
                    </div>
                })
            }
        </div>
    )
}