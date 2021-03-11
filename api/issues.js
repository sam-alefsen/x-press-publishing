const express = require('express')
  ,  sqlite3 = require('sqlite3');
const issuesRouter = express.Router({mergeParams:true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Check issue ID parameter
issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(`SELECT * FROM Issue WHERE id = ${issueId}`, (err, row) => {
    if(err) {
      next(err);
    } else if (row) {
      req.issue = row;
      next();
    } else {
      res.sendStatus(404);
    };
  });
});

//GET all issues
issuesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, rows) => {
    if(err) {
      next(err);
    } else {
      res.status(200).json({issues: rows});
    };
  });
});

//POST a new issue
issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name
    , issueNumber = req.body.issue.issueNumber
    , publicationDate = req.body.issue.publicationDate
    , artistId = req.body.issue.artistId;
  if(!name || !issueNumber || !publicationDate || !artistId) {
    res.sendStatus(400);
    return;
  } else {
    db.serialize(() => {
      //check if artist exists
      db.get(`SELECT * FROM Artist WHERE Id = ${artistId}`, (err, artist) => {
        if(err) {
          next(err);
        } else if (artist.length === 0) {
          console.log('Specified artist does not exist');
          res.sendStatus(400);
          return;
        };
      });
      //post new issue
      db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES("${name}", ${issueNumber}, "${publicationDate}", ${artistId}, ${req.params.seriesId})`, function(err, row) {
        if(err) {
          next(err);
        } else {
          db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, row) => {
            if(err) {
              next(err);
            } else {
              res.status(201).json({issue:row});
            };
          });
        };
      });
    });
  };
});

//Update an issue
issuesRouter.put('/:issueId', (req, res, next) => {
  const id = req.params.issueId
    , name = req.body.issue.name
    , issueNumber = req.body.issue.issueNumber
    , publicationDate = req.body.issue.publicationDate
    , artistId = req.body.issue.artistId
    , seriesId = req.params.seriesId;
  
  if (!name || !issueNumber || !publicationDate || !artistId) {
    res.sendStatus(400);
    return;
  } else {
    db.serialize(() => {
      //check if artist exists
      db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, (err, artist) => {
        if(err) {
          next(err);
        } else if(artist.length === 0) {
          console.log('Specified artist does not exist');
          res.sendStatus(400);
          return;
        };
      });
      //update issue
      db.run(`UPDATE Issue SET name="${name}", issue_number=${issueNumber}, publication_date="${publicationDate}", artist_id=${artistId}, series_id=${seriesId}`, (err) => {
        if(err) {
          next(err);
        } else {
          db.get(`SELECT * FROM Issue WHERE id=${id}`, (err, row) => {
            if(err) {
              next(err);
            } else {
              res.status(200).json({issue:row});
            };
          });
        };
      });
    });
  };
});

//DELETE an issue
issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, (err) => {
    if(err) {
      next(err);
    } else {
      res.sendStatus(204);
    };
  });
});

module.exports = issuesRouter;