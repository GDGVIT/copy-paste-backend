require('dotenv').config()
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})
const { join } = require('path')
const logger = require(join(__dirname, '..', '..', 'config', 'logger'))

const NAMESPACE = 'AWS S3 UPLOAD'

const upload = async (id, buffer, originalname) => {
  try {
    // check if image
    logger.info(NAMESPACE, 'Uploading image')
    const fileType = buffer.toString('hex', 0, 4).toLowerCase()
    if (fileType !== '89504e47') {
      return false
    }
    const fileExtension = originalname.split('.').pop()
    // upload image to s3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}-${id}.${fileExtension}`,
      Body: buffer
    }
    const data = await s3.upload(params).promise()
    return data
  } catch (err) {
    console.log(err)
    return false
  }
}

module.exports = upload
