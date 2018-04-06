const express = require('express');
const logger = require('morgan')
const db = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

db.use(logger('dev'));
db.use(bodyParser.json());
db.use(bodyParser.urlencoded({ extended: false }));
db.use(cors());

db.post('/tokenexchange', (req, res) => {
  const {token, clientId, clientSecret } = req.body;
  const url = 'https://www.strava.com/oauth/token';
  const option = {
    method: 'POST',
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: token
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (token && clientId && clientSecret) {
    fetch(url, option)
      .then(response => response.text())
      .then(text => res.status(200).send(JSON.stringify(text)))
      .catch(error => res.status(404).send(error.message))
  } else {
    res.status(500).send('Invalid request, please include a temporary token, clientId, and clientSecret')
  }
})


db.listen(3000, () => {
  console.log('Listening on localhost:3000');
});