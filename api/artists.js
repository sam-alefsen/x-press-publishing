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

//POST a new artist
artistsRouter.post('/', (req, res, next) => {
  const artist = req.body.artist;
  const isCurrentlyEmployed = artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!artist.name || !artist.dateOfBirth || !artist.biography) {
    return res.sendStatus(400);
  } else {
    //add the new artist
    db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)', {
      $name: artist.name,
      $dateOfBirth: artist.dateOfBirth,
      $biography: artist.biography,
      $isCurrentlyEmployed: isCurrentlyEmployed
    }, function(err) {
      if(err) {
        next(err);
      } else {
        //Retrieve newly created artist with last ID to place in response. Requires this containing function to not be an arrow function.
        db.get('SELECT * FROM Artist WHERE ID = $lastID', {
          $lastID: this.lastID
        }, (err, row) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json({artist:row});
          };
        });
      };
    });
  };
});

//Update an artist
artistsRouter.put('/:artistId', (req, res, next) => {
  const artist = req.body.artist;
  if (!artist.name || !artist.dateOfBirth || !artist.biography) {
    return res.sendStatus(400);
  } else {
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';

    const values = {
      $name: artist.name,
      $dateOfBirth: artist.dateOfBirth,
      $biography: artist.biography,
      $isCurrentlyEmployed: artist.isCurrentlyEmployed,
      $artistId: req.params.artistId
    };
 
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        //code works with object literals
        //why doesn't this.lastID work here?
        db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, row) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({artist:row});
          };
        });
      };
    });

  };
});

//set artist to unemployed with DELETE request
artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = ${req.params.artistId}`, (err, row) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (err, row) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({artist:row});
        };
      });
    };
  });
});


module.exports = artistsRouter;