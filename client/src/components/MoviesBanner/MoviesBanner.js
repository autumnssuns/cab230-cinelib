import './MoviesBanner.css'

export default function MoviesBanner({movies, details}){
    // Filter for movies whose ID is in details
    movies = movies.filter(movie => details[movie.imdbID])

    return (
        <div className="movies-banner-container">
            {
                movies.map((movie, index) => {
                    return <div className="banner-cell">
                        <img src={details[movie.imdbID].poster}/>
                    </div>
                })
            }
        </div>
    )
}