/*
   Name : app.js
*/

/** ***************** Models Import ******************************************************** */
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
const httpStatus = require("http-status");
const cookieSession = require("cookie-session");
const expressip = require("express-ip");
const config = require("./config");
const morgan = require("./config/morgan");
const { jwtStrategy } = require("./config/passport");
const { authLimiter } = require("./middleware/rateLimiter");
const routes = require("./routes/v1");
const { errorConverter, errorHandler } = require("./middleware/error");
const ApiError = require("./utils/ApiError");
const passportSetup = require("./config/passport-setup");

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}
// app.set(process.env.PORT || 3000)
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
// to get ip of client
app.use(expressip().getIpInfoMiddleware);
// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v2/auth", authLimiter);
}
// v1 api routes
app.use("/v2", routes);
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: config.session.cookieKey,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
