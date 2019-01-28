"use strict";

module.exports = {
   TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || "mongodb://localhost/test-sip",
   DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost/dev-sip",
   PORT: process.env.PORT || 4444,
   JWT_SECRET: process.env.JWT_SECRET || "sip-dev-jwt-secret-shh-its-a-secret",
   SESSION_EXPIRY: process.env.SESSION_EXPIRY || "1d"
}