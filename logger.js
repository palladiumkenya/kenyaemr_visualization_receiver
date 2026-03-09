const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, errors, splat } = format;

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

const lineFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
    level: logLevel,
    format: combine(
        splat(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        lineFormat
    ),
    transports: [
        new transports.Console({
            format: combine(
                splat(),
                colorize({ all: true }),
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                errors({ stack: true }),
                lineFormat
            ),
        }),
        new transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        new transports.File({
            filename: "logs/combined.log",
        }),
    ],
});

module.exports = logger;
