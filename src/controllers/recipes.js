const RecipesModel = require('../models/recipes');
const createError = require('http-errors');

const getRecipes = async (req, res, next) => {
  const { title } = req.query;
  let recipes = await RecipesModel.find({});
  if(title) recipes = recipes.filter(r => r.title.toUpperCase().includes(title.toUpperCase()));
  console.log(recipes)
  return res.send({ recipes });
};

const createRecipe = async (req, res, next) => {
  const { recipe } = req.body;
  let recipeCreated = await RecipesModel.create(recipe);
  console.log(recipeCreated)
  return res.send({ recipeCreated });
};


module.exports = {
  getRecipes,
  createRecipe
};
