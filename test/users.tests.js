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
  username: "seedUsername",
  hashedPassword: bcrypt.hashSync("seedPassword", 12),
  email: "seedEmail@domain.tld"
}


describe("\n====User API====\n", function() {
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
      });
    });

    it("Fail state: username field is not a String", function() {
      const testData = {
        username: 36,
        password: "testPassword",
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
      });
    });

    it("Fail state: username field begins or ends in whitespace characters", function() {
      const testData = {
        username: " testUsername ",
        password: "testPassword",
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
      });
    });

    it("Fail state: password field is missing or empty", function() {
      const testData = {
        username: "testUsername",
        //password: "",
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
      });
    });

    it("Fail state: password field is not a String", function() {
      const testData = {
        username: "testUsername",
        password: 6,
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
      });
    });

    it("Fail state: password field begins or ends in whitespace characters", function() {
      const testData = {
        username: "testUsername",
        password: " " + "testPassword" + " ",
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
      });
    });

    it("Fail state: email field is present, but empty", function() {
      const testData = {
        username: "testUsername",
        password: "testPassword",
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
      });
    });

    it("Fail state: email field is present, but not a String", function() {
      const testData = {
        username: "testUsername",
        password: "testPassword",
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
      });
    });

    it("Fail state: email field is present, but begins or ends in whitespace characters", function() {
      const testData = {
        username: "testUsername",
        password: "testPassword",
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
      });
    });

    it("Fail state: 'username' is already in use by an existing user", function() {
      return chai.request(app)
      .post("/api/user/create")
      .send({
        username: preexistingUser.username,
        password: "uniquePassword",
        email: "localPart@domain.tld"
      })
      .then(function(res) {
        expect(res).to.have.status(422);
        expect(res.body.errorType).to.exist.and.to.be.a("string").and.to.equal("UsernameNotUnique");
      });
    });

    it("Fail state: 'email' is already in use by an existing user", function() {
      return chai.request(app)
      .post("/api/user/create")
      .send({
        username: "uniqueUsername",
        password: "uniquePassword",
        email: preexistingUser.email
      })
      .then(function(res) {
        expect(res).to.have.status(422);
        expect(res.body.errorType).to.exist.and.to.be.a("string").and.to.equal("EmailNotUnique");
      });
    });

    it("Success state: a new user is created", function() {
      const testData = {
        username: "testUsername",
        password: "testPassword",
        email: "localPart@domain.tld"
      };

      return chai.request(app)
      .post(`/api/user/create`)
      .send(testData)
      .then( (res)=> {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res).to.have.cookie("session");
        expect(res).to.have.cookie("user");
        User.findOne({username: testData.username})
        .then( (locatedUser)=> {
          expect(locatedUser).to.have.property("username", testData.username);
          expect(locatedUser).to.have.property("hashedPassword");
          expect(bcrypt.compareSync(testData.password, locatedUser.hashedPassword)).to.be.true;
          expect(locatedUser).to.have.property("email", testData.email);
        })
      });
    });

  });

});