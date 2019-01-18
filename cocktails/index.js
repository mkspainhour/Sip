'use strict';

//Endpoint routes:
// GET   /api/cocktails/   Returns statistics on all cocktail recipes

const { Cocktail } = require("./models");
const { router } = require("./router");

module.exports = {
   Cocktail,
   router
};