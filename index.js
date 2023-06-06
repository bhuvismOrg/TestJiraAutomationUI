var express = require('express')
var fs = require('fs')
var app = express();

var port = 300
var xyz = 3000
var abc = 30000
var def = 300000

fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
