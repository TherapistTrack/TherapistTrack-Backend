const s3 = require('../models/s3ClientModel')

exports.s3Upload = (key, body) => {
  console.log('Bucket Name:', process.env.AWS_BUCKET_NAME)
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: body
  }

  return s3.upload(params).promise()
}

exports.s3Delete = (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  }

  return s3.deleteObject(params).promise()
}

exports.s3Download = (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  }

  return s3.getObject(params).promise()
}
