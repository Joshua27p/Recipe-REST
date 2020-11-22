const extractQueries = (httpQuery) => {
  const queryArray = [];
  const queryNames = Object.keys(httpQuery);
  queryNames.forEach(name => {
    queryArray({
      name,
      value: queryNames[name],
    });
  });
  return queryArray;
};
