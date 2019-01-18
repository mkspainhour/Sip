'use strict';

//Endpoint routes:
// GET   /api/cocktails       Returns statistics on all cocktail recipes
// GET   /api/cocktails/:id   Fetch a specific cocktail recipe
// POST  /api/cocktails       Create a new cocktail recipe

const { Cocktail } = require("./models");
const { router } = require("./router");

module.exports = {
   Cocktail,
   router
};