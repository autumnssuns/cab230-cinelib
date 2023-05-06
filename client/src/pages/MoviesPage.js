import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState, useContext, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { getEndpoint } from "../utils/fetchTransform";
import { CacheContext } from "../contexts/CacheContext";
import { Link } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./MoviesPage.css";
import ClassificationBadge from "../components/ClassificationBadge/ClassificationBadge";

const MIN_YEAR = 1990;
const MAX_YEAR = new Date().getFullYear();
const DEBOUNCE_DELAY = 500;

export default function MoviesPage(){
    const [searchParams, setSearchParams] = useSearchParams();
    const {user} = useContext(CacheContext);    

    useEffect(() => {
        // If the search params is empty, set the default search params
        if (searchParams.toString() === "") setSearchParams({ title: "", year: "", page: 1 });
    }, []);

    const updateSearchParams = useCallback((updates) => {
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
                updates.year = year < MIN_YEAR ? MIN_YEAR : year > MAX_YEAR ? MAX_YEAR : year;
            }
    
            // Convert the previous search params to an object
            const prevSearchParamsObj = Object.fromEntries(prevSearchParams.entries());
            // Merge the previous search params with the updates
            const newSearchParamsObj = { ...prevSearchParamsObj, ...updates };
            // Convert the new search params to a URLSearchParams object
            const newSearchParams = new URLSearchParams(newSearchParamsObj);
            return newSearchParams;
        });
    }, [setSearchParams]);

    const applyYearFilter = useCallback((event) => {
        const year = parseInt(event.target.value);
        event.target.value = year < MIN_YEAR ? MIN_YEAR : year > MAX_YEAR ? MAX_YEAR : year;
        updateSearchParams({ year: event.target.value })
    }, [updateSearchParams]);

    const debounce = useCallback((func, delay) => {
        let timer;
        return function(){
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        }
    }, [updateSearchParams]);

    const columns = [
        { 
            headerName: "Title", 
            field: "title",
            cellRenderer: (params) => {
                if (!params.data) return;
                return <Link to={`/movies/data/${params.data.imdbID}`}>{params.data.title}</Link>
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
                const classification = params.data.classification ? params.data.classification : "N/A";
                return <ClassificationBadge text={classification} />
            },
        },
    ];

    const defaultColDef = {
        flex: 1,
        resizable: true,
    };

    const gridRef = useRef();

    useEffect(() => {
        if (!gridRef.current) return;
        // Convert the search params to string
        const searchParamsStr = `?${searchParams.toString()}`;
        // Remove page from initial search to get the total number of movies
        getEndpoint("/movies/search" + searchParamsStr.replace(/&page=(\d+)&?/, "")).then((res) => {
            return res;
        }).then((data) => {
            if (!data) return;
            let movies = data.data;
            let pagination = data.pagination;
            
            const dataSource = {
                rowCount: undefined,
                getRows: (params) => {
                    // Calculate the page number
                    const pageNumber = Math.floor(params.startRow / pagination.perPage) + 1;
                    // Fetch the movies
                    getEndpoint(`/movies/search${searchParamsStr.replace(/(page=)(.*)/gm, `$1${pageNumber}`)}`).then((res) => {
                        return res;
                    }).then((data) => {
                        if (!data) return;
                        movies = data.data;
                        params.successCallback(movies, pagination.total);
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }
            gridRef.current.api.setDatasource(dataSource);
            // 
        }).catch((err) => {
            console.log(err);
        });
    }, [searchParams]);

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
                                updateSearchParams({ title: event.target.value })
                            }, DEBOUNCE_DELAY)}
                            onBlur={(event) => {
                                updateSearchParams({ title: event.target.value })
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
            <div className="movies-page-results-container ag-theme-alpine-dark">
                <AgGridReact
                    ref={gridRef}
                    defaultColDef={defaultColDef}
                    columnDefs={columns}
                    pagination={true}
                    paginationPageSize={100}
                    rowModelType="infinite"
                />
            </div>
        </div>
    )
}