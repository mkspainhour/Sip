const registerView = {
   //#region jQuery Selectors
   $view: $("#js-view-register"),
   $headerButtons: {
      $signInInstead: $("#js-headerButton-signInInstead")
   },

   //Form Elements
   $form: $("#form-register"),
   $formFeedback: $("#js-register-formFeedback"),
   $usernameInput: $("#js-register-input-username"),
   $usernameLabel: $("#js-register-label-username"),
   $emailInput: $("#js-register-input-email"),
   $emailLabel: $("#js-label-register-email"),
   $passwordInput: $("#js-register-input-password"),
   $passwordLabel: $("#js-register-label-password"),
   $confirmPasswordInput: $("#js-register-input-confirmPassword"),
   $confirmPasswordLabel: $("#js-register-label-confirmPassword"),
   $submitButton: $("#js-register-button-submit"),
   //#endregion

   //#region Initial Values
   initialFormFeedback: $("#js-register-formFeedback").text(),
   initialUsernameLabel: $("#js-register-label-username").text(),
   initialEmailLabel: $("#js-label-register-email").text(),
   initialPasswordLabel: $("#js-register-label-confirmPassword").text(),
   initialConfirmPasswordLabel: $("#js-register-label-confirmPassword").text(),
   //#endregion

   //#region State Variables
   usernameInputIsValid: false,
   emailInputIsValid: true,
   passwordInputIsValid: false,
   confirmPasswordInputIsValid: false,
   //#endregion

   configureEventListeners: function() {
      registerView.$headerButtons.$signInInstead.on("click", async function(e) {
         await ui.hideCurrentView("fadeOutLeft");
         signInView.show("fadeInRight");
      });

      registerView.$form.on("submit", function(e) {
         //Prevents unnecessary refreshing behavior.
         //The form's submit button interprets the submit event on behalf of the form element.
         e.preventDefault();
      });

      registerView.$usernameInput.on("input", function(e) {
         registerView.validateUsernameInput();
         registerView.validateForm();
      });

      registerView.$emailInput.on("input", function(e) {
         registerView.validateEmailInput();
         registerView.validateForm();
      });

      registerView.$passwordInput.on("input", function(e) {
         registerView.validatePasswordInput();
         registerView.validateForm();
      });

      registerView.$confirmPasswordInput.on("input", function(e) {
         registerView.validateConfirmPasswordInput();
         registerView.validateForm();
      });

      registerView.$submitButton.on("click", async function(e) {
         registerView.setFormFeedback("Registering...");
         await registerView.createUser(
            registerView.$usernameInput.val(),
            registerView.$passwordInput.val(),
            registerView.$emailInput.val()
         );
      });
   },
   beforeShow: function() {
      return new Promise((resolve, reject)=> {
         registerView.reset();
         resolve();
      });
   },
   show: async function(showAnimation="fadeIn") {
      ui.validateShowAnimation(showAnimation);
      await registerView.beforeShow();
      ui.showView(registerView, showAnimation);
   },
   reset: function() {
      //With only one call, this reset method is hard to justify, but it maintains consistency with other views that have more complex reset behaviors.
      registerView.resetForm();
   },

   setFormFeedback: function(feedback, isError=false) {
      registerView.$formFeedback.text(feedback);
      (isError) ?
         registerView.$formFeedback.css("color", "#FF8A80")
         : registerView.$formFeedback.css("color", "");
   },
   enableSubmitButton: function() {
      registerView.$submitButton.prop("disabled", false);
   },
   disableSubmitButton: function() {
      registerView.$submitButton.prop("disabled", true);
   },
   resetUsernameField: function() {
      registerView.$usernameInput.val("");
      registerView.$usernameLabel.text(registerView.initialUsernameLabel);
      registerView.$usernameLabel.removeClass("invalid");
      registerView.usernameInputIsValid = false;
      registerView.disableSubmitButton();
   },
   resetEmailField: function() {
      registerView.$emailInput.val("");
      registerView.$emailLabel.text(registerView.initialEmailLabel);
      registerView.$emailLabel.removeClass("invalid");
      registerView.emailInputIsValid = true;
      registerView.disableSubmitButton();
   },
   resetPasswordField: function() {
      registerView.$passwordInput.val("");
      registerView.$passwordLabel.text(registerView.initialPasswordLabel);
      registerView.$passwordLabel.removeClass("invalid");
      registerView.passwordInputIsValid = false;
      registerView.disableSubmitButton();
   },
   resetConfirmPasswordField: function() {
      registerView.$confirmPasswordInput.val("");
      registerView.$confirmPasswordLabel.text(registerView.initialConfirmPasswordLabel);
      registerView.$confirmPasswordLabel.removeClass("invalid");
      registerView.confirmPasswordInputIsValid = false;
      registerView.disableSubmitButton();
   },
   resetForm: function() {
      registerView.setFormFeedback(registerView.initialFormFeedback);
      registerView.resetUsernameField();
      registerView.resetEmailField();
      registerView.resetPasswordField();
      registerView.resetConfirmPasswordField();
      registerView.disableSubmitButton();
   },

   validateUsernameInput: function() {
      const enteredUsername = registerView.$usernameInput.val();
      registerView.usernameInputIsValid = false;

      if(!enteredUsername) {
         registerView.$usernameLabel.addClass("invalid");
         registerView.$usernameLabel.text("Username is blank.");
      }

      else if(enteredUsername.trim().length != enteredUsername.length) {
         registerView.$usernameLabel.addClass("invalid");
         registerView.$usernameLabel.text("Username begins/ends with whitespace.");
      }

      else {
         registerView.$usernameLabel.removeClass("invalid");
         registerView.$usernameLabel.text(registerView.initialUsernameLabel);
         registerView.usernameInputIsValid = true;
      }
   },
   validateEmailInput: function() {
      const enteredEmail = registerView.$emailInput.val();
      const emailRegex = /[0-9a-zA-Z!#$%&'"*/=.?^_+\-`{|}~]+@{1}[^@\s]+/;

      //If a en email has been entered, but it does not adhere to the provided regular expression
      if(enteredEmail!="" && enteredEmail!=enteredEmail.match(emailRegex)) {
         registerView.$emailLabel.addClass("invalid");
         registerView.$emailLabel.text("Email is invalid.");
         registerView.emailInputIsValid = false;
      }

      else {
         registerView.$emailLabel.removeClass("invalid");
         registerView.$emailLabel.text(registerView.initialEmailLabel);
         registerView.emailInputIsValid = true;
      }
   },
   validatePasswordInput: function() {
      const enteredPassword = registerView.$passwordInput.val();
      registerView.passwordInputIsValid = false;

      if(enteredPassword == "") {
         registerView.$passwordLabel.addClass("invalid");
         registerView.$passwordLabel.text("Password is blank.");
      }

      else if(enteredPassword.length < 10) {
         registerView.$passwordLabel.addClass("invalid");
         registerView.$passwordLabel.text("Password must be at least 10 characters.");
      }

      else {
         registerView.$passwordLabel.removeClass("invalid");
         registerView.$passwordLabel.text(registerView.initialPasswordLabel);
         registerView.passwordInputIsValid = true;
      }

      //Changes to this field cause a re-test of the validity of the confimed password.
      if(enteredPassword != registerView.$confirmPasswordInput.val()) {
         registerView.$confirmPasswordLabel.addClass("invalid");
         registerView.$confirmPasswordLabel.text("Passwords do not match.");
         registerView.confirmPasswordInputIsValid = false;
      }

      else {
         registerView.$confirmPasswordLabel.removeClass("invalid");
         registerView.$confirmPasswordLabel.text(registerView.initialConfirmPasswordLabel);
         registerView.confirmPasswordInputIsValid = true;
      }
   },
   validateConfirmPasswordInput: function() {
      const enteredConfirmPassword = registerView.$confirmPasswordInput.val();
      registerView.confirmPasswordInputIsValid = false;

      if(enteredConfirmPassword == "") {
         registerView.$confirmPasswordLabel.addClass("invalid");
         registerView.$confirmPasswordLabel.text("Confirm your password.");
      }

      else if(enteredConfirmPassword != registerView.$passwordInput.val()) {
         registerView.$confirmPasswordLabel.addClass("invalid");
         registerView.$confirmPasswordLabel.text("Passwords do not match.");
      }

      else {
         registerView.$confirmPasswordLabel.removeClass("invalid");
         registerView.$confirmPasswordLabel.text(registerView.initialConfirmPasswordLabel);
         registerView.confirmPasswordInputIsValid = true;
      }
   },
   validateForm: function() {
      if (
         registerView.usernameInputIsValid
         && registerView.emailInputIsValid
         && registerView.passwordInputIsValid
         && registerView.confirmPasswordInputIsValid
      ) {
         registerView.enableSubmitButton();
      }
      else {
         registerView.disableSubmitButton();
      }
   },

   //API
   createUser: async function(username, password, email) {
      return new Promise((resolve, reject)=> {
         let requestData = {};
         requestData.username = username;
         requestData.password = password;
         if(email) { requestData.email = email; }

         $.ajax({
            method: "POST",
            url: "/api/user/create",
            contentType: "application/json",
            data: JSON.stringify(requestData)
         })
         .then(async ()=> {
            registerView.setFormFeedback("Success!");
            appSession.user = getCookieValue("user");
            appSession.sessionToken = getCookieValue("session");

            await pause(700); //So that the 'Success!" message can be interpreted by the user
            await ui.hideCurrentView("fadeOutLeft");
            userHomeView.show("fadeInRight");
            resolve();
         })
         .catch((returnedData)=> {
            const response = returnedData.responseJSON;
            const errorType = response.errorType;
            console.error("ERROR:", response);

            switch(errorType) {
               case "UsernameNotUnique":
                  registerView.$usernameLabel.addClass("invalid");
                  registerView.$usernameLabel.text("Username already in use.");
                  break;
               case "EmailNotUnique":
                  registerView.$emailLabel.addClass("invalid");
                  registerView.$emailLabel.text("Email address already in use.");
                  break;
               default:
                  alert("ERROR: createUser() enountered an unexpected error.");
                  break;
            }
            registerView.setFormFeedback(registerView.initialFormFeedback);
            registerView.disableSubmitButton();
         });
      });
   }
};