const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/views'));

var sess; // global session, NOT recommended

router.get('/',(req,res) => {
    sess = req.session;
    if(sess.email) {
        return res.redirect('/admin');
    }
    res.sendFile('index.html');
});

router.get('/login',(req,res) => {
    sess = req.session;
    sess.email = "bhuvan@gmail.com";
    sess.userid = 1;
    res.end('done');
});

router.get('/admin',(req,res) => {
    sess = req.session;
    if(sess.email) {
        res.write(`<h1>Hello ${sess.email} ${sess.userid}h1><br>`);
        res.end(+'Logout');
    }
    else {
        res.write('Please login first')
        res.end(+'Login');
    }
});

router.get('/admin2',(req,res) => {
    sess = req.session;
    if(sess.email) {
        res.write(`<h1>Hello ${sess.email} ${sess.userid}h1><br>`);
        res.end(+'Logout');
    }
    else {
        res.write('Please login first2')
        res.end(+'Login');
    }
});

router.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});

app.use('/', router);

app.listen(process.env.PORT || 3000,() => {
    console.log(`App Started on PORT ${process.env.PORT || 3000}`);
});