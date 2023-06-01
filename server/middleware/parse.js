module.exports = function (parser) {
  return (req, res, next) => {
    try {
      req.queryParams = parser(req);
    } catch (error) {
      req.error = error;
    } finally {
      next();
    }
  };
};