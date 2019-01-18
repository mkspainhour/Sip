'use strict';

//Endpoint routes:
// GET   /api/users/             Returns statistics on the entire userbase
// GET   /api/users/:username    Returns the public-safe information of the provided user
// POST  /api/users/             Creates a user and returns the new account information

const { User } = require("./models");
const { router } = require("./router");

module.exports = {
   User,
   router
};