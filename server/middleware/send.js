module.exports = function (req, res, next) {
  if (req.error) {
    return res.status(req.error.code).json({ error: true, message: req.error.message });
  }
  else {
    return res.status(req.results.code || 200).json(req.results)
  }
};