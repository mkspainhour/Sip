"use strict";

module.exports = {
   TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || "mongodb://localhost/test-sip",
   DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost/dev-sip",
   PORT: process.env.PORT || 4444,
   JWT_SECRET: process.env.JWT_SECRET || "sip-dev-jwt-secret",
   COOKIE_EXPIRY: process.env.COOKIE_EXPIRY || new Date( Date.now()+(2)*24*60*60*1000 ),
   JWT_EXPIRY: process.env.JWT_EXPIRY || "1d"
}