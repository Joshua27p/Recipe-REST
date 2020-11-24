const database = require('../modules/firebase');
const moment = require('moment');
const { v4 } = require('uuid');

const tableName = 'manifest';
const defaultTimeout = 2000;
const selectableProps = [
  'manifest.id',
  'manifest.dni',
  'manifest.company',
  'manifest.carPlate',
  'manifest.carrier',
  'manifest.storeId',
  'manifest.registerDate',
];

const Users = {
  // ...createModel({
  //   knex: database,
  //   tableName,
  //   selectableProps,
  //   timeout: defaultTimeout,
  // }),
  create: (user) => (
    database
      .collection('users')
      .add(user)
      .then(userCreated =>
        database
          .collection('users')
          .doc(userCreated['_path']['segments'][1])
          .set({
            userId: userCreated['_path']['segments'][1]
          }, { merge: true })
          .then(userUpdated => userUpdated)
          .catch(e => console.log(e))
      )
  ),
  find: ({ username, password }) => (
    database
      .collection('users')
      .where('username', '==', username)
      .where('password', '==', password)
      .get()
      .then(snapshot =>
        // snapshot.forEach((doc) => {
        //   console.log(doc.id, '=>', doc.data());
        // });
        snapshot.docs.map(doc => ({
          // docId: doc.id,
          ...doc.data()
        }))
      )
      .catch((err) => {
        console.log('Error getting documents', err);
      })
  ),
  findUserExist: ({ username }) => (
    database
      .collection('users')
      .where('username', '==', username)
      .get()
      .then(snapshot =>
        // snapshot.forEach((doc) => {
        //   console.log(doc.id, '=>', doc.data());
        // });
        snapshot.docs.map(doc => ({
          // docId: doc.id,
          ...doc.data()
        }))
      )
      .catch((err) => {
        console.log('Error getting documents', err);
      })
  ),
};

module.exports = Users;
