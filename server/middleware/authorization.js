const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    if (!("authorization" in req.headers)
        || !req.headers.authorization.match(/^Bearer /)
    ) {
        req.error = { code: 401, message: "Authorization header ('Bearer token') not found" };
        return next();
    }
    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        req.authorization = jwt.decode(token);
    } catch (e) {
        console.log(e);
        if (e.name === "TokenExpiredError") req.error = { code: 401, message: "JWT token has expired" }; 
        else req.error = { code: 401, message: "Invalid JWT token" };
    } finally {
        next();
    }
};