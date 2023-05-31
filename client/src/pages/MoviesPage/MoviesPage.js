import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState, useRef } from "react";
import useMovieDetails from "../../hooks/useMovieDetails";
import { AgGridReact } from "ag-grid-react";
import { getEndpoint } from "../../utils/fetcher";
import { Link } from "react-router-dom";
import MovieCard from "../../components/MovieCard/MovieCard";
import { Separator } from "../../components/Separator/Separator";
import { Ratings } from "../../components/Ratings/Ratings";
import { TbTable, TbListDetails } from "react-icons/tb";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./MoviesPage.css";
import "../Common.css";

const MIN_YEAR = 1990;
const MAX_YEAR = new Date().getFullYear();
const DEBOUNCE_DELAY = 500;

/**
 * Format the search parameters to be used in the search endpoint
 * @param {*} searchParams The search parameters of the current page
 * @returns The formatted search parameters for the search endpoint
 */
function GetEndpointSearchParams(searchParams) {
  const searchParamsObj = Object.fromEntries(searchParams.entries());
  return (
    "?" +
    new URLSearchParams({
      title: searchParamsObj.title,
      year: searchParamsObj.year,
    }).toString()
  );
}

/**
 * A component that chooses the display mode for the movies page
 * (table or cards)
 * @returns A component that chooses the display mode for the movies page
 */
function Switch({ searchParams, updateSearchParams }) {
  const displayMode = searchParams.get("display");
  const setSwitch = (displayMode) => {
    updateSearchParams({ display: displayMode });
  };
  return (
    <div className="switch-container">
      <div
        className={`switch-button ${displayMode === "grid" ? "active" : ""}`}
        onClick={() => setSwitch("grid")}
      >
        <TbListDetails />
      </div>
      <div
        className={`switch-button ${displayMode === "table" ? "active" : ""}`}
        onClick={() => setSwitch("table")}
      >
        <TbTable />
      </div>
    </div>
  );
}

/**
 * The sub-component that displays the movies in a table with infinite pagination.
 * @param {*} searchParams The search parameters of the current page
 * @param {*} setMessage The function to set the message of the page
 * @returns The table component
 */
