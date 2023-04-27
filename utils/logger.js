const winston = require('winston')
const { combine, timestamp, label, printf, colorize, prettyPrint  } = winston.format

const customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`
})

const requestLogger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'alps-drive.log'})
    ],
    format: combine(
        colorize(),
        prettyPrint(),
        label({label: 'REQUEST'}),
        timestamp(),
        customFormat
    )
})

module.exports = {
    requestLogger
}