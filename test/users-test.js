"use strict";

const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');
const faker = require("faker");



// DEPENDENCIES
//
const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { User } = require("../users");



// FUNCTIONS
//
const preexistingUser = {
  username: "exampleUsername",
  hashedPassword: "$2a$11$2CjBegFpoXAROqS9KY91y.Y0/eGFJcYH27sw9bdyfzmqaLWnjwv.y", //"password"
  email: "address@email.provider"
}
function seedDatabase() {
  console.log(preexistingUser);
  return User.create( preexistingUser );
}



// TESTS
//
describe("Users Endpoint", function() {

  // Each hook function needs to either return a promise or invoke a `done()` callback.
  before(function() {
    return startServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return User.create( preexistingUser );
  })

  afterEach(function() {
    return mongoose.connection.dropDatabase();
  })

  after(function() {
    return stopServer()
  });



  // ENDPOINT TESTS
  //
  describe("POST /api/users", function() {

    it("Rejects a request without a username", function() {
      return chai.request(app).post("/api/users")
      .send({
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("MissingField");
      })
    });

    it("Rejects a request without a password", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: faker.internet.userName(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("MissingField");
      })
    });

    it("Rejects a request whos username is not a string", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: 6,
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType");
      })
    });

    it("Rejects a request whos password is not a string", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: 4,
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType");
      })
    });

    it("Rejects request whos email is not a string", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: 0
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType");
      })
    });

    it("Rejects a request whos username field is empty", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: "",
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidFieldSize");
      })
    });

    it("Rejects a request whos password is less than 10 characters long", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: "a2C45!789",
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidFieldSize");
      })
    });

    it("Rejects a request whos password is greater than 72 characters long", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: "tuIr4Izp6BqmYBFbUssbd9lM38ZDLxV1aXvyxA65vrcLDVLHhAJkruokrz5UMJP5GYVuHsOkf!789", //73 characters long
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidFieldSize");
      })
    });

    it("Rejects a request whos username is already taken", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: preexistingUser.username,
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("CredentialNotUnique");
      })
    });

    it("Rejects a request whos email is already in use", function() {
      return chai.request(app).post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: preexistingUser.email
      })
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(422);
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("CredentialNotUnique");
      })
    });

    it("Creates a new user when none of the prior fail conditions are reached", function() {
      let username = faker.internet.userName();
      let password = faker.internet.password();
      let email = faker.internet.email();

      return chai.request(app).post("/api/users")
      .send({username, password, email})
      .then( function(res) {
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res).to.have.status(201);
        expect(res.body.username).to.equal(username);
        expect(res.body.email).to.equal(email);
        return bcrypt.compare(password, res.body.hashedPassword);
      })
      .then( (passwordHashedCorrectly)=> {
        expect(passwordHashedCorrectly).to.equal(true);
      })
    });

  });

});