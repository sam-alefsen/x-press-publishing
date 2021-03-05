//Import items
const cors = require('cors')
  , errorhandler = require('errorhandler')
  , express = require('express')
  , morgan = require('morgan');
const app = express();

const PORT = process.env.PORT || 4001;

app.use(express.static('.'));

//body parsing
app.use(express.json());

//cors
app.use(cors());

//morgan
app.use(morgan('dev'));

//import api router
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

//error handling (dev environment only)
app.use(errorhandler());

app.listen(PORT, () => {
  console.log(`Now listening on PORT ${PORT}`);
});

module.exports = app;