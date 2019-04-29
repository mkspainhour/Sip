//SECTION: Setup
"use strict";

const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_EXPIRY } = require("../../config");





//SECTION: Model Description
const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true, trim: true},
  hashedPassword: {type: String, required: true},
  email: {type: String, unique: true, sparse: true, trim: true},
  //createdAt timestamp
  //updatedAt timestamp
}, {timestamps: true});





//SECTION: Static Model Methods
userSchema.statics.makeJwtFor = function(username) {
  if (typeof username != "string") {
    throw Error("The username argument for User.makeJwtFor() must be a String.");
  }
  return jwt.sign({sub: username}, JWT_SECRET, {expiresIn: JWT_EXPIRY});
}





//SECTION: Model Instance Methods
userSchema.methods.serialize = function() {
  return {
    username: this.username
  }
}





//SECTION: Model Compilation
const User = mongoose.model("User", userSchema);





module.exports = {
  User //Model
};