var express = require('express')
var fs = require('fs')
var app = express()
var port = 3000
var xyz = 50000

fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
