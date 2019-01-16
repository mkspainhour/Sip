"use strict";

const express = require("express");
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const router = express.Router();
const { Cocktail } = require("./models");



// ENDPOINTS
//
//Get information on every cocktail
router.get("/", (req,res)=> {
  return res.status(200).json("stats");
});

//Get a specific cocktail recipe
router.get("/:id", (req, res)=> {
  return res.status(200).json("newCocktail");
});

//Create a new cocktail recipe
router.post("/", (req, res)=> {
  return res.status(201).json("newCocktail");
});

//Replace a cocktail recipe with an updated version
router.put("/:id", (req, res)=> {
  return res.status(200).json("newCocktail");
});

//Delete a cocktail recipe
router.delete("/:id", (req, res)=> {
  return res.status(200).json(("Successfuly deleted."));
});



// EXPORTS
//
module.exports = {
  router
};