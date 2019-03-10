const signInView = {
   //#region jQuery Seletors
   $view: $("#js-view-signIn"),
   $headerButtons: {
      $registerInstead: $("#js-headerButton-registerInstead")
   },

   //Form Elements
   $form: $("#form-signIn"),
   $formFeedback: $("#js-signIn-formFeedback"),
   $usernameInput: $("#js-signIn-input-username"),
   $usernameLabel: $("#js-signIn-label-username"),
   $passwordInput: $("#js-signIn-input-password"),
   $passwordLabel: $("#js-signIn-label-password"),
   $submitButton: $("#js-signIn-button-submit"),
   //#endregion

   //#region Initial Values
   initialFormFeedback: $("#js-signIn-formFeedback").text(),
   initialUsernameLabel: $("#js-signIn-label-username").text(),
   initialPasswordLabel: $("#js-signIn-label-password").text(),
   //#endregion

   //#region State Variables
   usernameInputIsValid: false,
   passwordInputIsValid: false,
   //#endregion

   configureEventListeners: function() {
      signInView.$headerButtons.$registerInstead.on("click", async function(e) {
         await ui.hideCurrentView("fadeOutRight");
         registerView.show("fadeInLeft");
      });

      signInView.$form.on("submit", function(e) {
         //Prevents unnecessary refreshing behavior.
         //The form's submit button interprets the submit event on behalf of the form element.
         e.preventDefault();
      });

      signInView.$usernameInput.on("input", function(e) {
         signInView.validateUsernameInput();
         signInView.validateForm();
      });

      signInView.$passwordInput.on("input", function(e) {
         signInView.validatePasswordInput();
         signInView.validateForm();
      });

      signInView.$submitButton.on("click", async function(e) {
         signInView.setFormFeedback("Signing in...");
         await signInView.signIn(
            signInView.$usernameInput.val(),
            signInView.$passwordInput.val()
         );
      });
   },
   beforeShow: function() {
      return new Promise((resolve, reject)=> {
         signInView.reset();
         resolve();
      });
   },
   show: async function(showAnimation="fadeIn") {
      ui.validateShowAnimation(showAnimation);
      await signInView.beforeShow();
      ui.showView(signInView, showAnimation);
   },
   reset: function() {
      signInView.resetForm();
   },

   setFormFeedback: function(feedback, isError=false) {
      signInView.$formFeedback.text(feedback);
      (isError) ?
         signInView.$formFeedback.css("color", "#FF8A80")
         : signInView.$formFeedback.css("color", "");
   },
   enableSubmitButton: function() {
      signInView.$submitButton.prop("disabled", false);
   },
   disableSubmitButton: function() {
      signInView.$submitButton.prop("disabled", true);
   },
   resetUsernameField: function() {
      signInView.$usernameInput.val("");
      signInView.$usernameLabel.text(signInView.initialUsernameLabel);
      signInView.$usernameLabel.removeClass("invalid");
      signInView.usernameInputIsValid = false;
      signInView.disableSubmitButton();
   },
   resetPasswordField: function() {
      signInView.$passwordInput.val("");
      signInView.$passwordLabel.text(signInView.initialPasswordLabel);
      signInView.$passwordLabel.removeClass("invalid");
      signInView.passwordInputIsValid = false;
      signInView.disableSubmitButton();
   },
   resetForm: function() {
      signInView.setFormFeedback(signInView.initialFormFeedback);
      signInView.resetUsernameField();
      signInView.resetPasswordField();
      signInView.disableSubmitButton();
   },

   validateUsernameInput: function() {
      const enteredUsername = signInView.$usernameInput.val();
      signInView.usernameInputIsValid = false;

      if(enteredUsername == "") {
         signInView.$usernameLabel.addClass("invalid");
         signInView.$usernameLabel.text("Username is blank.");
      }

      else if(enteredUsername.trim().length != enteredUsername.length) {
         signInView.$usernameLabel.addClass("invalid");
         signInView.$usernameLabel.text("Username begins/ends with whitespace.");
      }

      else {
         signInView.$usernameLabel.removeClass("invalid");
         signInView.$usernameLabel.text(signInView.initialUsernameLabel);
         signInView.usernameInputIsValid = true;
      }
   },
   validatePasswordInput: function() {
      const enteredPassword = signInView.$passwordInput.val();
      signInView.passwordInputIsValid = false;

      if(enteredPassword == "") {
         signInView.$passwordLabel.addClass("invalid");
         signInView.$passwordLabel.text("Password is blank.");
      }

      else {
         signInView.$passwordLabel.removeClass("invalid");
         signInView.$passwordLabel.text(signInView.initialPasswordLabel);
         signInView.passwordInputIsValid = true;
      }
   },
   validateForm: function() {
      (signInView.usernameInputIsValid && signInView.passwordInputIsValid) ?
         signInView.enableSubmitButton()
         : signInView.disableSubmitButton();

   },

   //API
   signIn: async function(username, password) {
      return new Promise((resolve, reject)=> {
         $.ajax({
            method: "POST",
            url: "/api/auth/sign-in",
            contentType: "application/json",
            data: JSON.stringify({
               username: username,
               password: password
            })
         })
         .then(async ()=> {
            signInView.setFormFeedback("Success!");
            appSession.user = getCookieValue("user");
            appSession.sessionToken = getCookieValue("session");

            await pause(700); //So that the 'Success!" message can be parsed by the user

            await ui.hideCurrentView("fadeOutLeft");
            userHomeView.show("fadeInRight");
            resolve();
         })
         .catch((returnedData)=> {
            const response = returnedData.responseJSON;
            const errorType = response.errorType;
            console.error("ERROR:", response);

            switch(errorType) {
               case "SessionAlreadyActive":
                  alert("ERROR: SessionAlreadyActive");
                  break;
               case "MissingField":
                  alert("ERROR: MissingField");
                  break;
               case "UnexpectedDataType":
                  alert("ERROR: UnexpectedDataType");
                  break;
               case "MissingField":
                  alert("ERROR: MissingField");
                  break;
               case "UntrimmedString":
                  alert("ERROR: UntrimmedString");
                  break;
               case "NoSuchUser":
                  signInView.setFormFeedback("No such account.", true);
                  signInView.resetPasswordField();
                  break;
               default:
                  alert("ERROR: signIn() enountered an unexpected error.");
                  break;
            }
         });
      });
   },
};