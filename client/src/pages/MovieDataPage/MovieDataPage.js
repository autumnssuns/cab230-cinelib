import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { getCode } from "../../utils/countries";
import { Ratings } from "../../components/Ratings/Ratings";
import { getEndpoint } from "../../utils/fetcher";
import Flag from "react-world-flags";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./MovieDataPage.css";

/**
 * Formats a number as a currency.
 * @param {*} number The number to format.
 * @returns The formatted currency.
 */
function formatCurrency(number) {
  if (typeof number !== "number" || isNaN(number)) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Formats the runtime into hours and minutes.
 * @param {*} runtime The runtime in minutes.
 * @returns The formatted runtime.
 */
function formatRuntime(runtime) {
  if (typeof runtime !== "number" || isNaN(runtime)) {
    return "Runtime Unknown";
  }
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * The sub-component that displays the genres of the movie.
 * @param {*} genres The genres array.
 * @returns The genres component.
 */
function Genres({ genres }) {
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

/**
 * The sub-component that displays the countries of the movie with their flags.
 * @param {*} countries The countries array.
 * @returns The countries component.
 */
function Countries({ countries }) {
  const countryComponents = countries.map((countryName) => {
    const country = getCode(countryName.trim());
    return (
      <div key={countryName} className="country">
        <Flag key={country} code={country} height="16" />
        {countryName}
      </div>
    );
  });
  return (
    <div className="countries-container">
      {countryComponents.reduce((prev, curr) => [
        prev,
        <div className="vertical-separator" />,
        curr,
      ])}
    </div>
  );
}

/**
 * The movie data page.
 * @returns The movie data page.
 */
export default function MovieDataPage() {
  const { imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Definitions for AG Grid
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
      // Render the name as a link to the person's page
      cellRenderer: (params) => {
        return <Link to={`/people/${params.data.id}`}>{params.value}</Link>;
      },
      minWidth: 225,
    },
    {
      headerName: "Characters",
      field: "characters",
      // Render the characters as a comma-separated list
      cellRenderer: (params) => {
        return params.value
          .map((character) => {
            return character;
          })
          .join(", ");
      },
      sortable: true,
      filter: true,
      minWidth: 225,
    },
    {
      headerName: "Role",
      field: "category",
      // Capitalize the first letter of the role
      cellRenderer: (params) => {
        const role =
          params.value.charAt(0).toUpperCase() + params.value.slice(1);
        return role;
      },
      sortable: true,
      filter: true,
      minWidth: 175,
    },
  ];

  // Fetch the movie data
  useEffect(() => {
    setIsLoading(true);
    getEndpoint(`/movies/data/${imdbID}`)
      .then((data) => {
        setMovie(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.message == "No record exists of a movie with this ID") {
          navigate("/404");
        }
      });
  }, [imdbID]);

  if (isLoading) {
    return <h1>Loading movie data...</h1>;
  }

  return (
    <div
      className="movie-data-page"
      style={{
        backgroundImage: `url(${movie.poster})`,
      }}
    >
      <div>
        <div className="movie-data-container">
          <img src={movie.poster} alt={`${movie.title} poster`} />
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
              <Countries countries={movie.country.split(",")}></Countries>
            </div>
            <div>
              <strong>Box Office</strong>: {formatCurrency(movie.boxoffice)}
            </div>
            <Ratings ratings={movie.ratings}></Ratings>
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
