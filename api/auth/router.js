//#region SETUP
"use strict";

const router = require("express").Router();
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWT_SECRET, COOKIE_EXPIRY } = require("../../config");
const { User } = require("../user");
//#endregion



router.post("/sign-in", (req, res)=> {
  //#region Request Validation
    //A session must not already be active
    if(req.cookies.session) {
      console.error("It is not possible to sign in while a user session is already active.");
      return res.status(400).json({
        errorType: "SessionAlreadyActive",
      })
    }

    //Required fields must be present and non-empty
    for(let requiredField of ["username", "password"]) {
      if (!req.body[requiredField]) {
        console.error(`Request body is missing the '${requiredField}' field.`);
        return res.status(422).json({
          errorType: "MissingField",
        });
      }
    }

    //The username and password fields are Strings
    for(let stringField of ["username", "password"]) {
      if(req.body.hasOwnProperty(stringField) && typeof req.body[stringField] != "string") {
        console.error(`The '${stringField}' field in the request body must be a String.`);
        return res.status(422).json({
          errorType: "UnexpectedDataType",
        });
      }
    }
  //#endregion

  return User.findOne({username: req.body.username})
  .then((locatedUser)=> {
    //If there is a user with the provided username, and the provided password is correct
    if(locatedUser && bcrypt.compareSync(req.body.password, locatedUser.hashedPassword)) {
      res.cookie("session", User.makeJwtFor(req.body.username), {expires: COOKIE_EXPIRY});
      res.cookie("user", req.body.username, {expires: COOKIE_EXPIRY});
      return res.status(204).send();
    }
    //Otherwise, the username and password provided do not both belong to a user
    return res.status(404).json({
      errorType: "NoSuchUser",
    });
  })
  .catch( (err)=> {
    console.error("❗Server Error:", err);
    return res.status(500).json({
      errorType: "InternalServerError"
    });
  });
});

router.get("/sign-out", (req, res)=> {
  //There is no situation in which only one cookie is present, but this seems more responsible
  if(req.cookies.session) {
    res.clearCookie("session");
  }
  if(req.cookies.user) {
    res.clearCookie("user");
  }
  return res.status(204).send();
});



module.exports = {
  router
};