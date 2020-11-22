const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  const renderError = process.env.NODE_ENV === 'production' ? err : null;
  res.status(500).send({ error: renderError });
};

module.exports = errorHandler;
