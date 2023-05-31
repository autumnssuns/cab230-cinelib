var express = require("express");
var router = express.Router();

/* --- GET movies listing. --- */
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

function selectQueryFromMap(map) {
  return Object.keys(map).map((key) => {
    return `${key} as ${map[key]}`;
  });
}

function searchMovies(knex, title, year, page = 1) {
  // Year must be yyyy format
  if (year && !year.match(/^\d{4}$/)) {
    throw new Error("Invalid year format. Format must be yyyy.");
  }

  // Calculate offset for pagination
  const offset = (page - 1) * PER_PAGE;

  let countPromise, dataPromise;

  // Count total number of movies
  countPromise = knex("basics").count("tconst");
  if (title) {
    countPromise = countPromise.where("primaryTitle", "like", `%${title}%`);
  }
  if (year) {
    countPromise = countPromise.where("year", "like", `%${year}%`);
  }

  const selectFields = selectQueryFromMap(BASICS_MAP);

  // Get movies
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
  return {
    promises: [countPromise, dataPromise],
    offset: offset,
  };
}

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

async function getMovieDetails(knex, imdbID) {
  const selectFields = selectQueryFromMap(MOVIE_DETAILS_MAP);

  const raw = await knex("basics")
    .join("principals", "principals.tconst", "basics.tconst")
    .select(selectFields)
    .where("basics.tconst", imdbID)
    .then((results) => {
      return results;
    });

  if (raw.length === 0) {
    throw new Error("No record exists of a movie with this ID");
  }

  return {
    title: raw[0].title,
    year: raw[0].year,
    runtime: raw[0].runtime,
    genres: raw[0].genres.split(","),
    country: raw[0].country,
    principals: raw.map((row) => {
      return {
        id: row.id,
        category: row.category,
        name: row.name,
        characters: row.characters.split(","),
      };
    }),
    ratings: [
      {
        source: "Internet Movie Database",
        value: raw[0].imdbRating,
      },
      {
        source: "Rotten Tomatoes",
        value: raw[0].rottenTomatoesRating,
      },
      {
        source: "Metacritic",
        value: raw[0].metacriticRating,
      },
    ].filter((rating) => rating.value !== null),
    boxoffice: raw[0].boxoffice,
    poster: raw[0].poster,
    plot: raw[0].plot,
  };
}

router.get("/search", function (req, res, next) {
  // Get the title, year and page from the query
  const title = req.query.title;
  const year = req.query.year;
  const page = req.query.page || 1; // default to 1

  // Get the knex instance from the request
  const knex = req.db;
  const { promises, offset } = searchMovies(knex, title, year, page);

  Promise.all(promises)
    .then((results) => {
      // movies promise results are in the second element
      const movies = results[1];
      // calculate pagination
      const pagination = {
        total: results[0][0].count,
        lastPage: Math.ceil(results[0][0].count / PER_PAGE),
        perPage: PER_PAGE,
        currentPage: page,
        from: offset,
        to: offset + movies.length,
      };

      res.json({
        data: movies,
        pagination: pagination,
      });
    })
    .catch((error) => {
      res.status(400).json({ error: true, message: error.message });
    });
});

router.get("/data/:imdbID", function (req, res, next) {
  const imdbID = req.params.imdbID;
  const knex = req.db;

  getMovieDetails(knex, imdbID).then((results) => {
    res.json(results);
  });
});

module.exports = router;
