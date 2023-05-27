var express = require('express')
var fs = require('fs')
var app = express();

var port = 500
var xyz = 5000
var abc = 50000
var def = 500000

var bug = 28


fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
