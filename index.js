"use strict"
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto_qr = require('./crypto-qr')
const MongoClient = require('mongodb').MongoClient

var app = express();

app.use(express.static('public'));
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

//Start server
var server_port = process.env.PORT || 3000;
app.listen(server_port, function()
{
  console.log('Listening on port %d', server_port);
});

//Other functions

var db
var db_uri = process.env.MONGODB_URI || "mongodb://heroku_gxqkhrvd:1q1q1q!Q@ds147274.mlab.com:47274/heroku_gxqkhrvd";
console.log(db_uri);
MongoClient.connect(db_uri, (err, client) => {
  if (err) return console.log(err)
  db = client.db('heroku_gxqkhrvd') // whatever your database name is
})


//var en = crypto_qr.encrypt("abc");
//var de = crypto_qr.decrypt(en);
//console.log(en);
//console.log(de);


