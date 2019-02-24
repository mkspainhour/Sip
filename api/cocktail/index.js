"use strict";

// POST     /api/cocktail/create 🔒
// PUT      /api/cocktail/update 🔒
// DELETE   /api/cocktail/delete 🔒
// GET      /api/cocktail/:targetId

const { Cocktail } = require("./models");
const { router } = require("./router");

module.exports = {
   Cocktail,
   router
};