function Table({ searchParams, setMessage }) {
  const columns = [
    {
      headerName: "Title",
      field: "title",
      cellRenderer: (params) => {
        if (!params.data) return;
        return (
          <Link to={`/movies/data/${params.data.imdbID}`}>
            {params.data.title}
          </Link>
        );
      },
      minWidth: 300,
    },
    {
      headerName: "Year",
      field: "year",
      minWidth: 75,
    },
    {
      headerName: "IMDB Rating",
      field: "imdbRating",
      minWidth: 100,
    },
    {
      headerName: "Rotten Tomatoes Rating",
      field: "rottenTomatoesRating",
      minWidth: 100,
    },
    {
      headerName: "Metacritic Rating",
      field: "metacriticRating",
      minWidth: 100,
    },
    {
      headerName: "Classification",
      field: "classification",
      cellRenderer: (params) => {
        if (!params.data) return;
        return (
          <span className="gradient-rounded-border classification-badge">
            {params.data.classification}
          </span>
        );
      },
      minWidth: 150,
    },
  ];

  const defaultColDef = {
    flex: 1,
    resizable: true,
  };

  const tableGridRef = useRef();
  // When the search parameters change, fetch the movies
  // and update the data source of the table for infinite pagination
  useEffect(() => {
    setMessage("");
    if (!tableGridRef.current) return;
    // Convert only the title and year search params to a string
    const searchParamsStr = GetEndpointSearchParams(searchParams);
    getEndpoint(`/movies/search${searchParamsStr}`)
      .then((res) => {
        return res;
      })
      .then((data) => {
        if (!data) return;
        let movies = data.data;
        let pagination = data.pagination;

        // Create the data source for the table
        // that fetches the movies for each page
        const dataSource = {
          rowCount: undefined,
          getRows: (params) => {
            // Calculate the page number
            const pageNumber =
              Math.floor(params.startRow / pagination.perPage) + 1;
            // Fetch the movies
            getEndpoint(`/movies/search${searchParamsStr}&page=${pageNumber}`)
              .then((res) => {
                return res;
              })
              .then((data) => {
                if (!data) return;
                movies = data.data;
                params.successCallback(movies, pagination.total);
              })
              .catch((err) => {
              });
          },
        };
        tableGridRef.current.api.setDatasource(dataSource);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [searchParams]);

  return (
    <div className="movies-page-results-container ag-theme-alpine-dark">
      <AgGridReact
        ref={tableGridRef}
        defaultColDef={defaultColDef}
        columnDefs={columns}
        pagination={true}
        paginationPageSize={100}
        rowModelType="infinite"
      />
    </div>
  );
}

/**
 * The sub-component that displays the movies in cards with infinite scrolling
 * @param {*} searchParams The search parameters of the current page
 * @param {*} setMessage The function to set the message of the page
 * @returns The cards component
 */
function Details({ searchParams, setMessage }) {
  const [movies, setMovies] = useState([]);
  const [details, setDetails] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadMovies = useCallback(() => {
    const searchParamsStr = GetEndpointSearchParams(searchParams);
    setIsLoading(true);
    getEndpoint(`/movies/search${searchParamsStr}&page=${page}`).then(
      (data) => {
        if (!data) return;
        setMovies((movies) => [...movies, ...data.data]);
        setHasMore(data.pagination.nextPage !== null);
        setTotal(data.pagination.total);
        setIsLoading(false);
      }
    );
  }, [searchParams, page]);

  useMovieDetails(movies, setMovies, setDetails);

  // Reset the movies when the search parameters change
  useEffect(() => {
    setMovies([]);
    setDetails({});
    setPage(1);
    setHasMore(false);
    setScrollTop(0);
    setIsLoading(false);

    loadMovies();
  }, [searchParams]);

  // Infinite scrolling listener to update the page number
  useEffect(() => {
    function onScroll() {
      let currentPosition = window.pageYOffset;
      if (currentPosition > scrollTop) {
        // Scrolling down until the bottom of the page
        const isBottom =
          window.innerHeight + currentPosition >= document.body.offsetHeight;
        if (isBottom && hasMore) {
          setPage(page + 1);
        }
      }
      setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTop, hasMore]);

  // Load more movies when the page changes
  useEffect(() => {
    if (!hasMore) return;
    if (page === 1) return;
    loadMovies();
  }, [page]);

  // Update the message when the movies change
  useEffect(() => {
    setMessage(`Showing ${movies.length} of ${total} results.`);
  }, [movies, total]);

  const getRatingsForMovie = (movie) => {
    if (!movie) return;
    return [
      {
        source: "Internet Movie Database",
        value: movie.imdbRating,
      },
      {
        source: "Rotten Tomatoes",
        value: movie.rottenTomatoesRating,
      },
      {
        source: "Metacritic",
        value: movie.metacriticRating,
      },
    ];
  };

  return (
    <div id="movies-details-list" className="movies-page-results-container">
      {movies.map((movie) => {
        return (
          <div
            key={movie.imdbID}
            className="movie-details-row"
            onClick={() => navigate(`/movies/data/${movie.imdbID}`)}
          >
            <MovieCard
              key={movie.id}
              movie={movie}
              details={details[movie.imdbID]}
              width="150px"
              height="225px"
              showTitle={false}
            />
            <div className="movie-details">
              <div className="movie-header">
                <h3 className="movie-details-title">{movie.title}</h3>
                <Separator />
                <h4 className="movie-details-year light-font">{movie.year}</h4>
                <Separator />
                <h4 className="movie-details-class gradient-rounded-border light-font">
                  {movie.classification}
                </h4>
              </div>
              <div className="movie-info">
                <div className="movie-ratings">
                  <Ratings
                    ratings={getRatingsForMovie(movie)}
                    radius={40}
                    animate={false}
                  />
                </div>
                <div className="movie-details-plot overlay">
                  <p>{movie.data?.plot}</p>
                </div>
                <div />
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && <span className="loading">Loading more movies...</span>}
    </div>
  );
}

/**
 * The movies search page
 * @returns The movies search page
 */
export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState("");

  // If a search param is not defined, set it to the default value
  if (!searchParams.get("year")) {
    searchParams.set("year", "");
  }
  if (!searchParams.get("title")) {
    searchParams.set("title", "");
  }
  if (!searchParams.get("display")) {
    searchParams.set("display", "grid");
  }

  /**
   * Update the search params with the given updates
   * @param {*} updates The updates to apply to the search params
   */
  const updateSearchParams = useCallback(
    (updates) => {
      setSearchParams((prevSearchParams) => {
        let isSame = true;
        for (const [key, value] of Object.entries(updates)) {
          if (prevSearchParams.get(key) !== value) {
            isSame = false;
            break;
          }
        }
        if (isSame) return prevSearchParams;

        // Validate the updates
        if (updates.year) {
          const year = parseInt(updates.year);
          updates.year =
            year < MIN_YEAR ? MIN_YEAR : year > MAX_YEAR ? MAX_YEAR : year;
        }

        // Convert the previous search params to an object
        const prevSearchParamsObj = Object.fromEntries(
          prevSearchParams.entries()
        );

        // Merge the previous search params with the updates
        const newSearchParamsObj = { ...prevSearchParamsObj, ...updates };

        // Convert the new search params to a URLSearchParams object
        const newSearchParams = new URLSearchParams(newSearchParamsObj);
        return newSearchParams;
      });
    },
    [setSearchParams]
  );
  
  // Apply the year filter if it is valid. 
  // Otherwise set it to the nearest valid value
  const applyYearFilter = useCallback(
    (event) => {
      const year = parseInt(event.target.value);
      event.target.value =
        year < MIN_YEAR ? MIN_YEAR : year > MAX_YEAR ? MAX_YEAR : year;
      updateSearchParams({ year: event.target.value });
    },
    [updateSearchParams]
  );
  
  // Debounce a function call, useful for search bars
  const debounce = useCallback(
    (func, delay) => {
      let timer;
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(context, args);
        }, delay);
      };
    },
    [updateSearchParams]
  );

  return (
    <div className="movies-page">
      <div className="movies-page-header">
        <h1>Movies</h1>
        <div className="movies-page-header-filters">
          <div className="movies-page-header-filter">
            <label>Title</label>
            <input
              type="text"
              defaultValue={searchParams.get("title")}
              onChange={debounce((event) => {
                updateSearchParams({ title: event.target.value });
              }, DEBOUNCE_DELAY)}
              onBlur={(event) => {
                updateSearchParams({ title: event.target.value });
              }}
            />
          </div>
          <div className="movies-page-header-filter">
            <label>Year</label>
            <input
              type="number"
              defaultValue={searchParams.get("year")}
              onChange={debounce(applyYearFilter, DEBOUNCE_DELAY)}
              onBlur={applyYearFilter}
            />
          </div>
          <div className="movies-page-header-filter">
            <label>Display</label>
            <Switch
              searchParams={searchParams}
              updateSearchParams={updateSearchParams}
            />
          </div>
          <div className="movies-page-header-filter">
            <label>{message}</label>
          </div>
        </div>
      </div>
      <div id="result-container">
        {searchParams.get("display") === "table" ? (
          <Table searchParams={searchParams} setMessage={setMessage} />
        ) : (
          <Details searchParams={searchParams} setMessage={setMessage} />
        )}
      </div>
    </div>
  );
}
