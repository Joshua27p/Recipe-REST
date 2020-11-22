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

const Recipes = {
  // ...createModel({
  //   knex: database,
  //   tableName,
  //   selectableProps,
  //   timeout: defaultTimeout,
  // }),
  create: (recipe) => (
    database
      .collection('recipes')
      .add(recipe)
      .then(recipeCreated =>
        database
          .collection('recipes')
          .doc(recipeCreated['_path']['segments'][1])
          .set({
            recipeId: recipeCreated['_path']['segments'][1]
          }, { merge: true })
          .then(recipeUpdated => recipeUpdated)
          .catch(e => console.log(e))
      )
  ),
  find: () => (
    database
      .collection('recipes')
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
  findById: (id) => (
    database
      .collection('recipes')
      .where('recipeId', '==', id)
      .get()
      .then(snapshot =>
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

module.exports = Recipes;
