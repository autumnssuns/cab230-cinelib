import { getEndpoint, postEndpoint } from "../utils/fetchTransform";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef, useReducer } from "react";
import { CacheContext } from "../contexts/CacheContext";
import { AgGridReact } from "ag-grid-react";
import { AgChartsReact } from "ag-charts-react";
import MovieCard from "../components/MovieCard/MovieCard";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./PersonDataPage.css";
import useMovieDetails from "../hooks/useMovieDetails";
import MovieGrid from "../components/MovieGrid/MovieGrid";
import "./Common.css";

function useImdbHistogramOptions(){
  return useReducer(
    (current, update) => {
      const newOptions = { ...current, ...update };
      return newOptions;
    },
    {
      data: [],
      title: {
        text: "IMDB Ratings",
      },
      theme: "ag-material-dark",
      xAxis: {
        type: "number",
        label: {
          text: "IMDB Rating",
        },
      },
      series: [
        {
          type: "histogram",
          xKey: "imdbRating",
          xName: "IMDB Rating",
          areaPlot: true,
          bins: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
            [5, 6],
            [6, 7],
            [7, 8],
            [8, 9],
            [9, 10],
          ],
          fill: "#db2828",
        },
      ],
      axes: [
        {
          type: "number",
          position: "bottom",
          title: {
            text: "IMDB Rating",
          },
          tick: {
            interval: 1,
          },
        },
        {
          type: "number",
          position: "left",
          title: {
            text: "Number of Movies",
          },
        },
      ],
    }
  );
}

function RatingHistogram({ roles }){
  const [options, updateOptions] = useImdbHistogramOptions();
  useEffect(() => {
    updateOptions({
      data: roles,
    });
  }, [roles]);
  return (
    <div className="chart-container">
      <AgChartsReact options={options} />
    </div>
  );
}

function ProgressDoughnut({ movies }){
  const total = movies.length;
  const loaded = movies.filter((movie) => movie.data).length;

  const percentage = (value) => `${((value / total) * 100).toFixed()}%`;
  const [options, setOptions] = useState({
    data: [
      { name: 'Loaded', count: loaded },
      { name: 'Loading', count: total - loaded },
    ],
    theme: 'ag-material-dark',
    title: {
      text: 'Number of Movies by Genre... Loading Data',
    },
    series: [
      {
        type: 'pie',
        angleKey: 'count',
        fills: ['#db2828', '#1f1f1f'],
        strokeWidth: 0,
        innerRadiusOffset: -20,
        innerLabels: [
          {
            text: percentage(loaded),
            color: '#db2828',
            fontSize: 72,
          },
          {
            text: 'Loaded',
            fontSize: 24,
            margin: 4,
          },
        ],
        innerCircle: {
          fill: '#1f1f1f',
        },
      },
    ],
  });

  useEffect(() => {
    setOptions((current) => {
      return {
        ...current,
        data: [
          { name: 'Loaded', count: loaded },
          { name: 'Loading', count: total - loaded },
        ],
        series: [
          {
            ...current.series[0],
            innerLabels: [
              {
                ...current.series[0].innerLabels[0],
                text: percentage(loaded),
              },
              ...current.series[0].innerLabels.slice(1),
            ],
          },
        ],
      }
    });
  }, [loaded, total]);

  return <div className="chart-container">
    <AgChartsReact options={options} />
  </div>;
}

function GenreCountryDoughnutChart({movies}){
  const validMovies = movies.filter((movie) => movie.data);
  if (validMovies.length !== movies.length) {
    return <ProgressDoughnut movies={movies} />;
  }

  const genres = new Map();
  validMovies.forEach((movie) => {
    movie.data.genres.forEach((genre) => {
      if (genres.has(genre)) {
        genres.set(genre, genres.get(genre) + 1);
      } else {
        genres.set(genre, 1);
      }
    });
  });
  const genreData = [];
  genres.forEach((value, key) => {
    genreData.push({ genre: key, count: value });
  });

  const fills = [];
  for (let i = 0; i < genreData.length; i++) {
    const alpha = 1 - (i + 1) / genreData.length
    fills.push(`rgba(219, 40, 40, ${alpha})`);
  }
  console.log(fills);

  const options = {
    data: genreData.sort((a, b) => b.count - a.count),
    theme : 'ag-material-dark',
    title: {
      text: 'Number of Movies by Genre',
    },
    series: [
      {
        type: 'pie',
        angleKey: 'count',
        calloutLabelKey: 'genre',
        sectorLabelKey: 'count',
        sectorLabel: {
          color: 'white',
          fontWeight: 'bold',
        },
        fills,
        strokeWidth: 0,
      },
    ],
  };

  return (
    <div className="chart-container">
      <AgChartsReact options={options} />
    </div>
  );
}

