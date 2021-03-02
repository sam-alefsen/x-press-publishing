const express = require('express');
const app = express();

const PORT = process.env.PORT || 4001;

app.use(express.static('.'));

//body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//error handling (dev environment only)
const errorhandler = require('errorhandler');
app.use(errorhandler());

//cors
const cors = require('cors');
app.use(cors());

//morgan
const morgan = require('morgan');
app.use(morgan('dev'));

//import api router
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Now listening on PORT ${PORT}`);
});

module.exports = app;