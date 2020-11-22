const createModel = ({
  knex = {},
  tableName = 'tablename',
  selectableProps = [],
  timeout = 2000,
}) => {
  const create = props => {
    delete props.id;

    return knex.insert(props)
      .returning(selectableProps)
      .into(tableName)
      .timeout(timeout);
  };

  const findAll = () => (
    knex.select(selectableProps)
      .from(tableName)
      .timeout(timeout)
  );

  const find = filters => (
    knex.select(selectableProps)
      .from(tableName)
      .where(filters)
      .timeout(timeout)
  );

  const findOne = filters => (
    find(filters)
      .first()
  );

  const findById = id => (
    knex.select(selectableProps)
      .where({ id })
      .timeout(timeout)
  );

  const update = (id, props) => {
    delete props.id;

    return knex.update(props)
      .from(tableName)
      .where({ id })
      .returning(selectableProps)
      .timeout(timeout)
  };

  const destroy = id => (
    knex.del()
      .from(tableName)
      .where({ id })
      .timeout(timeout)
  );

  return {
    create,
    findAll,
    find,
    findOne,
    findById,
    update,
    destroy,
    tableName,
  };
};

module.exports = createModel;
