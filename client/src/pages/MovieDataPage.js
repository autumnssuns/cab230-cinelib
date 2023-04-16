import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Badge } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './MovieDataPage.css'

function formatCurrency(number) {
    return new Intl.NumberFormat('en-US', 
    { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(number)
}

export default function MovieDataPage(){
    const { imdbID } = useParams();
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const defaultColsDef = {
        flex: 1,
        resizable: true,
        width: "100px",
    }

    const columns = [
        {
            headerName: "Role", 
            field: "category",
            cellRenderer: (params) => {
                // Make the first letter of the role uppercase
                const role = params.value.charAt(0).toUpperCase() + params.value.slice(1);
                return <Badge bg="primary">{role} </Badge>
            },
            sortable: true, 
            filter: true
        },
        {
            headerName: "Name", 
            field: "name", 
            sortable: true, 
            filter: true
        },
        {
            headerName: "Characters", 
            field: "characters",
            cellRenderer: (params) => {
                return params.value.map((character) => {
                    return <Badge bg="secondary">{character} </Badge>
                })}, 
            sortable: true, 
            filter: true
        },
    ]

    useEffect(() => {
        fetch(`http://sefdb02.qut.edu.au:3000/movies/data/${imdbID}`).then(
            (res) => res.json()
        ).then((data) => {
            setMovie(data);
            setIsLoading(false);
            console.log(data)
        })
    }, [imdbID])

    if (isLoading) {
        return <h1>Loading movie data...</h1>
    }


    return (
        <div>
            <img src={movie.poster} alt={movie.title} />
            <h1>{movie.title}</h1>
            <p>Released in: {movie.year}</p>
            <p>Runtime: {movie.runtime}</p>
            <p>Genres: {movie.genres.map((genre) => {
                return <Badge bg="secondary">{genre} </Badge>
            })}</p>
            <p>Country: {movie.country}</p>
            <p>Box Office: {formatCurrency(movie.boxoffice)}</p>
            <div className="plot-container">
                <p>{movie.plot}</p>
            </div>
            <div className="ratings-container">
                <h3>Ratings</h3>
                <ul>
                    {movie.ratings.map((rating) => {
                        return <li>{rating.source}: {rating.value}</li>
                    })}
                </ul>
            </div>
            <div 
                className="principals-container ag-theme-alpine-dark" 
            >
                <h3>Principals</h3>
                <AgGridReact
                    defaultColDef={defaultColsDef}
                    rowData={movie.principals}
                    columnDefs={columns}
                    domLayout="autoWidth"
                />
            </div>                    
        </div>
    )
}