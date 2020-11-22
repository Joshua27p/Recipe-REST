const router = require('express').Router();
const recipesController = require('../controllers/recipes');

router.get('/', recipesController.getRecipes);
router.post('/', recipesController.createRecipe);
router.get('/:id', recipesController.getRecipeDetail);

module.exports = router;
