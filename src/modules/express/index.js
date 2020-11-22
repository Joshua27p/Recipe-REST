const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { server: { LOGGER } } = require('../../config');
const errorHandler = require('../../middlewares/error');
const app = express();
const router = require('../../routes');

app.use(helmet());
app.use(cors());
app.use(logger(LOGGER));
app.use(bodyParser.json());
app.use('/', router);
app.use(errorHandler);

module.exports = app;
