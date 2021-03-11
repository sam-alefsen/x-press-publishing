const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues');

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

seriesRouter.use('/:seriesId/issues', issuesRouter);

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

//POST a new series
seriesRouter.post('/', (req, res, next) => {
  const name = req.body.series.name,
    description = req.body.series.description;
  if(!name || !description) {
    return res.sendStatus(400);
  } else {
    //make sure with back tick notation to include quotation marks when necessary
    db.run(`INSERT INTO Series (name, description) VALUES ("${name}", "${description}")`, function(err) {
      if(err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, row) => {
          if(err) {
            next(err);
          } else {
            res.status(201).json({series:row});
          };
        });
      };
    });
  };
});

//update a series
seriesRouter.put('/:seriesId', (req, res, next) => {
  const name = req.body.series.name,
    description = req.body.series.description;
  if(!name || !description) {
    return res.sendStatus(400);
  } else {
    db.run(`UPDATE Series SET name="${name}", description="${description}"`, (err) => {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Series WHERE id=${req.params.seriesId}`, (err, row) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({series:row});
          };
        });
      };
    });
  };
});

//DELETE a series
seriesRouter.delete('/:seriesId', (req, res, next) =>{
  db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, issues) => {
    if (err) {
      next(err);
    } else if (issues.length > 0) {
      res.sendStatus(400);
      return;
    } else {
      db.run(`DELETE FROM Series WHERE id = ${req.params.seriesId}`, (err) => {
        if (err) {
          next(err);
        } else {
          res.sendStatus(204);
        };
      });
    }
  });
});

module.exports = seriesRouter;