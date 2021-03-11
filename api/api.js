const express = require('express');
const apiRouter = express.Router();

//import artists router
const artistsRouter = require('./artists');
apiRouter.use('/artists', artistsRouter);

//import series router
const seriesRouter = require('./series');
apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;