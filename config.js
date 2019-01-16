"use strict";

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/test-sip"
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/dev-sip";
exports.PORT = process.env.PORT || 4444;
exports.JWT_SECRET = process.env.JWT_SECRET || "dev-sip-jwt-secret";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";