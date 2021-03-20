const express = require('express')
const app = express()

const server = app.listen(3000, () => console.log('Server listening on port 3000'))
require('./socket').initialize(server)