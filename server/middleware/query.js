/**
 * Create a middleware function that runs a query and stores the results in req.results
 * @param {*} query The query to run, which should return a promise and must take knex as the first parameter
 * @param {*} skipOnError If true, the middleware will skip to the next middleware if there is an error
 * @returns A middleware function
 */
module.exports = function (query, skipOnError = true) {
  return function (req, res, next) {
    // If there is an error, skip to the next middleware
    if (req.error && skipOnError) return next();
    // Otherwise, run the query
    query({ knex: req.db, ...req.queryParams }).then((results) => {
      req.results = results;
    }).catch((error) => {
      console.log(error);
      req.error = error;
    }).finally(() => {
      next();
    });
  };
};