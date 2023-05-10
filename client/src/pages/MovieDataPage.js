import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "reactstrap";
import { AgGridReact } from "ag-grid-react";
import { ScoreCircle } from "../components/ScoreCircle/ScoreCircle";
import { getCode } from "../utils/countries";
import { Rating } from "../components/Rating/Rating";
import Flag from "react-world-flags";
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

function formatRuntime(runtime) {
  if (typeof(runtime) !== "number" || isNaN(runtime)) {
    return "Runtime Unknown";
  }
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}m`;
}

function Genres({genres}) {
  return (
    <div className="genres-container">
      {genres.map((genre) => {
        return (
          <div key={genre} className="genre">
            {genre}
          </div>
        );
      })}
    </div>
  );
}

function Countries({countries}){
  const countryComponents = countries.map((countryName) => {
    const country = getCode(countryName.trim());
    console.log(country);
    return (
      <div key={countryName} className="country">
        <Flag key={country} code={country} height="16" />
        {countryName}
      </div>
    );
  });
  return (
    <div className="countries-container">
      {countryComponents.reduce((prev, curr) => [prev, <div className="vertical-separator"/>, curr])}
    </div>
  )
}

export default function MovieDataPage() {
  const { imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultColsDef = {
    flex: 1,
    resizable: true,
  };

  const columns = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return <Link to={`/people/${params.data.id}`}>{params.value}</Link>;
      },
      minWidth: 225,
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
      minWidth: 225,
    },    
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
      minWidth: 175,
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
    <div className="movie-data-page" style={{
      backgroundImage: `url(${movie.poster})`,
    }}>
      <div>
        <div className="movie-data-container">
          <img src={movie.poster} alt={movie.title} />
          <div className="details-container">
            <div className="info-container">
              <h1>{movie.title}</h1>
              <div className="general-info-container">
                <div className="time-info-container">
                  <div>{movie.year}</div>
                  <div className="vertical-separator"></div>
                  <div>{formatRuntime(movie.runtime)}</div>
                </div>
                <div className="vertical-separator"></div>
                <Genres genres={movie.genres}></Genres>
              </div>
              <div className="plot-container">
                <p>{movie.plot}</p>
              </div>
            </div>
            <div className="production-container">
              {/* <div>{movie.country} <Flag code={getCode(movie.country)} height="50%"/></div> */}
              <Countries countries={movie.country.split(",")}></Countries>
            </div>
            <div><strong>Box Office</strong>: {formatCurrency(movie.boxoffice)}</div>
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
        <div className="principals-box">
          <h3>Principals</h3>
          <div className="principals-container ag-theme-alpine-dark">
            <AgGridReact
              defaultColDef={defaultColsDef}
              rowData={movie.principals}
              columnDefs={columns}
              domLayout="autoWidth"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