const columns = [
  {
    field: "movieName",
    headerName: "Movie",
    resizable: true,
    cellRenderer: (params) => {
      return (
        <Link to={`/movies/data/${params.data.movieId}`}>{params.value}</Link>
      );
    },
    minWidth: 200,
  },
  {
    field: "category",
    headerName: "Role",
    cellRenderer: (params) => {
      return params.value.charAt(0).toUpperCase() + params.value.slice(1);
    },
    minWidth: 100,
  },
  {
    field: "characters",
    headerName: "Characters",
    resizable: true,
    cellRenderer: (params) => {
      console.log(params.value);
      return params.value.join(", ");
    },
    minWidth: 200,
  },
  {
    field: "imdbRating",
    headerName: "IMDB Rating",
    resizable: true,
    minWidth: 100,
  },
];

const defaultColDef = {
  flex: 1,
};

export default function PersonDataPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [options, updateOptions] = useImdbHistogramOptions();
  
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user, updateUser } = useContext(CacheContext);
  const [roles, setRoles] = useState(null);
  const [movies, setMovies] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    setLoading(true);
    getEndpoint(`/people/${id}`, user.bearerToken.token)
      .then((res) => {
        setPerson(res);
        setRoles(res.roles);
        updateOptions({
          data: res.roles,
        });
        setLoading(false);
        const movies = res.roles.map((role) => {
          return {
            imdbID: role.movieId,
            title: role.movieName,
            data: null,
          };
        });
        setMovies([...movies]);
      })
      .catch((err) => {
        console.log(err);
        if (err.message == "Authorization header ('Bearer token') not found") {
          // If the user is not logged in, redirect them to the login page
          // after a small delay
          setTimeout(() => {
            navigate("/login?redirectUrl=/people/" + id);
          }, 1000);
        }
        if (err.message == "No record exists of a person with this ID") {
          setTimeout(() => {
            navigate("/404");
          }, 1000);
        }
        if (err.message == "JWT token has expired.") {
          // If Bearer token has expired, refresh the token
          postEndpoint("/user/refresh", {
            refreshToken: localStorage.getItem("refreshToken"),
          })
            .then((res) => {
              updateUser({ ...res });
            })
            .catch((error) => {
              console.log("Error refreshing token: ", error);
              if (error.message === "JWT token has expired") {
                // If the refresh token has expired, refresh the page to trigger
                // the refresh token check in App.js
                window.location.reload();
              }
            });
        }
        setError(true);
        return;
      });
  }, [id, user.bearerToken.token]);

  useMovieDetails(movies, setMovies, setDetails);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div id="person-data-page">
      <div className="person-data-header">
        <h1>{person.name}</h1>
        <h3>
          {person.birthYear} &mdash; {person.deathYear}
        </h3>
      </div>
      <div className="section">
        <h2>Starred movies</h2>
        <div className="movie-grid content-fade-in">
          <div className="roles-table-container ag-theme-alpine-dark">
            <AgGridReact
              defaultColDef={defaultColDef}
              rowData={roles}
              columnDefs={columns}
              pagination={true}
              paginationPageSize={10}
            />
          </div>
          <MovieGrid
            movies={movies}
            details={details}
            width="100px"
            height="150px"
          />
        </div>
      </div>
      <div className="section">
        <h2>Statistics</h2>
        <div className="charts-container">
          <RatingHistogram roles={roles} />
          <GenreCountryDoughnutChart movies={movies} />
        </div>
      </div>
    </div>
  );
}
