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
  findByUserId: async (id) => {
    const docRef = database.collection('users').doc(id);
    let data = []

    const snapshot = await database
    .collection('favRecipes')
    .where('userId', '==', docRef)
    .get()

    for (const doc of snapshot.docs) {
      const recipeRef = doc.data().recipeId;
      const snapshot = await recipeRef.get()
      console.log(snapshot.data())
      data.push(snapshot.data())
    }
    return data;
    // snapshot.docs.map(async doc => {
    //   const recipeRef = doc.data().recipeId;
    //   const snapshot = await recipeRef.get()
    //   console.log(snapshot.data())
    //   data.push(snapshot.data())
    //   return snapshot.data()
    // })
  },
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
  findRecipeExist: (title) => (
    database
      .collection('recipes')
      .where('title', '==', title)
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
  findFavExist: (userId, recipeId) => (
    database
      .collection('favRecipes')
      .where('userId', '==', database.doc(`/users/${userId}`))
      .where('recipeId', '==', database.doc(`/recipes/${recipeId}`))
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
  addToFav: (userId, recipeId) => (
    database
    .collection('favRecipes')
    .add({
      userId: database.doc(`/users/${userId}`),
      recipeId: database.doc(`/recipes/${recipeId}`)
    })
    .then(recipeAdded =>
      database
        .collection('favRecipes')
        .doc(recipeAdded['_path']['segments'][1])
        .set({
          id: recipeAdded['_path']['segments'][1]
        }, { merge: true })
        .then(recipeUpdated => recipeUpdated)
        .catch(e => console.log(e))
    )
  )
};

module.exports = Recipes;
