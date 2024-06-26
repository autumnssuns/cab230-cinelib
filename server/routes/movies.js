var express = require("express");
var router = express.Router();
const query = require("../middleware/query");
const parse = require("../middleware/parse");
const send = require("../middleware/send");
const toNumber = require("../utils/types").toNumber;

const PER_PAGE = 100;

// Maps the column names from the basics table to the field names in the API
const BASICS_MAP = {
  primaryTitle: "title",
  year: "year",
  tconst: "imdbID",
  imdbRating: "imdbRating",
  rottentomatoesRating: "rottenTomatoesRating",
  metacriticRating: "metacriticRating",
  rated: "classification",
};

/**
 * Converts a map of column names to field names into a select query
 * @param map Map of column names to field names
 * @returns An array of strings that can be used in a select query
 */
function selectQueryFromMap(map) {
  return Object.keys(map).map((key) => {
    return `${key} as ${map[key]}`;
  });
}

/**
 * Search the movies given the query parameters, used by the GET /movies endpoint
 * @param knex The knex instance
 * @param title The title of the movie
 * @param year The year of the movie
 * @param page The page number
 * @returns The movies that match the query parameters
 */
async function searchMovies({ knex, title, year, page = 1 }) {
  // Year must be yyyy format
  if (year && !year.match(/^\d{4}$/)) {
    throw {
      code: 400,
      message: "Invalid year format. Format must be yyyy.",
    };
  }
  // Page must be a number
  if (isNaN(page)) {
    throw {
      code: 400,
      message: "Invalid page format. page must be a number.",
    };
  } else {
    // Convert page to a number
    page = +page;
  }

  // Calculate offset for pagination
  const offset = (page - 1) * PER_PAGE;
  let countPromise, dataPromise;
  // Count total number of movies
  countPromise = knex("basics").count("tconst as count");
  if (title) {
    countPromise = countPromise.where("primaryTitle", "like", `%${title}%`);
  }
  if (year) {
    countPromise = countPromise.where("year", "like", `%${year}%`);
  }
  const selectFields = selectQueryFromMap(BASICS_MAP);
  // Get movies for the current page
  dataPromise = knex("basics")
    .select(selectFields)
    .limit(PER_PAGE)
    .offset(offset);
  if (title) {
    dataPromise = dataPromise.where("primaryTitle", "like", `%${title}%`);
  }
  if (year) {
    dataPromise = dataPromise.where("year", "like", `%${year}%`);
  }
  return Promise.all([countPromise, dataPromise]).then((results) => {
    const movies = results[1].map((movie) => {
      return {
        title: movie.title,
        year: +movie.year,
        imdbID: movie.imdbID,
        imdbRating: toNumber(movie.imdbRating),
        rottenTomatoesRating: toNumber(movie.rottenTomatoesRating),
        metacriticRating: toNumber(movie.metacriticRating),
        classification: movie.classification,
      };
    });
    return {
      data: movies,
      pagination: {
        total: +results[0][0].count,
        lastPage: Math.ceil(results[0][0].count / PER_PAGE),
        perPage: PER_PAGE,
        currentPage: page,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(results[0][0].count / PER_PAGE) ? page + 1 : null,
        from: offset,
        to: offset + movies.length,
      },
    };
  });
}

/**
 * Get the movie details given the imdbID, used by the GET /movies/data/:imdbID endpoint
 * @param knex The knex instance
 * @param imdbID The imdbID of the movie
 * @returns The details of the specified movie
 */
async function getMovieDetails({ knex, imdbID }) {
  const selectFields = selectQueryFromMap(MOVIE_DETAILS_MAP);
  // Get the movie details from the basics table
  const raw = await knex("basics")
    .join("principals", "principals.tconst", "basics.tconst")
    .select(selectFields)
    .where("basics.tconst", imdbID)
    .then((results) => {
      return results;
    });
  if (raw.length === 0) throw {
    code: 404,
    message: "No record exists of a movie with this ID",
  };
  return {
    title: raw[0].title,
    year: raw[0].year,
    runtime: raw[0].runtime,
    genres: raw[0].genres.split(","),
    country: raw[0].country,
    principals: raw.map((row) => {
      // Remove [ and ], and " from characters
      const characters = row.characters
        .replace(/[\[\]"]+/g, "")
        .split(",")
        .filter((character) => character.length > 0);
      return {
        id: row.id,
        category: row.category,
        name: row.name,
        characters: characters,
      };
    }),
    ratings: [
      {
        source: "Internet Movie Database",
        value: toNumber(raw[0].imdbRating),
      },
      {
        source: "Rotten Tomatoes",
        value: toNumber(raw[0].rottenTomatoesRating),
      },
      {
        source: "Metacritic",
        value: toNumber(raw[0].metacriticRating),
      },
    ].filter((rating) => rating.value !== null),
    boxoffice: raw[0].boxoffice,
    poster: raw[0].poster,
    plot: raw[0].plot,
  };
}

// Map of fields to return for the /movies/data/{imdbID} endpoint
const MOVIE_DETAILS_MAP = {
  primaryTitle: "title",
  year: "year",
  runtimeMinutes: "runtime",
  genres: "genres",
  country: "country",
  boxoffice: "boxoffice",
  poster: "poster",
  plot: "plot",
  imdbRating: "imdbRating",
  rottentomatoesRating: "rottenTomatoesRating",
  metacriticRating: "metacriticRating",
  nconst: "id",
  category: "category",
  name: "name",
  characters: "characters",
};

// GET /movies/search endpoint
router.get(
  "/search",
  parse((req) => {
    return {
      title: req.query.title,
      year: req.query.year,
      page: req.query.page || 1,
    };
  }),
  query(searchMovies),
  send
);

// GET /movies/data/:imdbID endpoint
router.get(
  "/data/:imdbID",
  parse((req) => {
    if (Object.keys(req.query).length > 0) {
      const query = Object.keys(req.query)
        .map((key) => key)
        .join(", ");
      throw {
        code: 400,
        message: `Invalid query parameters: ${query}. Query parameters are not permitted.`,
      };
    }
    return {
      imdbID: req.params.imdbID,
    };
  }),
  query(getMovieDetails),
  send
);

module.exports = router;
