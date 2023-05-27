var express = require('express')
var fs = require('fs')
var app = express();

var port = 400
var xyz = 4000
var abc = 40000
var def = 400000

var bug = 26


fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
