const RecipesModel = require('../models/recipes');
const createError = require('http-errors');

const getRecipes = async (req, res, next) => {
  const { title } = req.query;
  let recipes = await RecipesModel.find({});
  if(title) recipes = recipes.filter(r => r.title.toUpperCase().includes(title.toUpperCase()));
  console.log(recipes)
  return res.send({ recipes });
};

const getRecipeDetail = async (req, res, next) => {
  const { id } = req.params;
  let [ recipe ] = await RecipesModel.findById(id);
  console.log(recipe)
  if(!recipe) return res.status(404).end() ;
  return res.send({ recipe });
};

const getRecipesByUser = async (req, res, next) => {
  const { uid } = req.params;
  let recipes = await RecipesModel.findByUserId(uid);
  console.log(recipes)
  return res.send({ recipes });
}

const createRecipe = async (req, res, next) => {
  const { recipe } = req.body;
  const recipeExist = await RecipesModel.findRecipeExist(recipe.title);
  if(recipeExist.length > 0) return res.status(403).send();
  let recipeCreated = await RecipesModel.create(recipe);
  console.log(recipeCreated)
  return res.send({ recipeCreated });
};

const addFavRecipe = async (req, res, next) => {
  const { userId, recipeId } = req.body;
  const favRecipeExist = await RecipesModel.findFavExist(userId, recipeId);
  if(favRecipeExist.length > 0) return res.status(403).send();
  let recipeCreated = await RecipesModel.addToFav(userId, recipeId);
  console.log(recipeCreated)
  return res.send({ recipeCreated });
}


module.exports = {
  getRecipes,
  getRecipeDetail,
  getRecipesByUser,
  createRecipe,
  addFavRecipe
};
