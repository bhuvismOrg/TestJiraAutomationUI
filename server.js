//create node server and listen on port 3000
var express = require('express');
var fileupload = require('express-fileupload');
var crypto = require('crypto')
var splitFile = require('split-file')
var app = express();
//path to directory where html files are stored
app.use(express.static('views'));
app.use(fileupload());
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

  return result;
}

// encrypt function - DES
const encryptDES = (buffer) => {
  let iv = crypto.randomBytes(8)

  const cipher = crypto.createCipheriv(algorithmDES,keyDES,iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])

  return result;
}

//decrypt function - AES
const decryptAES = (encrypted) => {
  // get iv : the first 16 bytes
  let iv = encrypted.slice(0,16)
  // get the rest
  encrypted = encrypted.slice(16)

  const decipher = crypto.createDecipheriv(algorithmAES,keyAES,iv);

  const result = Buffer.concat([decipher.update(encrypted),decipher.final()])
  return result;
}


//decrypt function - DES
const decryptDES = (encrypted) => {
  // get iv : the first 16 bytes
  let iv = encrypted.slice(0,8)
  // get the rest
  encrypted = encrypted.slice(8)

  const decipher = crypto.createDecipheriv(algorithmDES,keyDES,iv);

  const result = Buffer.concat([decipher.update(encrypted),decipher.final()])
  return result;
}

//handle post file upload
app.post('/upload', function(req, res){
  
  let data = req.files.mypic.data.toString();
  console.log(req.files.mypic.data.toString('hex'))
  let size = req.files.mypic.size

  let data1 = data.slice(0,size/2)
  let data2 = data.slice(size/2,size)
  // let data3 = data.slice(2*size/3,size)

  console.log(data1)
  console.log("divided")
  console.log(data2)
  console.log("divided")
  console.log(data3)

  let encryptedAES = encryptAES(data1);
  console.log(encryptedAES.toString());

  let decryptedAES = decryptAES(encryptedAES).toString();
  console.log(decryptedAES.toString())

  let encryptedDES = encryptDES(data2);
  console.log(encryptedDES.toString());

  let decryptedDES = decryptDES(encryptedDES).toString();
  console.log(decryptedDES.toString())

  let result = encryptedAES + encryptedDES;
  console.log(result)
  console.log("ss")
  let res_data1 = result.slice(0,size/2)
  console.log(res_data1)
  console.log("ss")
  let res_data2 = result.slice(size/2,size)
  console.log(res_data2)

  console.log((res_data1+res_data2))
  
  res.send('uploaded');
});
app.listen(3000);