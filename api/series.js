const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//check series ID Parameter
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, (err, row) => {
    if (err) {
      next(err);
    } else if(row) {
      req.series = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//GET all series
seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (err, rows) => {
    if (err) {
      next(err)
    } else {
      res.status(200).json({series:rows});
    };
  });
});

//GET series by ID
seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({series:req.series});
});

module.exports = seriesRouter;