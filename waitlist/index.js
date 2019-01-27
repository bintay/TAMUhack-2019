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

app.get('/attendant/', function (req, res) {
   res.render('attendant');
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

// Sockets
const http = require('http').Server(app);
const io = require('socket.io')(http);

let languageInSeat = {};

io.on('connection', function (socket) {
   console.log('user connected');

   socket.on('disconnect', function () {
      console.log('user disconnected');
   });

   socket.on('message', function (data) {
      data = JSON.parse(data);
      translate('en', data.text, function (error, response, body) {
         console.log(body[0]);
         data.text = body[0].translations[0].text;
         languageInSeat[data.seat] = body[0].detectedLanguage.language;
         io.emit('message', JSON.stringify(data));
      });
   });

   socket.on('response', function (data) {
      data = JSON.parse(data);
      console.log(languageInSeat, data.seat);
      translate(languageInSeat[data.seat] || 'en', data.text, function (error, response, body) {
         console.log(body[0]);
         data.text = body[0].translations[0].text;
         io.emit('response', JSON.stringify(data));
      });
   });
});

// Categories


// Microsoft middleman

const request = require('request');

function translate (to, text, callback) {
   request({
         url: 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + to,
         method: 'POST',
         headers: {'Ocp-Apim-Subscription-Key': '79510a10eab84c64bc61c31f72248d9a'},
         json: [{'Text': text}]
      }, function(error, response, body){
         callback(error, response, body);
   });
}

/*
function cateogrize (to, text, callback) {
   request({
         url: 'https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/66740d92-7d1a-4102-91aa-bfb7ab3b6074/',
         method: 'GET',
         headers: {'Ocp-Apim-Subscription-Key': '55895b3735164c00a1e958dc51b642c1'},
         json: [{'Text': text}]
      }, function(error, response, body){
         callback(error, response, body);
   });
}
*/

// Start the server
http.listen(PORT, function () {
   console.log(`App listening on port ${PORT}.`);
});
