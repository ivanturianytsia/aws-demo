require('dotenv').config()
const accessKey = process.env.AWS_ACCESS_KEY 
if (!accessKey) {
  throw 'AWS_ACCESS_KEY missing'
}
const secretKey = process.env.AWS_SECRET_KEY 
if (!secretKey) {
  throw 'AWS_SECRET_KEY missing'
}
const bucket = process.env.AWS_BUCKET 
if (!bucket) {
  throw 'AWS_BUCKET missing'
}
const key = process.env.GOOGLE_KEY 
if (!key) {
  throw 'GOOGLE_KEY missing'
}
const port = process.env.PORT 
if (!port) {
  throw 'PORT missing'
}

module.exports = {
  aws: {
    accessKey,
    secretKey,
    bucket
  },
  google: {
    key
  },
  port
}
