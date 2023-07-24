const configFile = require("../../configFile.json");

const environmentList = [
  "local",
  "heroku",
  "manojTest",
  "ramTest",
  "production",
];
const environment = environmentList[0];

const configuration = {
  local: {
    env: "local",
    port: 3001,
    callbackURL: "/v2/auth/passportAuth/redirect",
    clientID: configFile.googleApi.clientId,
    clientSecret: configFile.googleApi.clientSecret,
    session: {
      cookieKey: configFile.googleApi.session.cookieKey,
    },
    url: "http://localhost:3000",
    mongoose: {
      url: "mongodb://localhost/project_tracking_system", // url to connect mongodb locally ramV8_
      options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    },
    jwt: {
      secret: "local!@#",
      accessExpirationMinutes: 30,
      refreshExpirationDays: 30,
      resetPasswordExpirationMinutes: 10,
    },
    email: {
      smtp: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: configFile.email.Email,
          pass: configFile.email.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: configFile.email.Email,
    },
  },
  heroku: {
    env: "heroku",
    port: process.env.PORT,
    callbackURL: "/v2/auth/passportAuth/redirect",
    clientID: configFile.googleApi.clientId,
    clientSecret: configFile.googleApi.clientSecret,
    session: {
      cookieKey: configFile.googleApi.session.cookieKey,
    },
    url: "https://project-tracking-api.herokuapp.com",
    mongoose: {
      url:
        "mongodb+srv://praveen:praveen@1999@cluster0.2xftc.mongodb.net/project_tracking_system?retryWrites=true&w=majority",
      options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    },
    jwt: {
      secret: "heroku!@#",
      accessExpirationMinutes: 5,
      refreshExpirationDays: 10,
      resetPasswordExpirationMinutes: 10,
    },
    email: {
      smtp: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: configFile.email.Email,
          pass: configFile.email.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: configFile.email.Email,
    },
  },
  manojTest: {
    env: "manojTest",
    port: 3030,
    callbackURL: "/api/v2/auth/passportAuth/redirect",
    clientID: configFile.googleApi.clientId,
    clientSecret: configFile.googleApi.clientSecret,
    session: {
      cookieKey: configFile.googleApi.session.cookieKey,
    },
    url: "https://pillar.staging.pacificmedicalgroup.org",
    mongoose: {
      url: "mongodb://localhost:1500/staging_pillar",
      options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    },
    jwt: {
      secret: "test!@#",
      accessExpirationMinutes: 30,
      refreshExpirationDays: 30,
      resetPasswordExpirationMinutes: 10,
    },
    email: {
      smtp: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: configFile.email.Email,
          pass: configFile.email.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: configFile.email.Email,
    },
  },
  ramTest: {
    env: "ramTest",
    port: 3030,
    callbackURL: "/api/v2/auth/passportAuth/redirect",
    clientID: configFile.googleApi.clientId,
    clientSecret: configFile.googleApi.clientSecret,
    session: {
      cookieKey: configFile.googleApi.session.cookieKey,
    },
    url: "https://pillartest.pacificmedicalgroup.org",
    mongoose: {
      url: "mongodb://localhost:1500/ram_pillar",
      options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    },
    jwt: {
      secret: "manojTest!@#",
      accessExpirationMinutes: 30,
      refreshExpirationDays: 30,
      resetPasswordExpirationMinutes: 10,
    },
    email: {
      smtp: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: configFile.email.Email,
          pass: configFile.email.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: configFile.email.Email,
    },
  },
  production: {
    env: "production",
    port: 3030,
    callbackURL: "/api/v2/auth/passportAuth/redirect",
    clientID: configFile.googleApi.clientId,
    clientSecret: configFile.googleApi.clientSecret,
    session: {
      cookieKey: configFile.googleApi.session.cookieKey,
    },
    url: "https://pillar.pacificmedicalgroup.org",
    mongoose: {
      url: "mongodb://localhost:1500/production_pillar",
      options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    },
    jwt: {
      secret: "production!@#",
      accessExpirationMinutes: 30,
      refreshExpirationDays: 30,
      resetPasswordExpirationMinutes: 10,
    },
    email: {
      smtp: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: configFile.email.Email,
          pass: configFile.email.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: configFile.email.Email,
    },
  },
};

module.exports = configuration[environment];
