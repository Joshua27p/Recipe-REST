const UsersModel = require('../models/users');
const createError = require('http-errors');

const login = async (req, res, next) => {
  const { username, password } = req.body;
  let user = await UsersModel.find({username, password});
  console.log(user)
  if(user.length <= 0) return createError(404)
  return res.send({ user });
};

const register = async (req, res, next) => {
  const { user } = req.body;
  let userCreated = await UsersModel.create(user);
  console.log(userCreated)
  return res.send({ userCreated });
};


module.exports = {
  login,
  register
};
