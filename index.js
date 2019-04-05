"use strict"
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto_qr = require('./crypto-qr')
const MongoClient = require('mongodb').MongoClient
var session = require('cookie-session');

const DB_NAME = 'heroku_gxqkhrvd';

var app = express();

app.use(express.static('public/'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var expiryDate = new Date(Date.now() + 365 * 60 * 60 * 1000) // 1 year
app.use(session({
  name: 'session',
  keys: ['key1abc', 'key2def'],
  cookie: {
    secure: true,
    httpOnly: true,
    domain: 'qr-attendance',
    expires: expiryDate
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
  res.render('create-lesson');
});

app.post('/create-lesson', function(req, res)
{

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
  if(req.body.name)
    res.send(crypto_qr.encrypt(req.body.name));
  else
    res.status(500).send({ error: 'something blew up' });
});


app.get('/signin', (req, res) => {
  var myobj = { name: "Company Inc", address: "Highway 37" };
  db.collection('test_collection').insertOne(myobj, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
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
var db_uri = process.env.MONGODB_URI || "mongodb://heroku_gxqkhrvd:ep411nrco53m0f6fkvhrvprvis@ds147274.mlab.com:47274/heroku_gxqkhrvd";
console.log(db_uri);
MongoClient.connect(db_uri, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)
  db = client.db(DB_NAME) // whatever your database name is
})


//var en = crypto_qr.encrypt("abc");
//var de = crypto_qr.decrypt(en);
//console.log(en);
//console.log(de);


