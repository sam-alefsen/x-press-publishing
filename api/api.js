const express = require('express');
const apiRouter = express.Router();
module.exports = apiRouter;

//import artists router
const artistsRouter = require('./artists');
apiRouter.use('/artists', artistsRouter);