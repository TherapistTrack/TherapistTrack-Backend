const s3 = require('../models/s3ClientModel')
const { RUNNING_MODES } = require('../config/runningMode')

const RUNNING_MODE = process.env.RUNNING_MODE

let bucket
if (RUNNING_MODE == RUNNING_MODES.TEST) {
  bucket = process.env.AWS_BUCKET_NAME_TEST
} else {
  bucket = process.env.AWS_BUCKET_NAME
}

exports.s3Upload = (key, body) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: body
  }

  return s3.upload(params).promise()
}

exports.generateS3PreSignedUrl = async (key) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 3600
  }

  return s3.getSignedUrlPromise('getObject', params)
}

exports.s3Delete = (key) => {
  const params = {
    Bucket: bucket,
    Key: key
  }

  return s3.deleteObject(params).promise()
}

exports.s3Download = (key) => {
  const params = {
    Bucket: bucket,
    Key: key
  }

  return s3.getObject(params).promise()
}
