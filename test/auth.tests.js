"use strict";
//#region SETUP
// const mongoose = require("mongoose");
//   mongoose.Promise = global.Promise;
const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);
const bcrypt = require("bcryptjs");

const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { User } = require("../api/users");
//#endregion
let preexistingUser = {
  username: "seedUsername",
  hashedPassword: bcrypt.hashSync("seedPassword", 12),
  email: "seedEmail@domain.tld"
}



describe("\n====Auth API====\n", function() {
  //#region HOOKS
  before("Starting server...", function() {
    return startServer(TEST_DATABASE_URL);
  });
  beforeEach("Seeding collection with test document", function() {
    //Default seed user
    return User.create(preexistingUser)
    .then( (user)=> {
      preexistingUser.id = user._id;
    });
  });
  afterEach(`Clearing test-added documents...`, function() {
    //Clear any test-added documents from the collection before moving on.
    return User.deleteMany({});
  });
  after("Stopping server...", function() {
    return stopServer();
  });
  //#endregion

  describe("POST /api/auth/sign-in", function() {

    it("Fail state: a 'session' cookie is already active", function() {
      const session = User.makeJwtFor(preexistingUser.username);
      return chai.request(app)
      .post("/api/auth/sign-in")
      .set("Cookie", `session=${session}`)
      .send({
        username: preexistingUser.username,
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(400).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("SessionAlreadyActive");
      });
    });

    it("Fail state: 'username' field is missing or empty", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: "",
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
      });
    });

    it("Fail state: 'username' field is not a string", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: 16,
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("UnexpectedDataType");
      });
    });

    it("Fail state: 'username' field begins or ends in whitespace", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: " " + preexistingUser.username + " ",
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("UntrimmedString");
      });
    });

    it("Fail state: 'password' field is missing or empty", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: preexistingUser.username,
        password: ""
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("MissingField");
      });
    });

    it("Fail state: 'password' field is not a string", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: preexistingUser.username,
        password: 4
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("UnexpectedDataType");
      });
    });

    it("Fail state: 'password' field begins or ends in whitespace", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: preexistingUser.username,
        password: " " + "seedPassword" + " "
      })
      .then(function(res) {
        expect(res).to.have.status(422).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("UntrimmedString");
      });
    });

    it("Fail state: 'username' and 'password' do not belong to an existing user", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: "mailboxSwordPelican",
        password: "sixteenhorsesinthekitchen"
      })
      .then(function(res) {
        expect(res).to.have.status(404).and.to.be.json;
        expect(res.body).to.have.property("errorType").and.to.equal("NoSuchUser");
      });
    });

    it("Success: sets 'session' cookie", function() {
      return chai.request(app)
      .post("/api/auth/sign-in")
      .send({
        username: preexistingUser.username,
        password: "seedPassword"
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        expect(res).to.have.cookie("session");
        expect(res).to.have.cookie("user");
      });
    });

  });

  describe("GET /api/auth/sign-out", function() {

    it("Success: clears 'session' cookie", function() {
      const session = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .get("/api/auth/sign-out")
      .set("Cookie", `session=${session}`)
      .then( function(res) {
        expect(res).to.have.status(204);
        expect(res).to.not.have.cookie("session");
        expect(res).to.not.have.cookie("user");
      })
    });

  });

  describe("GET /api/auth/sessionTest 🔒", function() {

    it("Fail state: no 'session' cookie exists to test", function() {
      return chai.request(app)
      .get("/api/auth/sessionTest")
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("NoActiveSession");
      })
    });

    it("Fail state: 'session' cookie JWT is malformed", function() {
      const session = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .get("/api/auth/sessionTest")
      .set("Cookie", `session=${session.slice(0, -1)}`) //Break the JWT to trigger the intended error
      .then( function(res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("errorType").and.to.equal("MalformedJWT");
      })
    });

    it("Success: 'session' cookie exists and is a valid JWT", function() {
      const session = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .get("/api/auth/sessionTest")
      .set("Cookie", `session=${session}`)
      .then(function(res) {
        expect(res).to.have.status(200);
      })
    });

  });

});