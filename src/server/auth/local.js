const jwt = require('jwt-simple');
const moment = require('moment');
const knex = require('../db/connection');
const secret = process.env.SECRET_KEY;

function encodeToken(user) {
  const payload = {
    exp: moment().add(1, 'days').unix(),
    iat: moment().unix(),
    sub: user.id
  };
  return jwt.encode(payload, secret);
}

function decodeToken(token) {
  const payload = jwt.decode(token, secret);
  var now = moment().unix();
  if (payload.exp < now) {
    return false;
  } else {
    return knex('users').where('id', parseInt(payload.sub))
    .then((user) => {
      if (user.length) {
        return true;
      } else {
        return false;
      }
    });
  }
}

module.exports = {
  encodeToken
};
