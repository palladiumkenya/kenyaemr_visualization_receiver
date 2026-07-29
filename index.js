const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("express-async-errors");
require("dotenv").config();
const logger = require("./logger");

const receiver = require("./routes/receiver");
const dataset = require("./routes/dataset");
const spot = require("./routes/spot");


// Raise the body-parser limit above the 100kb default; facility payloads can be
// large. Configurable via BODY_LIMIT (default 50mb).
const BODY_LIMIT = process.env.BODY_LIMIT || "50mb";
app.use(bodyParser.json({ limit: BODY_LIMIT }));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: BODY_LIMIT
}));

// Log all incoming requests at debug level
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl} - ip: ${req.ip} - body: %o`, req.body);
    next();
});

app.use('/superset',receiver);
app.use('/api/v2/dataset', dataset);
app.use('/spot', spot);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    logger.info(`Kenya EMR 3.x Data Receiver App started. Listening on Port: ${PORT}`)
);
