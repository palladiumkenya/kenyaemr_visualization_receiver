const Sequelize = require("sequelize");
require("dotenv").config();

const database = process.env.DB_NAME_TEST;
const username = process.env.DB_USER_TEST;
const password = process.env.DB_PASSWORD_TEST;
const port = process.env.DB_PORT_TEST;
const db_server = process.env.DB_SERVER_TEST;

const sequelize = new Sequelize(database, username, password, {
  host: db_server,
  port: port,
  dialect: "mysql",
    dialectOptions: {
      connectTimeout: 4000000,
    },
    pool: {
      max: 1000,
      min: 0,
      idle: 900000
    },
    logging: false,
});

const connect = async () => {
  await sequelize
    .authenticate()
    .then(() => {
      logger.info("Connection has been established successfully.");
    })
    .catch(err => {
      logger.error("Unable to connect to the database: %s", err.message);
    });
};

const db = {
  sequelize: sequelize,
  connect
};



module.exports = db;
