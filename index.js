var express = require('express')
var fs = require('fs')
var app = express();

var port = 100
var xyz = 1000
var abc = 10000
var def = 100000

fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
