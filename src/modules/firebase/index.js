const admin = require('firebase-admin');

let serviceAccount = require('../../config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://recipes-98b9b.firebaseio.com"
});

let database = admin.firestore();


database
  .collection('users')
  .get()
  .then(() => console.log('Connected to database.'))
  .catch(error => {
    console.error(`Error connecting to database: ${error}`);
    process.exit(1);
  });

module.exports = database;
