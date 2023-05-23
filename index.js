var express = require('express')
var fs = require('fs')
var app = express();

var port = 400
var xyz = 4000
var abc = 40000


fs.appendFile("./uploads/b.txt", "bande", (err,data) => {
    if(err) console.log(err)
    console.log("written")
})

app.listen(3000)
