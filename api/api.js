const express = require('express');
const apiRouter = express.Router();
module.exports = apiRouter;

//import artists router
const artistsRouter = require('./artists');
apiRouter.use('/artists', artistsRouter);

//import series router
const seriesRouter = require('./series');
apiRouter.use('/series', seriesRouter);