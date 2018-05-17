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
  var data = new Buffer('');
  req.on('data', function(chunk) {
      data = Buffer.concat([data, chunk]);
  });
  req.on('end', async function() {
    if (data.length === 0) {
      res.status(400).send('No files were uploaded.')
      return
    }
    res.send({
      status: "OK"
    })
  
    const fileName = 'image.jpg'

    try {
      const s3res = await S3.upload({
        Bucket: config.aws.bucket, // your s3 bucket name
        Key: `images/${fileName}`,
        Body: data,
        ACL: 'public-read'
      }).promise()
      
      // s3res.Location 
      // URL - send this to Google Vision
      const googleRes = await annotate(s3res.Location)
  
      const s3res2 = await S3.upload({
        Bucket: config.aws.bucket, // your s3 bucket name
        Key: `images/${fileName}.json`,
        Body: JSON.stringify(googleRes.data),
        ACL: 'public-read'
      }).promise()
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  });

  
}

const list = async (req, res) => {
  const s3res = await S3.listObjects({
    Bucket: config.aws.bucket, // your s3 bucket name
    Prefix: 'images/',
    Delimiter: ''
  }).promise()

  res.send(s3res)
}

module.exports = {
  upload,
  list
}
