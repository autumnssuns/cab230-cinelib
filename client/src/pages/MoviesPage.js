import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState, useContext, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { getEndpoint } from "../utils/fetchTransform";
import { CacheContext } from "../contexts/CacheContext";
import { Link } from "react-router-dom";
import { MovieDetailsLoader } from "../utils/movieDetailsLoader";
import MovieCard from "../components/MovieCard/MovieCard";
import { Rating } from "../components/Rating/Rating";
import { Separator } from "../components/Separator/Separator";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./MoviesPage.css";
import "./Common.css";
import { Ratings } from "../components/Ratings/Ratings";

const MIN_YEAR = 1990;
const MAX_YEAR = new Date().getFullYear();
const DEBOUNCE_DELAY = 500;

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

function Table({ searchParams }) {
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
    },
    {
      headerName: "Year",
      field: "year",
    },
    {
      headerName: "IMDB Rating",
      field: "imdbRating",
    },
    {
      headerName: "Rotten Tomatoes Rating",
      field: "rottenTomatoesRating",
    },
    {
      headerName: "Metacritic Rating",
      field: "metacriticRating",
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
    },
  ];

  const defaultColDef = {
    flex: 1,
    resizable: true,
  };

  const tableGridRef = useRef();
  useEffect(() => {
    console.log("searchParams", searchParams);
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
                console.log(err);
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

function Details({ searchParams }) {
  const [movies, setMovies] = useState([]);
  const [details, setDetails] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const detailsLoader = new MovieDetailsLoader(setMovies, setDetails);

  useEffect(() => {
    setMovies([]);
    setDetails({});
    setPage(1);
    setHasMore(false);
    setScrollTop(0);
    setIsLoading(false);
    
    const searchParamsStr = GetEndpointSearchParams(searchParams);
    setIsLoading(true);
    getEndpoint(`/movies/search${searchParamsStr}&page=${page}`).then(
      (data) => {
        if (!data) return;
        setMovies((movies) => [...movies, ...data.data]);
        setHasMore(data.pagination.nextPage !== null);
        setIsLoading(false);
      }
    );
  }, [searchParams]);

  useEffect(() => {
    if (movies.length === 0) return;
    const abortController = new AbortController();
    const signal = abortController.signal;

    detailsLoader.loadDetails(
      [movies.filter((movie) => !movie.data)[0]],
      setMovies,
      signal,
      0
    );

    return () => {
      abortController.abort();
    };
  }, [movies]);

  useEffect(() => {
    function onScroll() {
      let currentPosition = window.pageYOffset;
      if (currentPosition > scrollTop) {
        // Scrolling down until the bottom of the page
        if (
          window.innerHeight + currentPosition >= document.body.offsetHeight &&
          hasMore
        ) {
          setPage(page + 1);
        }
      }
      setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTop, hasMore]);

  useEffect(() => {
    if (!hasMore) return;
    if (page === 1) return;
    const searchParamsStr = GetEndpointSearchParams(searchParams);
    setIsLoading(true);
    getEndpoint(`/movies/search${searchParamsStr}&page=${page}`).then(
      (data) => {
        if (!data) return;
        setMovies((movies) => [...movies, ...data.data]);
        setHasMore(data.pagination.nextPage !== null);
        setIsLoading(false);
      }
    );
  }, [page]);

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
                    ratings={[
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
                    ]}
                    radius={25}
                    animate={false}
                  />
                </div>
                <div className="movie-details-plot overlay">
                  <p>{movie.data?.plot}</p>
                </div>
                <div/>
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && (
        <span className="loading">
          Loading more movies...
        </span>
      )}
    </div>
  );
}

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // If the search params is empty, set the default search params
    if (searchParams.toString() === "")
      setSearchParams({ title: "", year: "", display: "table" });
  }, []);

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
        // If the updates is the same as the current search params, do nothing
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

  const applyYearFilter = useCallback(
    (event) => {
      const year = parseInt(event.target.value);
      event.target.value =
        year < MIN_YEAR ? MIN_YEAR : year > MAX_YEAR ? MAX_YEAR : year;
      updateSearchParams({ year: event.target.value });
    },
    [updateSearchParams]
  );

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
        <em>Mirror mirror on the wall, fetch me the best of them all...</em>
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
        </div>
      </div>
      <div id="result-container">
        {searchParams.get("display") === "table" ? (
          <Table searchParams={searchParams} />
        ) : (
          <Details searchParams={searchParams} />
        )}
      </div>
    </div>
  );
}
