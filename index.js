var express = require('express')
var fs = require('fs')
var app = express();

var port = 700
var xyz = 7000
var abc = 70000
var def = 700000


var bug = 37
var subtask = 43


fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
