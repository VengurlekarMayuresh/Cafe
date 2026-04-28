const sequelize = require('../config/database');

const modelDefs = [
  require('./User'),
  require('./Product'),
  require('./Order'),
  require('./OrderItem'),
  require('./Notification'),
  require('./Review'),
];

const models = {};
modelDefs.forEach((def) => {
  const model = def(sequelize);
  models[model.name] = model;
});

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, ...models };
