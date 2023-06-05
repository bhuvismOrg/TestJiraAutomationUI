var express = require('express')
var fs = require('fs')
var app = express();

var port = 900
var xyz = 9000
var abc = 90000
var def = 900000


var bug = 76
var subtask = 66


fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
