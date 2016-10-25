const express = require('express');
const router = express.Router();

const knex = require('../db/connection');
const localAuth = require('../auth/local');

const bcrypt = require('bcrypt');

router.post('/register', function (req, res, next) {
  return createUser(req)
  .then((user) => {
    return localAuth.encodeToken(user[0]);
  })
  .then((token) => {
    res.status(200).json({
      status: 'success',
      token: token
    });
  })
  .catch((error) => {
    res.status(500).json({
      status: error
    });
  });
});

router.post('/login', (req, res, next) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  return getUser(username)     // gets user from the db
  .then((response) => {
    comparePass(password, response.password);      // compare pass with bcrypt
    return response;
  })
  .then((response) => { return localAuth.encodeToken(response); })
  .then((token) => {
    res.status(200).json({
      status: 'success',
      token: token
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error'
    });
  });
});

router.get('/status', ensureAuthenticated, (req, res, next) => {
  res.status(200).json({
    status: 'success'
  });
});

// *** helpers *** //

function createUser(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return knex('users')
  .insert({
    username: req.body.username,
    password: hash
  })
  .returning('*');
}

function getUser(username) {
  return knex('users').where('username', username).first();
}

function comparePass(userPassword, databasePassword) {
  const bool = bcrypt.compareSync(userPassword, databasePassword);
  if (!bool) throw new Error('Incorrect Password');
  else return true;
}

function ensureAuthenticated(req, res, next) {

  if (!req.headers) {
    res.status(400).json({
      status: 'add some headers'
    });
  }

  if (!req.headers.authorization) {
    res.status(401).json({
      status: 'please login'
    });
  }

  const header = req.headers.authorization.split(' ');
  const token = header[1];

  localAuth.decodeToken(token, (err, payload) => {
    if (err) {
      return res.status(401).json({
        status: 'Token has expired'
      });
    } else {
      return knex('users').where({id: parseInt(payload.sub)}).first()
      .then((user) => {
        next();
      })
      .catch((err) => {
        res.status(500).json({
          status: 'error'
        });
      });
    }
  });
}

module.exports = router;
