<!-- Replace repository name -->

[![Client Playwright Tests](https://github.com/autumnssuns/cinehub-cab230/actions/workflows/client-test-and-build.yml/badge.svg)](https://github.com/autumnssuns/cinehub-cab230/actions/workflows/client-test-and-build.yml)

[![Server Jest Tests](https://github.com/autumnssuns/cinehub-cab230/actions/workflows/server-test-and-build.yml/badge.svg)](https://github.com/autumnssuns/cinehub-cab230/actions/workflows/server-test-and-build.yml)

# CAB230 Web Computing Project - Cinehub


## Technology

The project is built using the following technologies:

- React (front-end)
- Express.js (back-end)
- Docker (for containerization)
- Playwright (for end-to-end testing)
- React Styleguidist (for component documentation)
- Swagger (for API documentation)
- GitHub Actions (for CI/CD)

### Client Dependencies

- `react-router-dom`: For routing
- `react-bootstrap`: For styling
- `react-icons`: For icons
- `ag-grid-react`: For tables

## Project Structure

The project has the following folder structure:

- `client`: React client-side application
  - `docs`: React Styleguidist documentation site
  - `e2e`: End-to-end tests by Playwright
- `server`: Express.js back-end
  - `docs`: Swagger documentation site
  - `__tests__`: Jest tests

## How to Run

To run the application, follow these steps:

1. Install Docker on your machine
2. Clone the repository: `git clone https://github.com/yourusername/cinehub.git`
3. Navigate to the root of the project: `cd cinehub`
4. Build the Docker images: `docker-compose build`
5. Start the containers: `docker-compose up`

The application will be available at `http://localhost:3000`. 

The Swagger documentation site will be available at `http://localhost:3001/api-docs`.

## How to Test

### Client Tests

To run the client tests, follow these steps:

1. Go to the `client` folder: `cd client`
2. Run the tests: `npm run playwright`
3. The test results will be displayed in the browser, at `http://localhost:9323` (by default), and can be found in the `client/playwright-report` folder

### Server Tests

To run the server tests, follow these steps:

1. Go to the `server` folder: `cd server`
2. Start the server: `npm start`
3. Run the tests: `npm run test`

### Some major challenges faced

- When working with `react-router-dom`, the `useDetailedMovies` hook was still sending requests to the server even when the user was on a different page. This caused unnecessary requests to be sent to the server, causing issues due to the server's rate limiting. 
  - To fix this, the `fetchTransform` function was added an `signal` parameter, which is used to cancel the request when the user navigates away from the page.
  - The `useDetailedMovies`'s `useEffect` returned a cleanup function that calls the `abort` method on an `AbortController` instance. The controller's `signal` is passed to all relevant `fetchTransform` calls.

