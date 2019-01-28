"use strict";
//#region SETUP
const chai = require("chai");
  const expect = chai.expect;
  const chaiHttp = require("chai-http");
  chai.use(chaiHttp);

const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;

const bcrypt = require("bcryptjs");

const { TEST_DATABASE_URL } = require("../config");
const { app, startServer, stopServer } = require("../server");
const { User } = require("../api/users");
//#endregion
let preexistingUser = {
  sessionJwt: User.makeJwtFor("seedUsername"),
  username: "seedUsername",
  hashedPassword: bcrypt.hashSync("seedPassword", 12),
  email: "seedEmail@domain.tld"
}


describe("User Tests", function() {
  //#region HOOKS
  //Before first test
  before("Starting server...", function() {
    return startServer(TEST_DATABASE_URL);
  });

  //Before every test
  beforeEach("Seeding collection with test document...", function() {
    //Default seed user
    return User.create(preexistingUser)
    .then( (user)=> {
      preexistingUser.id = user._id;
    });
  });

  //After every test
  afterEach("Clearing test-added documents...", function() {
    //Clear any test-added documents from the collection before moving on.
    return User.deleteMany({});
  })

  //After last test
  after("Stopping server...", function() {
    return stopServer();
  });
  //#endregion

  describe("POST /api/user/create", function() {

    it("Fail state: username field is missing or empty", function() {
      const testData = {
        //username = "",
        hashedPassword: bcrypt.hashSync("testPassword", 12),
        email: "localPart@domain.tld"
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "MissingField");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: username field is not a String", function() {
      const testData = {
        username: 36,
        hashedPassword: bcrypt.hashSync("testPassword", 12),
        email: "localPart@domain.tld"
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "UnexpectedDataType");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: username field begins or ends in whitespace characters", function() {
      const testData = {
        username: " testUsername ",
        hashedPassword: bcrypt.hashSync("testPassword", 12),
        email: "localPart@domain.tld"
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "UntrimmedString");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: hashedPassword field is missing or empty", function() {
      const testData = {
        username: "testUsername",
        //hashedPassword: "",
        email: "localPart@domain.tld"
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "MissingField");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: hashedPassword field is not a String", function() {
      const testData = {
        username: "testUsername",
        hashedPassword: 6,
        email: "localPart@domain.tld"
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "UnexpectedDataType");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: hashedPassword field begins or ends in whitespace characters", function() {
      const testData = {
        username: "testUsername",
        hashedPassword: " " + bcrypt.hashSync("testPassword", 12) + " ",
        email: "localPart@domain.tld"
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "UntrimmedString");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: email field is present, but empty", function() {
      const testData = {
        username: "testUsername",
        hashedPassword: bcrypt.hashSync("testPassword", 12),
        email: ""
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "MissingField");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: email field is present, but not a String", function() {
      const testData = {
        username: "testUsername",
        hashedPassword: bcrypt.hashSync("testPassword", 12),
        email: 9
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "UnexpectedDataType");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: email field is present, but begins or ends in whitespace characters", function() {
      const testData = {
        username: "testUsername",
        hashedPassword: bcrypt.hashSync("testPassword", 12),
        email: " localPart@domain.tld "
      };
      const sessionJwt = User.makeJwtFor(preexistingUser.username);

      return chai.request(app)
      .post(`/api/user/create`)
      .set("Cookie", `session=${sessionJwt}`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(422);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("errorType", "UntrimmedString");
        expect(res.body).to.have.property("message").and.to.be.a("string");
      });
    });

    it("Fail state: 'username' is already in use by an existing user", function() {
      return chai.request(app)
      .post("/api/user/create")
      .send({
        username: preexistingUser.username,
        hashedPassword: bcrypt.hashSync("uniquePassword", 12),
        email: "localPart@domain.tld"
      })
      .then(function(res) {
        expect(res).to.have.status(422);
        expect(res.body.errorType).to.exist.and.to.be.a("string").and.to.equal("CredentialNotUnique");
      });
    });

    it("Fail state: 'email' is already in use by an existing user", function() {
      return chai.request(app)
      .post("/api/user/create")
      .send({
        username: "uniqueUsername",
        hashedPassword: bcrypt.hashSync("uniquePassword", 12),
        email: preexistingUser.email
      })
      .then(function(res) {
        expect(res).to.have.status(422);
        expect(res.body.errorType).to.exist.and.to.be.a("string").and.to.equal("CredentialNotUnique");
      });
    });

    it("Success state: a new user is created", function() {
      const testData = {
        username: "testUsername",
        hashedPassword: bcrypt.hashSync("testPassword", 12),
        email: "localPart@domain.tld"
      };

      return chai.request(app)
      .post(`/api/user/create`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("message").and.to.be.a("string");
        expect(res).to.have.cookie("session");
        User.findOne({username: testData.username})
        .then( (locatedUser)=> {
          expect(locatedUser).to.have.property("username", testData.username);
          expect(locatedUser).to.have.property("hashedPassword", testData.hashedPassword);
          expect(locatedUser).to.have.property("email", testData.email);
        })
      });
    });

  });

});