import { movies } from '../mocks/movie.search.js';

/**
 * Get data from the given endpoint, relative to the BASE_API_URL defined in the
 * app.config.json file, and transforms it into a JSON object.
 * @param {string} endpoint The endpoint to fetch data from, e.g. '/movies/search'.
 * @param {function} transformer A function that transforms the json data into a JavaScript object.
 */
export async function getEndpoint(endpoint, token, transformer = (data) => data) {
    // Extract the base API URL from the app config file.
    const { BASE_API_URL } = await import('../app.config.json');

    // Fetch the data from the endpoint and return the transformed data.
    try {
        // If the BASE_API_URL is 'local', then use the mock data.
        let response;
        if (BASE_API_URL === 'local'){
            response = {
                json: () => {
                    return movies;
                }
            };
        } else {
            response = await fetch(`${BASE_API_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        const data = await response.json();
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
        if (BASE_API_URL === 'local'){
            response = {
                json: () => {
                    return movies;
                }
            };
        } else {
            response = await fetch(`${BASE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error)
        // Throw the error so that the caller can handle it.
        throw error;
    }
}