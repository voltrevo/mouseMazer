'use strict'

let express = require('express')
let browserify = require('browserify-middleware')

browserify.settings({
    transform: ['babelify']
})

let app = express()

app.use('/demo.js', browserify(__dirname + '/demo.js'))
app.use(express.static(__dirname + '/public'))

app.listen(8080)
