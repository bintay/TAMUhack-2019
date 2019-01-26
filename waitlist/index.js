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

// Get Requests

app.get('/', function (req, res) {
   res.render('index');
});

// Start the server
app.listen(PORT, function () {
   console.log(`App listening on port ${PORT}.`);
});
