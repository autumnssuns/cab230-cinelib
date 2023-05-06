import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "reactstrap";
import { AgGridReact } from "ag-grid-react";
import { ScoreCircle } from "../components/ScoreCircle/ScoreCircle";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./MovieDataPage.css";

function formatCurrency(number) {
  if (typeof(number) !== "number" || isNaN(number)) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
}

function Rating({rating}) {
  const RATINGS_MAP = {
    "Internet Movie Database": {
      max: 10,
      unit: "",
    },
    "Rotten Tomatoes": {
      max: 100,
      unit: "%",
    },
    "Metacritic": {
      max: 100,
      unit: "%",
    },
  };

  return (
    <div className="rating-container">
      <ScoreCircle
        score={rating.value}
        max={RATINGS_MAP[rating.source].max}
        unit={RATINGS_MAP[rating.source].unit}
        radius={50}
        color="#007bff"
      />
      <span className="rating-source">
        {rating.source}
      </span>
    </div>
  );
}

export default function MovieDataPage() {
  const { imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultColsDef = {
    flex: 1,
    resizable: true,
    width: "100px",
  };

  const columns = [
    {
      headerName: "Role",
      field: "category",
      cellRenderer: (params) => {
        // Make the first letter of the role uppercase
        const role =
          params.value.charAt(0).toUpperCase() + params.value.slice(1);
        return role;
      },
      sortable: true,
      filter: true,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return <Link to={`/people/${params.data.id}`}>{params.value}</Link>;
      },
    },
    {
      headerName: "Characters",
      field: "characters",
      cellRenderer: (params) => {
        return params.value.map((character) => {
          return character;
        });
      },
      sortable: true,
      filter: true,
    },
  ];

  useEffect(() => {
    fetch(`http://sefdb02.qut.edu.au:3000/movies/data/${imdbID}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
        setIsLoading(false);
        console.log(data);
      });
  }, [imdbID]);

  if (isLoading) {
    return <h1>Loading movie data...</h1>;
  }

  return (
    <div className="movie-data-page">
      <div className="movie-data-container">
        <img src={movie.poster} alt={movie.title} />
        <div className="details-container">
          <div className="info-container">
            <h1>{movie.title}</h1>
            <p>Released in: {movie.year}</p>
            <p>Runtime: {movie.runtime}</p>
            <p>
              Genres:{" "}
              {movie.genres.map((genre) => {
                return <Badge bg="secondary">{genre} </Badge>;
              })}
            </p>
            <p>Country: {movie.country}</p>
            <p>Box Office: {formatCurrency(movie.boxoffice)}</p>
          </div>
          <div className="plot-container">
            <p>{movie.plot}</p>
          </div>
          <div className="ratings-container">
            <div style={{
              display: "flex",
              flexWrap: "wrap"
            }}>
              {movie.ratings.filter((rating) => {
                return typeof(rating.value) === "number";
              }).map((rating) => {
                return (
                  <Rating rating={rating} key={rating.source}></Rating>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="principals-container ag-theme-alpine-dark">
        <h3>Principals</h3>
        <AgGridReact
          defaultColDef={defaultColsDef}
          rowData={movie.principals}
          columnDefs={columns}
          domLayout="autoWidth"
        />
      </div>
    </div>
  );
}
