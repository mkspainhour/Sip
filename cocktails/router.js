"use strict";

const express = require("express");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const router = express.Router();
const {Cocktail} = require("./models");



// ENDPOINTS
//
//Get a specific cocktail recipe
router.get("/:id", (req, res)=> {
  return res.sendStatus(200);
});

//Create a new cocktail recipe
router.post("/", (req, res)=> {
  return res.sendStatus(422);
});



// EXPORTS
//
module.exports = {
  router
};