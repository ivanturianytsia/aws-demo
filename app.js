const express = require('express')
const cors = require('cors')

const config = require('./lib/config.js')
const handler = require('./lib/handler.js')

const app = express()

app.use(cors())

app.get('/', handler.list)
app.post('/upload', handler.upload)

app.listen(config.port, () => console.log(`App is up and running on port http://localhost:${config.port}`))
