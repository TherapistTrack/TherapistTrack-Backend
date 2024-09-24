require('dotenv').config()
const express = require('express')
const loggingMiddleware = require('./middlewares/loggingMiddleware')
const corsMiddleware = require('./middlewares/corsMiddleware')
const connectDB = require('./config/dbConfig')
const {
  InsufficientScopeError,
  UnauthorizedError
} = require('express-oauth2-jwt-bearer')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function main() {
  await sleep(process.env.DELAY_START)
  connectDB()
  const app = express()

  app.use([express.json(), loggingMiddleware, corsMiddleware])

  // Import Routes
  const userRoutes = require('./routes/userRoutes')
  const fileRoutes = require('./routes/fileRoutes')
  const patientTemplateRoutes = require('./routes/patientTemplateRoutes')

  // Use Routes
  app.use('/users', userRoutes)
  app.use('/files', fileRoutes)
  app.use('/doctor', patientTemplateRoutes)

  app.get('/health', async (req, res) => {
    res.status(200).send({ message: 'API is up!' })
  })

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    if (err instanceof UnauthorizedError) {
      return res
        .status(401)
        .json({ status: 401, message: 'Unauthorized. Invalid Token' })
    } else if (err instanceof InsufficientScopeError) {
      return res
        .status(401)
        .json({ status: 401, message: 'Unauthorized. Insufficiente Scope' })
    }
    console.error(err.stack)
    res
      .status(500)
      .json({ status: 500, message: 'Server error. Some operation went bad.' })
  })

  // Start the Server
  const PORT = process.env.API_PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

main()
