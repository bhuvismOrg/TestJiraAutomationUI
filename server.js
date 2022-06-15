//Create node server and listen on port 3000
var express = require('express');
var crypto = require('crypto')
var cors = require('cors')
var mysql = require('mysql');
var bodyParser = require('body-parser');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

var app = express();
//app.use(cors())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());

//path to directory where html files are stored
app.use(express.static('views'));

app.get('/', function(req, res){
  res.sendFile('index.html');
});

const algorithmAES = 'aes-256-cbc';
const algorithmDES = 'des-ede3-cbc';

let keyAES = crypto.randomBytes(32)
let keyDES = crypto.randomBytes(24)

keyAES = crypto.createHash('sha256').update(String(keyAES)).digest('base64').substr(0,32)
keyDES = crypto.createHash('sha256').update(String(keyDES)).digest('base64').substr(0,24)

// encrypt function - AES
const encryptAES = (buffer) => {
  let iv = crypto.randomBytes(16)
  

  const cipher = crypto.createCipheriv(algorithmAES,keyAES,iv);
  
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])
  console.log(result);
  return result;
}

// encrypt function - DES
const encryptDES = (buffer) => {
  let iv = crypto.randomBytes(8)
  

  const cipher = crypto.createCipheriv(algorithmDES,keyDES,iv);
  const result = Buffer.concat([iv, cipher.update(buffer),cipher.final()])

  return result;
}

//decrypt function - AES
const decryptAES = (encrypted,key) => {
  // get iv : the first 16 bytes
  let iv = encrypted.slice(0,16)
  console.log(iv);
  // get the rest
  encrypted = encrypted.slice(16)
  console.log(encrypted);

  const decipher = crypto.createDecipheriv(algorithmAES,key,iv);

  const result = Buffer.concat([decipher.update(encrypted), decipher.final()])
  
  return result;
}


//decrypt function - DES
const decryptDES = (encrypted,key) => {
  // get iv : the first 16 bytes
  let iv = encrypted.slice(0,8)
  // get the rest
  encrypted = encrypted.slice(8)

  const decipher = crypto.createDecipheriv(algorithmDES,key,iv);

  const result = Buffer.concat([decipher.update(encrypted),decipher.final()])
  return result;
}

// EncryptCall **
app.post('/upload', function(req, res){
  var name = req.body.user.name;
  var base64 = req.body.user.base64
  var beforeBase64 = req.body.user.beforeBase64
 // console.log(name,base64,beforeBase64);

  console.log("Length => "+ base64.length);

  var data1 = base64.slice(0,base64.length/2);
  var data2 = base64.slice(base64.length/2,base64.length);

 // console.log("Len Data1 => "+data1);
 // console.log("Len Data2 => "+data2);
  
  let encryptedAES = encryptAES(data1).toString('hex');
  console.log("encryptedAES => " +encryptedAES.length);

 let encryptedDES = encryptDES(data2).toString('hex');
 console.log("encryptedDES => " +encryptedDES.length);

  con.connect(function(err){
    if(err) throw err;
    var sql = `INSERT INTO info(name,beforeBase64,en1,en2,keyAES,keyDES) VALUES('${name}','${beforeBase64}','${encryptedAES}','${encryptedDES}','${keyAES}','${keyDES}')`;
    con.query(sql, function(err, result){
      if(err) throw err;
      console.log("Inserted");
      let responseJSON = {
        response:"Uploaded", 
      }
      res.send(responseJSON)
  })
  })

  
});

// DecryptCall **
app.get('/decrypt', function(req,res){
  var base64Url = '';
  var filename;
  var responseJSON;
  con.connect( function(err){
    if(err) throw err;
    var sql = 'SELECT * FROM info where id=18';
    con.query(sql, function(err, result){
      if(err) throw err;
      console.log(result);
      let name = result[0].name;
      let beforeBase64 = result[0].beforeBase64;
      let en1 = result[0].en1;
      let en2 = result[0].en2;
      let key1 = result[0].keyAES;
      let key2 = result[0].keyDES;

      console.log(name,beforeBase64,en1 ,en2);

    console.log(en1.length, en2.length);
      let en1Buffer = Buffer.from(en1,'hex')
      console.log(en1Buffer.length);
      let decryptedAES = decryptAES(en1Buffer,key1);
      console.log("decryptedAES => "+decryptedAES); 

      let en2Buffer = Buffer.from(en2,'hex')
      console.log(en2Buffer.length);
      let decryptedDES = decryptDES(en2Buffer,key2);
      console.log("decryptedDES => "+decryptedDES)

      base64Url = beforeBase64 + ',' + decryptedAES + decryptedDES;
      filename = name;
      
      
      responseJSON = {
        link:base64Url,
        name:filename
      }
      responseJSON = JSON.stringify(responseJSON)
      console.log(responseJSON);
      res.send(responseJSON)
      
  })
  
  })
  
 
})

// Register ***
app.post('/register', function(req,res){
  var name = req.body.user.name;
  var email = req.body.user.email;
  var password = req.body.user.pass2;
  var number = req.body.user.number;

  console.log(name,number);

  con.connect( function(err){
    if(err) throw err;
    var sql = `INSERT INTO users(name,email,password,number) VALUES('${name}','${email}','${password}','${number}')`;
    con.query(sql, function(err, result){
      if(err) throw err;
      let responseJSON = {
        response:"Inserted",
        
      }
      res.send(responseJSON)
      
  })
  
  })
})

// Login ***
app.post('/login',function(req,res){
  var email = req.body.user.email;
  var password = req.body.user.password;

  console.log(email,password);

  var sql = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
  con.query(sql, function(err,result){
    if(err) throw err;
    console.log(result.length);
    if(result.length > 0){
      let responseJSON = {
        response:"Verified", 
      }
      res.send(responseJSON)

    } else {
      responseJSON = {
        response:"Not Verified",
      }
      res.send(responseJSON);
    }
  })
})

app.listen(3000);