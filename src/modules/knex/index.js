const knex = require('knex');
const { database: {
  HOST,
  PASSWORD,
  USER,
  NAME,
  PORT,
}} = require('../../config');

const database = knex({
  client: 'pg',
  connection: {
    host: HOST,
    user: USER,
    password: PASSWORD,
    port: PORT,
    database: NAME,
  },
  pool: {
    max: 50,
    min: 5,
  },
});

database
  .raw('SELECT 1')
  .then(() => console.log('Connected to database.'))
  .catch(error => {
    console.error(`Error connecting to database: ${error}`);
    process.exit(1);
  });

module.exports = database;
