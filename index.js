var express = require('express')
var fs = require('fs')
var app = express();

var port = 800
var xyz = 8000
var abc = 80000
var def = 800000


var bug = 60
var subtask = 66


fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
