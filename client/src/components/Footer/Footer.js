import "./Footer.css"

export default function Footer() {
    return (
        <div className="footer">
            <p>
                All data is from IMDB, Metacritic and Rotten Tomatoes.
            </p>
            <p>
                © {new Date().getFullYear()} Dang Khuong Tran
            </p>
        </div>
    )
}