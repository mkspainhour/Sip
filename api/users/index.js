"use strict";

// POST  /api/user/create
// PUT   /api/user/update 🔒

const { User } = require("./models");
const { router } = require("./router");

module.exports = {
   User,
   router
};