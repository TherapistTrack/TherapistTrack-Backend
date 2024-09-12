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

  return (
    // The `` call might be on an JS SDK v2 client API.
    // If yes, please remove . If not, remove this comment.
    s3.upload(params)
  )
}

exports.s3Delete = (key) => {
  const params = {
    Bucket: bucket,
    Key: key
  }

  return (
    // The `` call might be on an JS SDK v2 client API.
    // If yes, please remove . If not, remove this comment.
    s3.deleteObject(params)
  )
}

exports.s3Download = (key) => {
  const params = {
    Bucket: bucket,
    Key: key
  }

  return (
    // The `` call might be on an JS SDK v2 client API.
    // If yes, please remove . If not, remove this comment.
    s3.getObject(params)
  )
}
