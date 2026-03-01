import winston, { format,transports } from "winston";

const { combine,timestamp,json,errors } = format;

export const logger = winston.createLogger({
    level: "info",
    format: combine(timestamp(),errors({ stack: true }),json()),
    transports: [
        new transports.Console(),
        new transports.File({
            level: "error",
            filename: "src/logs/error.log"
        }),
        new transports.File({
            level: "info",
            filename: "src/logs/combine.log"
        }),
    ],
    exceptionHandlers: [
        new transports.File({
            filename: "src/logs/exception.log"
        })
    ],
    rejectionHandlers: [
        new transports.File({
            filename: "src/logs/rejection.log"
        })
    ]
})