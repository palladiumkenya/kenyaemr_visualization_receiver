const jwt = require("jsonwebtoken");
require("dotenv").config();
const logger = require("../logger");

// Verifies a shared-secret Bearer JWT (signed with ACCESS_JWT_SECRET).
function jwtAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        logger.warn(`Unauthorized request to ${req.originalUrl} - missing bearer token (ip: ${req.ip})`);
        return res.status(401).json({ success: false, msg: "Unauthorized" });
    }

    try {
        req.auth = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
        return next();
    } catch (error) {
        logger.warn(`Unauthorized request to ${req.originalUrl} - ${error.message} (ip: ${req.ip})`);
        return res.status(401).json({ success: false, msg: "Unauthorized" });
    }
}

module.exports = { jwtAuth };
