import { getEndpoint } from "../utils/fetchTransform";
import { Link, useParams } from "react-router-dom"
import { useEffect, useState, useContext, useRef, useReducer } from "react";
import { CacheContext } from "../contexts/CacheContext";
import { AgGridReact } from "ag-grid-react";
import { AgChartsReact } from "ag-charts-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./PersonDataPage.css";

export default function PersonDataPage(){
    const { id } = useParams();

    const [options, updateOptions] = useReducer((current, update) => {
        const newOptions = {...current, ...update};
        return newOptions;
    }, {
            data: [],
            theme: 'ag-material-dark',
            xAxis: {
                type: 'number',
                label: {
                    text: 'IMDB Rating',
                },
            },
            series: [
                {
                  type: 'histogram',
                  xKey: 'imdbRating',
                  xName: 'IMDB Rating',
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
                },
              ],
            axes: [
                {
                    type: 'number',
                    position: 'bottom',
                    title: {
                        text: 'IMDB Rating',
                    },
                    tick: {
                        interval: 1,
                    }
                },
                {
                    type: 'number',
                    position: 'left',
                    title: {
                        text: 'Number of Movies',
                    },
                },
            ],
        }
    );
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const {user} = useContext(CacheContext);
    const [roles, setRoles] = useState(null);
    const [ratings, setRatings] = useState(null);

    const columns = [
        { 
            field: "category", 
            headerName: "Role",
            cellRenderer: (params) => {
                return params.value.charAt(0).toUpperCase() + params.value.slice(1);
            } 
        },
        { 
            field: "movieName", 
            headerName: "Movie",
            resizable: true,
            cellRenderer: (params) => {
                return <Link to={`/movies/data/${params.data.movieId}`}>{params.value}</Link>;
            }
        },
        { 
            field: "characters", 
            headerName: "Characters",
            resizable: true,
            cellRenderer: (params) => {
                console.log(params.value);
                return params.value.join(", ");
            }
        },
        { 
            field: "imdbRating", 
            headerName: "IMDB Rating",
            resizable: true,
        }
    ]

    const defaultColDef = {
        flex: 1,
    }

    useEffect(() => {
        setLoading(true);
        getEndpoint(`/people/${id}`,
            user.bearerToken.token
        ).then((res) => {
            if (res.error) {
                console.log(res.error);
                return;
            }
            setPerson(res);
            setRoles(res.roles);
            updateOptions({
                data: res.roles,
                title: {
                    text: `${res.name}'s IMDB Ratings`,
                },
            });
            setLoading(false);
        });
    }, [id, user.bearerToken.token]);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1>{person.name}</h1>
            <p>{person.birthYear}&mdash;{person.deathYear}</p>
            <div className="roles-table-container ag-theme-alpine-dark">
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={roles}
                    columnDefs={columns}
                    pagination={true}
                    paginationPageSize={10}
                />
            </div>
            <div className="ratings-chart-container">
                <AgChartsReact
                    options={options}
                />
            </div>
        </div>
    )
}