"use strict"
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto_qr = require('./crypto-qr')
const MongoClient = require('mongodb').MongoClient

var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
/*
app.use(express.static('views/slick'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
*/

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

//route
app.get('/', function(req, res)
{
    res.render('index');
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
  db = client.db('heroku_gxqkhrvd') // whatever your database name is
})


//var en = crypto_qr.encrypt("abc");
//var de = crypto_qr.decrypt(en);
//console.log(en);
//console.log(de);


