/**
 * Creates a middleware function that parses the request body and adds it to the request object
 * @param {*} parser The parser function to use
 * @param {*} skipOnError If true, the middleware will skip to the next middleware if there is an error
 * @returns A middleware function
 */
module.exports = function (parser, skipOnError = true) {
  return function(req, res, next) {
    // If there is an error, skip to the next middleware
    if (req.error && skipOnError) return next();
    try {
      req.queryParams = parser(req);
    } catch (error) {
      console.log(error);
      req.error = error;
    } finally {
      next();
    }
  };
};