import { IndexedDB } from './indexed.js';

/**
 * Get data from the given endpoint, relative to the BASE_API_URL defined in the
 * app.config.json file, and transforms it into a JSON object.
 * @param {string} endpoint The endpoint to fetch data from, e.g. '/movies/search'.
 * @param {string} token The JWT token to use for authentication.
 * @param {AbortSignal} signal The AbortSignal to use for cancelling the request. Defaults to null.
 * @param {number} waitBeforeFetch The number of milliseconds to wait before fetching the data from the API. Defaults to 0.
 * @returns {*} The response from the server.
 */
export async function getEndpoint(
    endpoint, 
    token, 
    signal = null,
    waitBeforeFetch = 0
    ) {
    // Extract the base API URL from the app config file.
    const { BASE_API_URL } = await import('../app.config.json');

    // Fetch the data from the endpoint and return the transformed data.
    try {
        // Get the data from the indexedDB if it exists.
        const indexedData = await getDataFromIndexedDB(endpoint);
        if (indexedData){
            return indexedData;
        }
        // Wait before fetching
            await new Promise((resolve) => setTimeout(resolve, waitBeforeFetch));
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
            throw data;
        }
        // Save the data to the indexedDB.
        await addDataToIndexedDB(endpoint, data);
        return data;
    }
    catch (error) {
        console.log(error)
        // Throw the error so that the caller can handle it.
        throw error;
    }
}

/**
 * Post data to the given endpoint, relative to the BASE_API_URL defined in the
 * app.config.json file, and transforms it into a JSON object.
 * @param {string} endpoint The endpoint to fetch data from, e.g. '/movies/search'.
 * @param {*} body The body of the request.
 * @returns {*} The response from the server.
 */
export async function postEndpoint(endpoint, body){
    // Extract the base API URL from the app config file.
    const { BASE_API_URL } = await import('../app.config.json');

    // Fetch the data from the endpoint and return the transformed data.
    try {
        const response = await fetch(`${BASE_API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.error){
            throw data;
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
    // Check if the indexedDB is supported.
    if (!IndexedDB.IsSupported){
        return null;
    }

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
    // Check if the indexedDB is supported.
    if (!IndexedDB.IsSupported){
        return null;
    }

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