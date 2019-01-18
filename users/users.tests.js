"use strict";

const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');
const faker = require("faker");



const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { User } = require("../users");



//Seed user for certain tests
const preexistingUser = {
  username: "exampleUsername",
  hashedPassword: "$2a$11$2CjBegFpoXAROqS9KY91y.Y0/eGFJcYH27sw9bdyfzmqaLWnjwv.y", //"password"
  email: "address@email.provider"
}



describe("\n===== Users Endpoint =====\n", function() {
  //#region HOOKS (must return a promise or invoke 'done()')
  before(function() {
    return startServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return User.create( preexistingUser );
  })
  afterEach(function() {
    return mongoose.connection.dropCollection("users");
  })
  after(function() {
    return stopServer()
  });
  //#endregion



  describe("GET /api/users", function() {

    it("Return an object containing any number of data on the site's userbase", function() {
      return chai.request(app).get("/api/users")
      .then( function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.be.an("object");
      })
    });

  });

  describe("GET /api/users/:username", function() {

    it("Rejects a request with an untrimmed ':username' parameter", function() {
      return chai.request(app)
      .get("/api/users/ 6571db214a21aace4ce388f9 ")
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;

        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("StringNotTrimmed");
      });
    });

    it("Fails with a 404 when no user with the provided 'username' exists", function() {
      return chai.request(app)
      .get("/api/users/x__DEFINITELY_DOESNT_EXIST__x")
      .then( (res)=> {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("NoSuchUser");
      });
    });

    it("Succeeds and returns a users public information when none of the prior fail conditions are met", function() {
      return chai.request(app)
      .get(`/api/users/${preexistingUser.username}`)
      .then( (res)=> {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body.user).to.be.an("object");
        expect(res.body.message).to.equal("OK");
        expect(res.body.user.username).to.equal(preexistingUser.username);
        expect(res.body.user.cocktailRecipes).to.be.an("array");
      });

    });
  })

  describe("POST /api/users", function() {

    it("Rejects a request without 'username'", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("MissingField");
      })
    });

    it("Rejects a request without 'password'", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: faker.internet.userName(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("MissingField");
      })
    });

    it("Rejects a request where 'username' is not a string", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: 6,
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType");
      })
    });

    it("Rejects a request where 'password' is not a string", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: 4,
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType");
      })
    });

    it("Rejects a request where 'email' is not a string", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: 0
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("IncorrectDataType");
      })
    });

    it("Rejects a request when 'username' is empty", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: "",
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidFieldSize");
      })
    });

    it("Rejects a request when 'username' is is longer than 32 characters", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: "avf1LBsRB4s4EkUFLBMfEmNWpnfifSikc", //33 characters
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidFieldSize");
      })
    });

    it("Rejects a request when 'password' is fewer than 10 characters", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: "a2C45!789",
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidFieldSize");
      })
    });

    it("Rejects a request when 'password' is greater than 72 characters", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: "tuIr4Izp6BqmYBFbUssbd9lM38ZDLxV1aXvyxA65vrcLDVLHhAJkruokrz5UMJP5GYVuHsOkf!789", //73 characters long
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("InvalidFieldSize");
      })
    });

    it("Rejects a request when 'username' begins or ends with whitespace", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: " untrimmedUsername ",
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("StringNotTrimmed");
      })
    });

    it("Rejects a request when 'email' begins or ends with whitespace", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: " untrimmedEmailAddress@email.host "
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("StringNotTrimmed");
      })
    });

    it("Rejects a request when 'username' is already in use by a different user account", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: preexistingUser.username,
        password: faker.internet.password(),
        email: faker.internet.email()
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("CredentialNotUnique");
      })
    });

    it("Rejects a request when 'email' is already in use by a different user account", function() {
      return chai.request(app)
      .post("/api/users")
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: preexistingUser.email
      })
      .then( function(res) {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("errorType");
        expect(res.body.errorType).to.equal("CredentialNotUnique");
      })
    });

    it("Succeeds when creating a new user when none of the prior fail conditions are reached", function() {
      let username = faker.internet.userName();
      let password = faker.internet.password();
      let email = faker.internet.email();

      return chai.request(app)
      .post("/api/users")
      .send({username, password, email})
      .then( function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");

        expect(res.body.newUser.username).to.equal(username);
        expect(res.body.newUser.email).to.equal(email);
        return bcrypt.compare(password, res.body.newUser.hashedPassword);
      })
      .then( (passwordHashedCorrectly)=> {
        expect(passwordHashedCorrectly).to.equal(true);
      })
    });
  });
});