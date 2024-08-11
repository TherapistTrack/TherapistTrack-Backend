const corsMiddleware = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
  const allowedContentTypes = process.env.ALLOWED_CONTENT_TYPES.split(',')
  const allowedMethods = process.env.ALLOWED_METHODS.split(',')
  const allowedHeaders = process.env.ALLOWED_HEADERS.split(',')

  const origin = req.headers.origin
  const contentType = req.headers['content-type']

  // Manejo de preflight request (OPTIONS)
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

  // Verificación del origen
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origen no permitido por CORS' })
  }

  // Verificación del método HTTP
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // Verificación de Content-Type
  if (contentType && !allowedContentTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Content-Type no permitido' })
  }

  // Verificación de encabezados permitidos
  const requestHeaders = Object.keys(req.headers)
  const disallowedHeaders = requestHeaders.filter(
    (header) => !allowedHeaders.includes(header)
  )

  if (disallowedHeaders.length > 0) {
    return res
      .status(400)
      .json({ error: 'Encabezados no permitidos', headers: disallowedHeaders })
  }

  // Configuración de los encabezados CORS
  res.header('Access-Control-Allow-Origin', origin)

  next()
}

module.exports = corsMiddleware
