module.exports = function (query, skipOnError = true) {
  return (req, res, next) => {
    // If there is an error, skip to the next middleware
    if (req.error && skipOnError) return next();
    // Otherwise, run the query
    query({ knex: req.db, ...req.queryParams }).then((results) => {
      req.results = results;
    }).catch((error) => {
      req.error = error;
    }).finally(() => {
      next();
    });
  };
};