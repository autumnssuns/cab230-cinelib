import './MoviesBanner.css'

export default function MoviesBanner({movies, details}){
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const imgUrl = 'https://www.washingtonpost.com/graphics/2019/entertainment/oscar-nominees-movie-poster-design/img/black-panther-web.jpg';
    return (
        <div className="movies-banner-container">
            {
                array.map((item, index) => {
                    return <div className="banner-cell">
                        <img src={imgUrl}/>
                        Cell {index}
                    </div>
                })
            }
        </div>
    )
}