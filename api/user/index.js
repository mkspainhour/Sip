"use strict";

// POST  /api/user/create
// GET   /api/user/:username

const { User } = require("./models");
const { router } = require("./router");

module.exports = {
   User,
   router
};