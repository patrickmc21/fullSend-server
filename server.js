const express = require('express');
const logger = require('morgan')
const db = express();
const bodyParser = require('body-parser');
// const cors = require('cors');
const fetch = require('node-fetch');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

db.use(logger('dev'));
db.use(bodyParser.json());
db.use(bodyParser.urlencoded({ extended: false }));
// db.use(cors());
db.use(cors);
db.set('port', process.env.PORT || 3000);
db.locals.title = 'fullSend';

function cors(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


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

db.delete('/fullsend/users/:id', (req, res) => {
  database('users').where('id', req.params.id).del()
    .then(id => res.status(200).json({message: 'User has been removed'}))
    .catch(error => res.status(404).json({error: 'User not found'}))
})

// database rides
// ride needs epoch, distance, elapsedTime, date, elevation, userId, trailName, location, difficulty, img, summary

db.get('/fullsend/users/rides/:id', (req, res) => {
  const userId = parseInt(req.params.id)
  database('rides').where({userId: userId}).select()
    .then(ride => res.status(200).json(ride))
    .catch(error => res.status(404).json({error: 'Invalid user ID'}))
});

db.post('/fullsend/users/rides', (req, res) => {
  console.log(req.body);
  const { userId } = req.body;
  const fullRide = {...req.body, userId: parseInt(userId)};
  database('rides').insert(fullRide, 'id')
    .then(ride => {
      res.status(201).json({id: ride[0]})
    })
    .catch(error => {
      res.status(500).json({ error: 'Invalid User ID or ride'})
    });
});

db.put('/fullsend/rides/:id', (req, res) => {
  database('rides').where('id', req.params.id).update({...req.body})
    .then(ride => {
      res.status(204).json('Ride Updated')
    })
    .catch(error => {
      res.status(404).json({message: 'Invalid Ride Id'})
    })
});

db.delete('/fullsend/users/rides/:id', (req, res) => {
  database('rides').where('userId', req.params.id).del()
    .then(id => res.status(200).json({message: 'Rides have been removed'}))
    .catch(error => res.status(404).json({error: 'Invalid user ID'}))
});

db.delete('/fullsend/rides/:id', (req, res) => {
  console.log(req.params.id);
  database('rides').where('id', req.params.id).del()
    .then(id => res.status(204).json({message: 'Ride deleted'}))
    .catch(error => res.status(404).json({error: 'Ride not found'}))
});

db.listen(db.get('port'), () => {
  console.log(`${db.locals.title} is running on ${db.get('port')}.`);
});