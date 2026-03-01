import winston, { format,transports } from "winston";

const { combine,timestamp,json,errors } = format;

export const logger = winston.createLogger({
    level: "info",
    format: combine(timestamp(),errors({ stack: true }),json()),
    transports: [
        new transports.Console(),
        new transports.File({
            level: "error",
            filename: "../logs/error.log"
        }),
        new transports.File({
            level: "info",
            filename: "../logs/combine.log"
        }),
    ],
    exceptionHandlers: [
        new transports.File({
            filename: "../logs/exception.log"
        })
    ],
    rejectionHandlers: [
        new transports.File({
            filename: "../logs/rejection.log"
        })
    ]
})