/*
   Name : index.js
*/

/** ***************** Models Import ******************************************************** */
const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config");
const logger = require("./config/logger");
const cronReschedule = require("./services/project.service");

let server;
let db;
try {
  mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info("Connected to MongoDB");
    cronReschedule.reScheduleCron();
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  });
  db = mongoose.connection;
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info("Server closed");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received");
    if (server) {
      server.close();
    }
  });
} catch (e) {
  logger.error(e);
}
module.exports = { db };
