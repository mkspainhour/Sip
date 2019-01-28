"use strict";
//#region SETUP
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const jwt = require("jsonwebtoken");

const { JWT_SECRET, SESSION_EXPIRY } = require("../../config");
//#endregion


const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true, trim: true},
  hashedPassword: {type: String, required: true},
  email: {type: String, unique: true, trim: true},
  //createdAt
  //updatedAt
}, {timestamps: true});



userSchema.statics.makeJwtFor = function(username) {
  if (typeof username != "string") {
    throw Error("The username argument for User.makeJwtFor must be a String.");
  }
  return jwt.sign({sub: username}, JWT_SECRET, {expiresIn: SESSION_EXPIRY});
}



userSchema.methods.serialize = function() {
  return {
    username: this.username,
    createdAt: this.createdAt,
  }
}



const User = mongoose.model("User", userSchema);



module.exports = {
  User
};