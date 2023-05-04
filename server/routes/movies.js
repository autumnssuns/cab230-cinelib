var express = require("express");
var router = express.Router();

/* --- GET movies listing. --- */
const PER_PAGE = 100;

function searchMovies(knex, title, year, page = 1) {
  // Year must be yyyy format
  if (year && !year.match(/^\d{4}$/)) {
    throw new Error("Invalid year format. Format must be yyyy.");
  }

  // Calculate offset for pagination
  const offset = (page - 1) * PER_PAGE;

  let countPromise, dataPromise;

  // Count total number of movies
  countPromise = knex("movies").count("imdbID as count");
  if (title) {
    countPromise = countPromise.where("title", "like", `%${title}%`);
  }
  if (year) {
    countPromise = countPromise.where("year", "like", `%${year}%`);
  }

  // Get movies
  dataPromise = knex("movies").select("*").limit(PER_PAGE).offset(offset);

  if (title) {
    dataPromise = dataPromise.where("title", "like", `%${title}%`);
  }
  if (year) {
    dataPromise = dataPromise.where("year", "like", `%${year}%`);
  }
  return {
    promises: [countPromise, dataPromise],
    offset: offset,
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

module.exports = router;
