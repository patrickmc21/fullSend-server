const express = require('express');
const logger = require('morgan')
const db = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

db.use(logger('dev'));
db.use(bodyParser.json());
db.use(bodyParser.urlencoded({ extended: false }));
db.use(cors());


// Strava OAuth token exchange
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
});

//database users

db.post('/fullsend/users', (req, res) => {
  const user = req.body;
  const { name, email, password } = user;
  if (!user && !email && !password) {
    return res
      .status(400)
      .send({error: 'Expected format: { name: <String>, email: <String>, password: <String>'})
  }
  database('users').insert(user, 'id')
    .then(user => {
      res.status(201).json({id: user[0]})
    })
    .catch(error => {
      res.status(500).json({ error });
    })
});

db.post('/fullsend/users/signin', (req, res) => {
  const { email, password } = req.body
  database('users').where({email: email, password: password}).select('id')
    .then(id => res.status(200).json(id))
    .catch(error => res.status(404).json({error: 'Invalid username and password'}))
});

db.get('/fullsend/users/', (req, res) => {
  database('users').select()
    .then(users => res.status(200).json(users))
    .catch(error => res.status(404).json({error: 'Invalid username and password'}))
});

// database rides
// ride needs epoch, distance, elapsedTime, date, elevation, userId, trailName, location, difficulty, img, summary




db.listen(3000, () => {
  console.log('Listening on localhost:3000');
});