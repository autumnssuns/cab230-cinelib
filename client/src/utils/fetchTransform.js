import { movies } from '../mocks/movie.search.js';
import { IndexedDB } from './indexed.js';

/**
 * Get data from the given endpoint, relative to the BASE_API_URL defined in the
 * app.config.json file, and transforms it into a JSON object.
 * @param {string} endpoint The endpoint to fetch data from, e.g. '/movies/search'.
 * @param {function} transformer A function that transforms the json data into a JavaScript object.
 */
export async function getEndpoint(
    endpoint, 
    token, 
    transformer = (data) => data,
    signal = null // AbortSignal for cancelling the request.
    ) {
    // Extract the base API URL from the app config file.
    const { BASE_API_URL } = await import('../app.config.json');

    // Fetch the data from the endpoint and return the transformed data.
    try {
        // Get the data from the indexedDB if it exists.
        const indexedData = await getDataFromIndexedDB(endpoint);
        if (indexedData){
            return transformer(indexedData);
        }
        // Otherwise, fetch the data from the API and save it to the indexedDB.
        const response = await fetch(`${BASE_API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: signal
        });
        const data = await response.json();
        if (data.error){
            throw new Error(data.message);
        }
        // Save the data to the indexedDB.
        await addDataToIndexedDB(endpoint, data);
        return transformer(data);
    }
    catch (error) {
        console.log(error)
        // Throw the error so that the caller can handle it.
        throw error;
    }
}

export async function postEndpoint(endpoint, body){
    // Extract the base API URL from the app config file.
    const { BASE_API_URL } = await import('../app.config.json');

    // Fetch the data from the endpoint and return the transformed data.
    try {
        // If the BASE_API_URL is 'local', then use the mock data.
        let response;
        response = await fetch(`${BASE_API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.error){
            throw new Error(data.message);
        }
        return data;
    }
    catch (error) {
        console.log(error)
        // Throw the error so that the caller can handle it.
        throw error;
    }
}

/**
 * Get data from the indexedDB based on the endpoint.
 * @param {*} endpoint The endpoint to fetch data from, e.g. '/movies/data/{imdbID}'.
 * @returns {Promise} A promise that resolves when the data has been retrieved from the indexedDB.
 */
async function getDataFromIndexedDB(endpoint){
    // Get the parts of the endpoint - id and base.
    // e.g. '/movies/data/tt1234567' => id = 'tt1234567', base = '/movies/data'
    const parts = endpoint.split('/');
    const id = parts[parts.length - 1];
    const base = parts.slice(0, parts.length - 1).join('/');
    
    switch (base){
        case '/movies/data':
            return await IndexedDB.Movies.read(id);
        case '/people':
            return await IndexedDB.People.read(id);
        default:
            return null;
    }
}

/**
 * Add data to the indexedDB based on the endpoint.
 * @param {*} endpoint The endpoint to fetch data from, e.g. '/movies/data/{imdbID}'.
 * @param {*} data The data to add to the indexedDB.
 * @returns {Promise} A promise that resolves when the data has been added to the indexedDB.
 */
async function addDataToIndexedDB(endpoint, data){
    // Get the parts of the endpoint - id and base.
    // e.g. '/movies/data/tt1234567' => id = 'tt1234567', base = '/movies/data'
    const parts = endpoint.split('/');
    const id = parts[parts.length - 1];
    const base = parts.slice(0, parts.length - 1).join('/');
    console.log(base);
    switch (base){
        case '/movies/data':
            return await IndexedDB.Movies.create(id, data);
        case '/people':
            return await IndexedDB.People.create(id, data);
        default:
            return null;
    }
}