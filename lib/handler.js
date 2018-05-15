const https = require('https')
const path = require('path')
const AWS = require('aws-sdk')
const config = require('./config.js')

AWS.config.update({
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretKey
})
const S3 = new AWS.S3()

const annotate = async (imageLocation) => {
  return new Promise((resolve, reject) => {
    let options = {
      method: 'POST',
      hostname: 'vision.googleapis.com',
      port: 443,
      path: `/v1/images:annotate?key=${config.google.key}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    let data = []
    const request = https.request(options, response => {
      response.on('data', chunk => data.push(chunk))
      response.on('end', () =>
        resolve({
          headers: response.headers,
          statusCode: response.statusCode,
          data: JSON.parse(Buffer.concat(data).toString())
        })
      )
    })
    request.on('error', err => reject(err))

    request.write(JSON.stringify({
      "requests": [{
        "image": {
          "source": {
            "imageUri": imageLocation
          }
        },
        "features": [{
          "type": "TEXT_DETECTION",
          "maxResults": 1000
        }]
      }]
    }))
    request.end()
  })
}

const upload = async (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.')
  }

  // The name of the input field (i.e. 'file') is used to retrieve the uploaded file
  let file = req.files.file

  try {
    const s3res = await S3.upload({
      Bucket: config.aws.bucket, // your s3 bucket name
      Key: `images/${file.name}`,
      Body: file.data,
      ACL: 'public-read'
    }).promise()
    
    // s3res.Location 
    // URL - send this to Google Vision

    const googleRes = await annotate(s3res.Location)

    const s3res2 = await S3.upload({
      Bucket: config.aws.bucket, // your s3 bucket name
      Key: `images/${file.name}.json`,
      Body: JSON.stringify(googleRes.data),
      ACL: 'public-read'
    }).promise()

    res.send({ status: "OK" })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

module.exports = {
  upload
}
