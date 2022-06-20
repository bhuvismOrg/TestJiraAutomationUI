//Create node server and listen on port 3000
var express = require('express');
var crypto = require('crypto')
var cors = require('cors')
var mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const AWS = require('aws-sdk');
require('dotenv').config();
var uuid = require('uuid')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const fileName = uuid.v4()+'.txt';

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/views'));


var sess,emails,fid;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});


//app.use(cors())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());


//path to directory where html files are stored
app.use(express.static('views'));



const algorithmAES = 'aes-256-cbc';
const algorithmAES2 = 'aes-128-cbc';
const algorithmAES3 = 'aes-192-cbc';

let keyAES = crypto.randomBytes(32)
let keyAES2 = crypto.randomBytes(16)
let keyAES3 = crypto.randomBytes(24)

keyAES = crypto.createHash('sha256').update(String(keyAES)).digest('base64').substr(0,32)
keyAES2 = crypto.createHash('sha256').update(String(keyAES2)).digest('base64').substr(0,16)
keyAES3 = crypto.createHash('sha256').update(String(keyAES2)).digest('base64').substr(0,24)

// encrypt function - AES - 256
const encryptAES = (buffer) => {
  let iv = crypto.randomBytes(16)
  

  const cipher = crypto.createCipheriv(algorithmAES,keyAES,iv);
  
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])
  console.log(result);
  return result;
}

// encrypt function - AES - 128
const encryptAES2 = (buffer) => {
  let iv = crypto.randomBytes(16)
  

  const cipher = crypto.createCipheriv(algorithmAES2,keyAES2,iv);
  const result = Buffer.concat([iv, cipher.update(buffer),cipher.final()])

  return result;
}

// encrypt function - AES - 192
const encryptAES3 = (buffer) => {
  let iv = crypto.randomBytes(16)
  

  const cipher = crypto.createCipheriv(algorithmAES3,keyAES3,iv);
  const result = Buffer.concat([iv, cipher.update(buffer),cipher.final()])

  return result;
}

//decrypt function - AES - 256
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


//decrypt function - AES - 128
const decryptAES2 = (encrypted,key) => {
  // get iv : the first 16 bytes
  let iv = encrypted.slice(0,16)
  // get the rest
  encrypted = encrypted.slice(16)

  const decipher = crypto.createDecipheriv(algorithmAES2,key,iv);

  const result = Buffer.concat([decipher.update(encrypted),decipher.final()])
  return result;
}

//decrypt function - AES - 192
const decryptAES3 = (encrypted,key) => {
  // get iv : the first 16 bytes
  let iv = encrypted.slice(0,16)
  // get the rest
  encrypted = encrypted.slice(16)

  const decipher = crypto.createDecipheriv(algorithmAES3,key,iv);

  const result = Buffer.concat([decipher.update(encrypted),decipher.final()])
  return result;
}

router.get('/', function(req, res){
  sess = req.session;
 
  if(sess.userid){
    
    res.sendFile('second.html',{root: 'views'})
  } else{
    
    res.sendFile('first.html',{root: 'views'})
  } 
  
});

function uploadToS3(req,res){
  console.log("in UploadToS3");
  let data = {
    keyAES:keyAES,
    keyAES2:keyAES2,
    keyAES3:keyAES3
  }
  const params = {
    Bucket: 'bhuvanjain-test-bucket', // pass your bucket name
    Key: fileName , // file will be saved as testBucket/contacts.csv
    Body: JSON.stringify(data, null, 2)
};
// s3.getObject(params, function(s3Err, data){
//   if (s3Err) throw s3Err;
//   console.log(JSON.parse(data.Body.toString()).keyAES);
// })
s3.upload(params, function(s3Err, data){
  if (s3Err) throw s3Err;
  console.log(`File uploaded successfully at ${data.Location}`)
  res.send(data.Location);
})
}

