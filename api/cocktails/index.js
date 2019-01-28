"use strict";

// POST     /api/cocktail/create 🔒
// PUT      /api/cocktail/update 🔒
// DELETE   /api/cocktail/delete 🔒

const { Cocktail } = require("./models");
const { router } = require("./router");

module.exports = {
   Cocktail,
   router
};