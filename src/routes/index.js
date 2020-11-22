const router = require('express').Router();
const recipesRouter = require('./recipes');
const usersRouter = require('./users');
const axios = require('axios');
const https = require('https');

const axiosAgent = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

router.use('/recipes', recipesRouter);
router.use('/user', usersRouter);

module.exports = router;
