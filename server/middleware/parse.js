module.exports = function (parser, skipOnError = true) {
  return (req, res, next) => {
    // If there is an error, skip to the next middleware
    if (req.error && skipOnError) return next();
    try {
      req.queryParams = parser(req);
    } catch (error) {
      req.error = error;
    } finally {
      next();
    }
  };
};