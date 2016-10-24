const express = require('express');
const router = express.Router();
const knex = require('../db/connection');

router.get('/', (req, res, next) => {
  knex('coffee')
  .then((coffees) => {
    res.status(200).json({
      status: 'success',
      data: coffees
    });
  })
  .catch((error) => {
    return next(error);
  });
});

router.get('/:id', (req, res, next) => {
  const coffeeID = parseInt(req.params.id);
  knex('coffee').where('id', coffeeID).first()
  .then((coffee) => {
    res.status(200).json({
      status: 'success',
      data: coffee
    });
  })
  .catch((error) => {
    return next(error);
  });
});

router.post('/', (req, res, next) => {
  return knex('coffee').insert(req.body).returning('*')
  .then((coffee) => {
    res.status(200).json({
      status: 'success',
      data: coffee
    });
  })
  .catch((err) => {
    return next(err);
  });
});

module.exports = router;
