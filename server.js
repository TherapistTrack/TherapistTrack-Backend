require('dotenv').config()
const express = require('express')
const loggingMiddleware = require('./middlewares/loggingMiddleware')
const corsMiddleware = require('./middlewares/corsMiddleware')
const connectDB = require('./config/dbConfig')
const { checkJwt } = require('./middlewares/auth0Middleware')

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

  // Use Routes
  app.use('/users', userRoutes)
  app.use('/files', fileRoutes)
  app.get('/health', async (req, res) => {
    res.status(200).send({ message: 'API is up!' })
  })

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  // Start the Server
  const PORT = process.env.API_PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

main()
