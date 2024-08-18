require('dotenv').config()
const express = require('express')
const cors = require('cors')
const loggingMiddleware = require('./middlewares/loggingMiddleware')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function main() {
  await sleep(process.env.DELAY_START)
  const app = express()
  app.use(express.json())
  app.use(cors())
  app.use(loggingMiddleware)

  // Import Routes
  const userRoutes = require('./routes/userRoutes')
  const fileRoutes = require('./routes/fileRoutes')
  const authRoutes = require('./routes/authRoutes')
  const recordRoutes = require('./routes/recordRoutes')

  // Use Routes
  app.use('/users', userRoutes)
  app.use('/files', fileRoutes)
  app.use('/auth', authRoutes)
  app.use('/records', recordRoutes)
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
