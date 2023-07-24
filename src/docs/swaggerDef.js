/*
   docs Name : swaggerDef
*/

const { version } = require("../../package.json");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "project-tracking-api",
    description: "17/05/2021",
    version,
    license: {
      name: "MIT",
      url:
        "https://github.com/hagopj13/node-express-mongoose-boilerplate/blob/master/LICENSE",
    },
  },
  servers: [
    {
      url: `https://project-tracking-api.herokuapp.com/v2`, // change url based on (local/production)
      // url: `http://localhost:3001/v1`,
    },
    {
      // url: `https://project-tracking-api.herokuapp.com/v1`, // change url based on (local/production)
      url: `http://localhost:3001/v1`,
    },
    {
      url: `https://pillar.staging.pacificmedicalgroup.org/api/v2`, // change url based on (local/production)
      // url: `http://localhost:3001/v1`,
    },
  ],
};

module.exports = swaggerDef;
