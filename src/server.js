'use strict'

let express = require('express')
let browserify = require('browserify-middleware')

browserify.settings({
    transform: ['babelify']
})

let app = express()

app.use('/index.js', browserify(__dirname + '/index.js'))
app.use(express.static(__dirname + '/public'))

app.listen(8080)
