const mongoose = require('mongoose')

const connectDB = async () => {
  const user = process.env.DB_USER
  const password = process.env.DB_USER_PASSWORD
  const dbName = process.env.DB_NAME
  const host = process.env.DB_HOST
  const port = process.env.DB_PORT
  const dbUri = `mongodb://${user}:${password}@${host}:${port}/${dbName}`
  try {
    await mongoose.connect(dbUri)
    console.log('Successfully connected to MongoDB')

    const { readyState } = mongoose.connection
    if (readyState === 1) {
      console.log('MongoDB is connected')
    } else {
      console.error('Failed to connect to MongoDB: State is', readyState)
      process.exit(1)
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection')
  await mongoose.connection.close()
  console.log('MongoDB connection closed')
  process.exit(0)
})

module.exports = connectDB
