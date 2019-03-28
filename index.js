"use strict"
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

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
  console.log('Listening on port %d', server_port)
});




