const os = require('os')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, json } = format

const logger = createLogger({
  format: combine(timestamp(), json()),
  transports: [
    process.env.LOGGING_METHOD === 'FILE'
      ? new transports.File({ filename: 'logs.txt' })
      : new transports.Console()
  ]
})

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now()
  const THRESHOLD = 500;

  res.on('finish', () => {
    const logEntry = {
      utcTime: new Date().toISOString(),
      hostName: os.hostname(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      millisecondsTaken: Date.now() - startTime,
      millisecondsThreshold: THRESHOLD,
      isSlow: Date.now() - startTime > THRESHOLD
    }

    logger.info(logEntry)
  })

  next()
}

module.exports = loggingMiddleware
