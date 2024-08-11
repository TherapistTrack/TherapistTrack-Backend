require('dotenv').config()

const corsMiddleware = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
  const allowedContentTypes = process.env.ALLOWED_CONTENT_TYPES.split(',')
  const allowedMethods = process.env.ALLOWED_METHODS.split(',')
  const allowedHeaders = process.env.ALLOWED_HEADERS.split(',')

  const origin = req.headers.origin
  const contentType = req.headers['content-type']

  if (req.method === 'OPTIONS') {
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Access-Control-Allow-Methods', allowedMethods.join(','))
      res.header('Access-Control-Allow-Headers', allowedHeaders.join(','))
      return res.sendStatus(200)
    } else {
      return res.status(403).json({ error: 'Origen no permitido por CORS' })
    }
  }

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  } else {
    return res.status(403).json({ error: 'Origen no permitido por CORS' })
  }

  if (contentType && !allowedContentTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Content-Type no permitido' })
  }

  res.header('Access-Control-Allow-Headers', allowedHeaders.join(','))
  res.header('Access-Control-Allow-Methods', allowedMethods.join(','))

  next()
}

module.exports = corsMiddleware
