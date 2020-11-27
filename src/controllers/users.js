const UsersModel = require('../models/users');
const createError = require('http-errors');

const login = async (req, res, next) => {
  const { username, password } = req.body;
  let user = await UsersModel.find({username, password});
  console.log(user.length)
  if(user.length <= 0) return res.status(404).send()
  return res.send({ user });
};

const register = async (req, res, next) => {
  const { user } = req.body;
  const userExist = await UsersModel.findUserExist(user);
  if(userExist.length > 0) return res.status(403).send()
  let userCreated = await UsersModel.create(user);
  console.log(userCreated)
  return res.send({ userCreated });
};


module.exports = {
  login,
  register
};
