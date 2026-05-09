const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME || 'society_order',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: process.env.NODE_ENV === 'production' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {},
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

module.exports = sequelize;

