const AWS = require('aws-sdk')
const express = require('express')
const fileUpload = require('express-fileupload')
const app = express()
const path = require('path')
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
})
const S3 = new AWS.S3()
const bucketName = process.env.AWS_BUCKET
 
// default options
app.use(fileUpload())
 
app.post('/upload', async (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.')
  }

  // The name of the input field (i.e. "file") is used to retrieve the uploaded file
  let file = req.files.file

  try {
    const s3res = await S3.upload({
      Bucket: bucketName, // your s3 bucket name
      Key: `images/${file.name}`,
      Body: file.data, // concatinating all chunks
      ACL: 'public-read'
    }).promise()
    res.send({
      data: s3res,
      status: 'success',
      msg: 'Image successfully uploaded.'
    })
  } catch (err) {
    res.send({
      err,
      status: 'error'
    })
  }

  // // Use the mv() method to place the file somewhere on your server
  // file.mv(path.join(__dirname, file.name), function(err) {
  //   if (err) {
  //     return res.status(500).send(err)
  //   }
  // })
})

app.listen(3000, function () {
  console.log('Your app is up and running on port http://localhost:3000')
})
