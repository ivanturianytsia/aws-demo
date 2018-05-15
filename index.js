const express = require('express')
const fileUpload = require('express-fileupload')

const config = require('./lib/config.js')
const handler = require('./lib/handler.js')

const app = express()

app.use(fileUpload())

app.post('/upload', handler.upload)

app.listen(3000, () => console.log('App is up and running on port http://localhost:3000'))
