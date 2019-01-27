// Includes
const path = require('path');
const bodyParser = require('body-parser');

// Set up express
const express = require('express');
const app = express();
const PORT = process.argv[2] || 32100;

app.set('view engine', 'pug');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Main Website

app.get('/', function (req, res) {
   res.render('index');
});

// Bathroom API

let flights = {};

app.get('/bathroom/wait/:flight/:seat', function (req, res) {
   res.setHeader('Content-Type', 'application/json');
   let index = -1;
   if (!flights[req.params.flight]) flights[req.params.flight] = [];
   for (var i = 0; i < flights[req.params.flight].length; ++i) {
      if (flights[req.params.flight][i].seat == req.params.seat) {
         index = i;
         break;
      }
   }
   if (index == -1) {
      res.send(JSON.stringify({ time: flights[req.params.flight].length * 3}));
   } else {
      res.send(JSON.stringify({ time: index * 5}));
   }
});

app.get('/bathroom/position/:flight/:seat', function (req, res) {
   res.setHeader('Content-Type', 'application/json');
   let index = 999;
   if (!flights[req.params.flight]) flights[req.params.flight] = [];
   for (var i = 0; i < flights[req.params.flight].length; ++i) {
      if (flights[req.params.flight][i].seat == req.params.seat) {
         index = i;
         break;
      }
   }
   res.send(JSON.stringify({ position: index + 1 }));
});

app.post('/bathroom/add/:flight/:seat', function (req, res) {
   res.setHeader('Content-Type', 'application/json');
   if (!flights[req.params.flight]) flights[req.params.flight] = [];
   flights[req.params.flight].push({seat: req.params.seat, time: 5});
   res.send(JSON.stringify({ message: 'success' }));
});

app.post('/bathroom/remove/:flight/:seat', function (req, res) {
   res.setHeader('Content-Type', 'application/json');
   if (!flights[req.params.flight]) flights[req.params.flight] = [];
   for (var i = 0; i < flights[req.params.flight].length; ++i) {
      if (flights[req.params.flight][i].seat == req.params.seat) {
         flights[req.params.flight].splice(i, 1);
         break;
      }
   }
   res.send(JSON.stringify({ message: 'success' }));
});

// Start the server
app.listen(PORT, function () {
   console.log(`App listening on port ${PORT}.`);
});
