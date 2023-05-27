var express = require('express')
var fs = require('fs')
var app = express();

var port = 600
var xyz = 6000
var abc = 60000
var def = 600000

var bug = 26


fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
