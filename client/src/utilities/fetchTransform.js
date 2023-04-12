/**
 * Fetches data from the given endpoint, relative to the BASE_API_URL defined in the
 * app.config.json file, and transforms it into a JSON object.
 * @param {string} endpoint The endpoint to fetch data from, e.g. '/movies/search'.
 * @param {function} transformer A function that transforms the json data into a JavaScript object.
 */
export default async function fetchTransform(endpoint, transformer = (data) => data) {
    // Extract the base API URL from the app config file.
    const { BASE_API_URL } = await import('../app.config.json');

    // Fetch the data from the endpoint and return the transformed data.
    try {
        const response = await fetch(`${BASE_API_URL}${endpoint}`);
        const data = await response.json();
        return transformer(data);
    }
    catch (error) {
        console.log(error);
    }
}