const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Check Artist ID Parameter
artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get('SELECT * FROM Artist WHERE id = $artistId', {$artistId:artistId}, (err, row) => {
    if (err) {
      next(err);
    } else if(row) {
      req.artist = row;
      next();
    } else {
      res.sendStatus(404);
    };
  });
});


//GET all employed artists
artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', 
    (err, rows) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({artists:rows});
      };
  });
});

//GET a single artist by ID
artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({artist:req.artist});
});

module.exports = artistsRouter;