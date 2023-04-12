# Development log

This document contains the development log for the Cinehub project. Each entry consists of the following:

- Date: The date the entry was made
- Description: A description of the work done
- Steps: The steps taken to complete the work

## 07/04/2023: Initial project setup

Major steps:

- Created the project repository
- Added the `README.md` file and other development-related documents:
  - Development log
  - Document framework (for the report)
  - Test framework (for the report)

Guides on new technologies:

### Creating a new React project

- Install the `create-react-app` package globally using `npm install -g create-react-app`
- Create a new React project using `npx create-react-app client`
- Run the project using `npm start` from the `client` folder

This creates a new React project in the `client` folder.

### Creating a new Express.js project

- Install the `express-generator` package globally using `npm install -g express-generator`
- Create a new Express.js project using `npx express server`
- Run the project using `npm start` from the `server` folder

This creates a new Express.js project in the `server` folder. However the server will not be used as of now.

### Adding React Styleguidist support

- Install the `react-styleguidist` package using `npm install react-styleguidist`
- Add a `styleguide.config.js` file in the `client` folder
- Add a `docs` folder in the `client` folder
- Run the Styleguidist server using `npm run styleguide`

### Adding Swagger support (server)

- Install the `swagger-jsdoc` and `swagger-ui-express` packages using `npm install swagger-jsdoc swagger-ui-express`

### Adding Docker support

- Create a `Dockerfile` in each of the `client` and `server` folders
- Create a `docker-compose.yml` file in the root of the project for running the application
- Create a `docker-compose.test.yml` file in the root of the project for running the tests
- Build the Docker images using `docker-compose build`
- Start the containers using `docker-compose up`
- Stop the containers using `docker-compose down`

This creates a new Docker container for each of the `client` and `server` projects, and the `docker-compose.yml` file is used to run the application, with both the `client` and `server` containers running.