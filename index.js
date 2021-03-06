"use strict"
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const MongoClient = require('mongodb').MongoClient
var session = require('cookie-session');
var crypto_qr = require('./crypto-qr')

const config = require('./config.json');
const app_config = config.production;

var app = express();

app.enable('trust proxy');
app.use(express.static('public/'));
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

var expiryDate = new Date(Date.now() + app_config.COOKIE_AGE);
app.use(session({
  name: 'session',
  keys: ['key1abc', 'key2def'],
  cookie: {
    secure: false,
    httpOnly: true,
    domain: 'qr-attendance',
    expires: expiryDate,
    maxAge: app_config.COOKIE_AGE
  }
}))

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

//route
app.get('/', function(req, res)
{
  if (req.session.cookie_abc)
    console.log(req.session.cookie_abc)
  else
    req.session.cookie_abc = {name : 'hello1'};
  res.render('index');
});

app.get('/create-lesson', function(req, res)
{
  if (req.query.lesson){
    res.render('create-lesson', {lessonName: req.query.lesson});
  }
  else
    res.render('create-lesson');
});

app.post('/create-lesson', function(req, res)
{
  db.createCollection(req.body.name, function(err, res) {
    if (err) {
      console.log("collection exist");
      throw err;
    }
    console.log("Collection created!");
  });

  res.render('qr-page', {'lessonName' : req.body.name});
});

app.post('/get-qr-string', function(req, res)
{
  if(req.body.name){
    var objEn = {};
    objEn.name = req.body.name;
    objEn.datetime = Date.now();
    var fullUrl = req.protocol + '://' + req.get('host');
    //var strEn = "http://192.168.1.79:3000/signin?signin=" + crypto_qr.encrypt(JSON.stringify(objEn))
    var strEn = fullUrl + "/signin?signin=" + crypto_qr.encrypt(JSON.stringify(objEn));
    //console.log(strEn);
    res.send(strEn);
  }
  else
    res.status(500).send({ error: 'Something blew up - get QR string' });
});

app.get('/signin', (req, res) => {
  if (!req.query.signin){
    res.status(500).send({ error: 'Something blew up - sign in' });
    return;
  }

  var objSignIn = JSON.parse(crypto_qr.decrypt(req.query.signin));
  if( (Date.now() - objSignIn.datetime) > app_config.TIME_LIMIT){
    res.status(500).send({ error: 'QR code expired!' });
    return;
  }

  if (req.session.signIn)
  {
    //console.log(req.session.signIn);
    objSignIn.userName = req.session.signIn.userName;
    objSignIn.adminNo = req.session.signIn.adminNo;
    req.session.signIn.userName = objSignIn.userName;
    req.session.signIn.adminNo = objSignIn.adminNo;
  }
  else if(req.cookies.userName)
  {
    //console.log(req.cookies.userName);
    objSignIn.userName = req.cookies.userName;
    objSignIn.adminNo = req.cookies.adminNo;  
    res.cookie('userName', objSignIn.userName, { maxAge: app_config.COOKIE_AGE, httpOnly: true });
    res.cookie('adminNo', objSignIn.adminNo, { maxAge: app_config.COOKIE_AGE, httpOnly: true });
  }
  objSignIn.agent = req.header('user-agent');

  res.render('sign-in', {'objSignIn' : objSignIn});

});

app.post('/register', function(req, res)
{
  if(req.body.name && req.body.admin){
    var objReg = {};
    objReg.userName = req.body.name;
    objReg.adminNo = req.body.admin;
    req.session.signIn = objReg;
    res.cookie('userName', req.body.name, { maxAge: app_config.COOKIE_AGE, httpOnly: true });
    res.cookie('adminNo', req.body.admin, { maxAge: app_config.COOKIE_AGE, httpOnly: true });

    var dateSignUp = new Date();
    objReg.dateSignUp = dateSignUp;

    db.collection(app_config.SIGN_UP_COLLECTION).insertOne(objReg, (err, result) => {
      if (err) return console.log(err)
      res.status(200).end("success");
    })
  }
  else
  {
    res.status(500).send({ error: 'Something blew up - register' });
  }
});

app.post('/update-db', function(req, res)
{
  if(req.body.lessonName && req.body.datetime &&
    req.body.name && req.body.admin &&
    req.body.geoLong && req.body.geoLat &&
    req.body.agent
    ){
      var objData = {};
      var dateIn = new Date();
      dateIn.setTime(req.body.datetime);
      var lessonName = req.body.lessonName;
      objData.userName = req.body.name;
      objData.adminNo = req.body.admin;
      objData.datetime = dateIn;
      objData.geoLong = req.body.geoLong;
      objData.geoLat = req.body.geoLat;
      objData.agent = req.body.agent;

      var query = { adminNo: objData.adminNo };
      var mysort = { datetime: -1 };
      db.collection(lessonName).find(query).sort(mysort).toArray(function(err, result) {
        if (err) throw err;
        if(result)
          if(result[0])
            if((objData.datetime - result[0].datetime) < (1000 * 60 * 10))
            {
              res.status(500).send("Entry found!");
              //console.log("too fast");
              return;
            }

        db.collection(lessonName).insertOne(objData, (err, result) => {
          if (err) return console.log(err)
          objData.datetime = req.body.datetime;
          res.status(200).send(objData);
          //res.status(200).send(JSON.stringify(objData));
          //res.status(200).end("success");
        })        
      });
  }
  else
  {
    var strErr = "";

    if(!req.body.lessonName)
      strErr += "lesson name ";
    if(!req.body.datetime)
      strErr += "datetime ";
    if(!req.body.name)
      strErr += "name ";
    if(!req.body.admin)
      strErr += "admin ";
    if(!req.body.geoLong)
      strErr += "geoLong ";
    if(!req.body.geoLat)
      strErr += "geoLat ";
    if(!req.body.agent)
      strErr += "agent ";

    res.status(500).send(strErr + "information missing..");
  }
});

app.get('/query', (req, res) => {
  var cursor = db.collection('test_collection').find().toArray(function(err, results) {
    console.log(results)
    res.redirect('/')
  })
})


//Start server
var server_port = process.env.PORT || 3000;
app.listen(server_port, function()
{
  console.log('Listening on port %d', server_port);
});

//Other functions

var db
//var db_uri = process.env.MONGODB_URI || app_config.DB_URI
var db_uri = app_config.DB_URI
console.log(db_uri);
MongoClient.connect(db_uri, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)
  db = client.db(app_config.DB_NAME) // whatever your database name is
})

//var objTest = {};
//objTest.name = "helloworld";
//objTest.datetime = Date.now();
//console.log(JSON.stringify(objTest));

//var en = crypto_qr.encrypt(JSON.stringify(objTest));
//var de = crypto_qr.decrypt(en);
//console.log(en);
//console.log(de);

//code for checking collection exist.
/*
  db.collection('no_such').findOne({}, (err, result) => {
    if (err){
      return console.log(err);
    }
    if (result)
      console.log(result);
    else
      console.log("nothing");
  })
*/
