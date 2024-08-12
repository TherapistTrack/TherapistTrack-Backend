const s3 = require('../models/s3ClientModel')

exports.s3Upload = (key, body) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: body
  }

  return s3.upload(params).promise()
}

exports.s3Delete = (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  }

  return s3.deleteObject(params).promise()
}

exports.s3Download = (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  }

  return s3.getObject(params).promise()
}