// EncryptCall **
router.post('/upload', function(req, res){
  sess = req.session;
  // let avatar = req.files.avatar;
  // console.log("file"+avatar);
  var name = req.body.user.name;
  var base64 = req.body.user.base64
  var beforeBase64 = req.body.user.beforeBase64

  if(sess.userid){
    console.log(sess.userid);
  } else {
    console.log("NULL");
  }
  
 // console.log(name,base64,beforeBase64);

  console.log("Length => "+ base64.length);

  var data1 = base64.slice(0,base64.length/3);
  var data2 = base64.slice(base64.length/3,2*base64.length/3);
  var data3 = base64.slice(2*base64.length/3,base64.length)

 // console.log("Len Data1 => "+data1);
 // console.log("Len Data2 => "+data2);
  
  let encryptedAES = encryptAES(data1).toString('hex');
  console.log("encryptedAES => " +encryptedAES.length);

 let encryptedAES2 = encryptAES2(data2).toString('hex');
 console.log("encryptedAES2 => " +encryptedAES2.length);

 let encryptedAES3 = encryptAES3(data3).toString('hex');
 console.log("encryptedAES3 => " +encryptedAES3.length);

 let data = {
  keyAES:keyAES,
  keyAES2:keyAES2,
  keyAES3:keyAES3
}
const params = {
  Bucket: 'project2022final', // pass your bucket name
  Key: fileName , // file will be saved as testBucket/contacts.csv
  Body: JSON.stringify(data, null, 2)
};
// s3.getObject(params, function(s3Err, data){
//   if (s3Err) throw s3Err;
//   console.log(JSON.parse(data.Body.toString()).keyAES);
// })
s3.upload(params, function(s3Err, data){
if (s3Err) throw s3Err;
console.log(`File uploaded successfully at ${data.Location}`)
var sql = `INSERT INTO info(name,beforeBase64,en1,en2,en3,keyAES,userid) VALUES('${name}','${beforeBase64}','${encryptedAES}','${encryptedAES2}','${encryptedAES3}','${fileName}','${sess.userid}')`;
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
router.post('/decrypt', function(req,res){
  var fileId = req.body.user.fid
  var base64Url = '';
  var filename;
  var responseJSON;
  
    var sql = `SELECT * FROM info where id='${fileId}'`;
    con.query(sql, function(err, result){
      if(err) throw err;
      console.log(result);
      let name = result[0].name;
      let beforeBase64 = result[0].beforeBase64;
      let en1 = result[0].en1;
      let en2 = result[0].en2;
      let en3 = result[0].en3;
      let key = result[0].keyAES;
      let key1 = '';
      let key2 = '';
      let key3 = '';
      const params = {
        Bucket: 'project2022final', // pass your bucket name
        Key: key , // file will be saved as testBucket/contacts.csv
        
      };
      s3.getObject(params, function(s3Err, data){
        if (s3Err) throw s3Err;
        key1 = JSON.parse(data.Body.toString()).keyAES;
        key2 = JSON.parse(data.Body.toString()).keyAES2;
        key3 = JSON.parse(data.Body.toString()).keyAES3;
        console.log(JSON.parse(data.Body.toString()).keyAES);

        let en1Buffer = Buffer.from(en1,'hex')
        console.log(en1Buffer.length);
        let decryptedAES = decryptAES(en1Buffer,key1);
        console.log("decryptedAES => "+decryptedAES); 
  
        let en2Buffer = Buffer.from(en2,'hex')
        console.log(en2Buffer.length);
        let decryptedAES2 = decryptAES2(en2Buffer,key2);
        console.log("decryptedAES2 => "+decryptedAES2)
  
        let en3Buffer = Buffer.from(en3,'hex')
        console.log(en3Buffer.length);
        let decryptedAES3 = decryptAES3(en3Buffer,key3);
        console.log("decryptedAES3 => "+decryptedAES3)
  
        base64Url = beforeBase64 + ',' + decryptedAES + decryptedAES2 + decryptedAES3;
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
router.post('/register', function(req,res){
  var name = req.body.user.name;
  var email = req.body.user.email;
  var password = req.body.user.pass2;
  var number = req.body.user.number;

  console.log(name,number);

 
    var sql = `INSERT INTO users(name,email,password,number) VALUES('${name}','${email}','${password}','${number}')`;
    con.query(sql, function(err, result){
      if(err) throw err;
      let responseJSON = {
        response:"Inserted",
        
      }
      res.send(responseJSON)
      
  })
  
 
})

// Login ***
router.post('/login',function(req,res){
  var email = req.body.user.email;
  var password = req.body.user.password;

  

  var sql = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
  con.query(sql, function(err,result){
    if(err) throw err;
    
    if(result.length > 0){
      sess = req.session;
      sess.userid = result[0].id
      sess.name = result[0].name
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

// Logout **
router.get('/logout',function(req,res){
  
  req.session.destroy((err) => {
    if(err) {
        return console.log(err);
    } else {
      let responseJSON = {
        response:"LoggedOut", 
      }
      res.send(responseJSON)
    }
    
});
})

//retieve uploaded files
router.get('/retrieve',function(req,res){
    console.log("In Retrieve");
    if(sess.userid){
      var sql = `SELECT * FROM info WHERE userid='${sess.userid}' order by id desc`;
      con.query(sql, function(err, result){
        if(err) throw err;
        res.send(JSON.stringify(result));
      })
    } else {
      let responseJSON = {
        response:"LoggedOut"
      }
       res.send(JSON.stringify(responseJSON))
    }
    
})

// Get User Name
router.get('/getUserName', function(req,res){
  var sql = `SELECT * FROM users WHERE id='${sess.userid}'`;
  con.query(sql, function(err,result){
    res.send(JSON.stringify(result));
  })
})



//post the email to share
router.post('/retrieve1',function(req,res){
  console.log("In Retrieve1");

  emails= req.body.user.emails;
  fid=req.body.user.fid;
      let responseJSON = {
        response:"done", 
      }
      res.send(responseJSON)

 
})

//retrieve the details of a person from email
router.get('/retrieve2',function(req,res){
  console.log("In Retrieve2");
  var sql = `SELECT * FROM users WHERE email='${emails}'`;
  con.query(sql, function(err, result){
    if(err) throw err;
    res.send(JSON.stringify(result));
  })
})

//share the files to the required person by giving access 
router.post('/retrieve3',function(req,res){
    console.log("In Retrieve3");

    cid= req.body.user.cid;
    access=1;
    var sql = `INSERT INTO share(aid,cid,fid,access) VALUES('${sess.userid}','${cid}','${fid}','${access}')`;
    con.query(sql, function(err, result){
      if(err) throw err;
      let responseJSON = {
        response:"Given Access",
        
      }
      res.send(responseJSON)
      
  })
})

router.get('/getFilesSharedByMe', function(req,res){
  var sql = `SELECT * FROM share WHERE aid='${sess.userid}' order by id desc`;
  con.query(sql, function(err, result){
    if(err) throw err;
    res.send(JSON.stringify(result));
  })
})

router.post('/getNameAndFileName',function(req,res){
  var nameId = req.body.user.nameid;
  var fileId = req.body.user.fileid;

  var sql=`SELECT * from users WHERE id='${nameId}'`;
  con.query(sql, function(err,result){
    if(result.length > 0){
      var responseJson = [{
        name:result[0].name
      }]
      var sql2=`SELECT * FROM info WHERE id='${fileId}'`;
      con.query(sql2, function(err,result){
        if(result.length > 0){
          responseJson.push({filename:result[0].name})
          console.log(JSON.stringify(responseJson));
          res.send(JSON.stringify(responseJson))
      }
    })
    
    }
  })
})

router.get('/getFilesSharedToMe', function(req,res){
  var sql = `SELECT * FROM share WHERE cid='${sess.userid}' order by id desc`;
  con.query(sql, function(err, result){
    if(err) throw err;
    res.send(JSON.stringify(result));
  })
})

app.use('/', router);
app.listen(3000);