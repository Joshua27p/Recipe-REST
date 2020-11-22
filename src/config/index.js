const config = {
  server: {
    PORT: process.env.PORT || 8081,
    LOGGER: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  }
};

module.exports = config;
