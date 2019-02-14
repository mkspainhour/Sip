const ui = {
   //#region jQuery Pointers
      $view_landing: $("#js-view-landing"),
         $headerButton_signIn: $("#js-headerButton-signIn"),
         $button_goToRegisterView: $("#js-landing-button-goToRegisterView"),

      $view_signIn: $("#js-view-signIn"),
         $headerButton_registerInstead: $("#js-headerButton-registerInstead"),
         $text_signInFormFeedback: $("#form-signIn-feedback"),
         $input_signInUsername: $("#js-input-signIn-username"),
         $label_signInUsername: $("#js-label-signIn-username"),
         $input_signInPassword: $("#js-input-signIn-password"),
         $label_signInPassword: $("#js-label-signIn-password"),
         $button_signInFormSubmit: $("#js-button-signIn-submit"),

      $view_register: $("#js-view-register"),
         $headerButton_signInInstead: $("#js-headerButton-signInInstead"),
         $text_registerFormFeedback: $("#form-register-feedback"),
         $input_registerUsername: $("#js-input-register-username"),
         $label_registerUsername: $("#js-label-register-username"),
         $input_registerEmail: $("#js-input-register-email"),
         $label_registerEmail: $("#js-label-register-email"),
         $input_registerPassword: $("#js-input-register-password"),
         $label_registerPassword: $("#js-label-register-password"),
         $input_registerConfirmPassword: $("#js-input-register-confirmPassword"),
         $label_registerConfirmPassword: $("#js-label-register-confirmPassword"),
         $button_registerFormSubmit: $("#js-button-register-submit"),

      $view_userHome: $("#js-view-userHome"),
         $headerButton_signOut: $("#js-headerButton-signOut"),
         $text_activeUser: $("#js-current-user"),
         $text_recipeCount: $("#js-recipe-count"),
         $button_addRecipe: $("#js-button-userHome-addRecipe"),

      $view_recipeEdit: $("#js-view-recipeEdit"),
         $headerButton_cancelRecipeEdit: $("#js-headerButton-cancelRecipeEdit"),
   //#endregion

   //#region UI Variables
      //UI State
      $currentView: null,
      userHomeViewScrollPositionCache: {
         x: null,
         y: null
      },

      //Sign In Form Valid Field Flags
      signInUsernameIsValid: false,
      signInPasswordIsValid: false,

      //Register Form Valid Field Flags
      registerUsernameIsValid: false,
      registerEmailIsValid: false,
      registerPasswordIsValid: false,
      registerPasswordConfirmationIsValid: false,

      //Sign In Form Initial Values
      initialSignInFormFeedback: null,
      initialSignInUsernameLabel: null,
      initialSignInPasswordLabel: null,

      //Register Form Initial Values
      initialRegisterFormFeedback: null,
      initialRegisterUsernameLabel: null,
      initialRegisterEmailLabel: null,
      initialRegisterPasswordLabel: null,
      initialRegisterPasswordConfirmationLabel: null,
   //#endregion

   //#region Functions
      //#region Setup Functions
         setup: function() {
            this.saveInitialValues();
            this.configureEventListeners();
         },

         //Capture initial HTML values so that they can be reset to when necessary
         saveInitialValues: function() {
            //Sign In Form Initial Values
            ui.initialSignInFormFeedback = ui.$text_signInFormFeedback.text();
            ui.initialSignInUsernameLabel = ui.$label_signInUsername.text();
            ui.initialSignInPasswordLabel = ui.$label_signInPassword.text();

            //Register Form Initial Values
            ui.initialRegisterFormFeedback = ui.$text_registerFormFeedback.text();
            ui.initialRegisterUsernameLabel = ui.$label_registerUsername.text();
            ui.initialRegisterEmailLabel = ui.$label_registerEmail.text();
            ui.initialRegisterPasswordLabel = ui.$label_registerPassword.text();
            ui.initialRegisterPasswordConfirmationLabel = ui.$label_registerConfirmPassword.text();
         },

         configureEventListeners: function() {
            //#region General Events
            //If the user navigations with the mouse, accessibility focus are hidden
            $(window).on("mousedown", function handleClick(e) {
               if($("html").hasClass("user-navigates-with-keyboard")) {
                  $("html").removeClass("user-navigates-with-keyboard");
               }
            });

            //If they tab key is pressed, accessibility focus outlines are restored
            $(window).on("keydown", function handleTab(e) {
               if($("html").hasClass("user-navigates-with-keyboard") == false) {
                  if (e.keyCode === 9) {
                     $("html").addClass("user-navigates-with-keyboard");
                  }
               }
            });
            //#endregion

            //#region Landing View
            ui.$headerButton_signIn.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutLeft");
               ui.showSignInView("fadeInRight");
            });

            ui.$button_goToRegisterView.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutLeft");
               ui.showRegisterView("fadeInRight");
            });
            //#endregion

            //#region Sign In View
            ui.$headerButton_registerInstead.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               ui.showRegisterView("fadeInLeft");
            });

            $("#form-signIn").on("submit", function(e) {
               //$signInSubmit button listens for enter-key presses in the inputs, but the form itself shouldn't react to the event
               e.preventDefault();
            });

            ui.$input_signInUsername.on("input", function(e) {
               ui.validateSignInFormUsername();
               ui.validateSignInForm();
            });

            ui.$input_signInPassword.on("input", function(e) {
               ui.validateSignInFormPassword();
               ui.validateSignInForm();
            });

            ui.$button_signInFormSubmit.on("click", async function(e) {
               ui.setSignInFormFeedback("Signing in...");
               await ui.signIn(ui.$input_signInUsername.val(), ui.$input_signInPassword.val());
            });
            //#endregion

            //#region Register View
            $("#form-register").on("submit", function(e) {
               //$signInSubmit button listens for enter-key presses in the inputs, but the form itself shouldn't react to the event
               e.preventDefault();
            });

            ui.$headerButton_signInInstead.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutLeft");
               ui.showSignInView("fadeInRight");
            });

            ui.$input_registerUsername.on("input", function(e) {
               ui.validateRegisterFormUsername();
               ui.validateRegisterForm();
            });

            ui.$input_registerEmail.on("input", function(e) {
               ui.validateRegisterFormEmail();
               ui.validateRegisterForm();
            });

            ui.$input_registerPassword.on("input", function(e) {
               ui.validateRegisterFormPassword();
               ui.validateRegisterForm();
            });

            ui.$input_registerConfirmPassword.on("input", function(e) {
               ui.validateRegisterFormPasswordConfirmation();
               ui.validateRegisterForm();
            });

            ui.$button_registerFormSubmit.on("click", async function(e) {
               let enteredUsername = ui.$input_registerUsername.val();
               let enteredPassword = ui.$input_registerPassword.val();
               let enteredEmail = ui.$input_registerEmail.val();

               ui.setRegisterFormFeedback("Registering...");
               await ui.createUser(enteredUsername, enteredPassword, enteredEmail);
            });
            //#endregion

            //#region User Home View
            ui.$headerButton_signOut.on("click", function(e) {
               ui.signOut();
            });

            ui.$button_addRecipe.on("click", async function(e) {
               ui.hideWithAnimation(ui.$button_addRecipe, "fadeOut");
               await ui.hideCurrentView("fadeOutLeft");
               ui.showRecipeEditView("fadeInRight");
            });
            //#endregion

            //#region Recipe Edit View
            ui.$headerButton_cancelRecipeEdit.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               await ui.showUserHomeView("fadeInLeft");
               await pause(200);
            });
            //#endregion
         },
      //#endregion



      //#region Landing View Functions
         beforeShowingLandingView: function() {
            return new Promise((resolve, reject)=> {
               //Do things first...
               resolve();
            });
         },

         showLandingView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingLandingView();
            ui.showView(ui.$view_landing, showAnimation, ui.$headerButton_signIn);
         },
      //#endregion

      //#region Sign In View Functionss
         beforeShowingSignInView: async function() {
            return new Promise((resolve, reject)=> {
               ui.resetSignInForm();
               resolve();
            });
         },

         showSignInView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingSignInView();
            ui.showView(ui.$view_signIn, showAnimation, ui.$headerButton_registerInstead);
         },

         setSignInFormFeedback: function(feedback, isProblematic=false) {
            ui.$text_signInFormFeedback.text(feedback);
            isProblematic ?
               ui.$text_signInFormFeedback.css("color", "#FF8A80")
               : ui.$text_signInFormFeedback.css("color", "");
         },

         validateSignInForm: function() {
            (ui.signInUsernameIsValid && ui.signInPasswordIsValid) ?
               ui.enableSignInSubmitButton()
               : ui.disableSignInSubmitButton();
         },

         resetSignInForm: function() {
            ui.setSignInFormFeedback(ui.initialSignInFormFeedback);
            ui.resetSignInUsernameField();
            ui.resetSignInPasswordField();
            ui.disableSignInSubmitButton();
         },

         validateSignInFormUsername: function() {
            const enteredUsername = this.$input_signInUsername.val();
            ui.signInUsernameIsValid = false;

            if(enteredUsername == "") {
               ui.$label_signInUsername.addClass("invalid");
               ui.$label_signInUsername.text("Username is blank.");
            }

            else if(enteredUsername.trim().length != enteredUsername.length) {
               ui.$label_signInUsername.addClass("invalid");
               ui.$label_signInUsername.text("Username begins or ends in whitespace.");
            }

            else {
               ui.$label_signInUsername.removeClass("invalid");
               ui.$label_signInUsername.text(ui.initialSignInUsernameLabel);
               ui.signInUsernameIsValid = true;
            }
         },

         resetSignInUsernameField: function() {
            ui.$input_signInUsername.val("");
            ui.$label_signInUsername.val(ui.initialSignInUsernameLabel);
            ui.signInUsernameIsValid = false;
            ui.disableSignInSubmitButton();
         },

         validateSignInFormPassword: function() {
            const enteredPassword = this.$input_signInPassword.val();
            ui.signInPasswordIsValid = false;

            if(enteredPassword == "") {
               ui.$label_signInPassword.addClass("invalid");
               ui.$label_signInPassword.text("Password is blank.");
            }

            else {
               ui.$label_signInPassword.removeClass("invalid");
               ui.$label_signInPassword.text(ui.initialSignInPasswordLabel);
               ui.signInPasswordIsValid = true;
            }
         },

         resetSignInPasswordField: function() {
            ui.$input_signInPassword.val("");
            ui.$label_signInPassword.val(ui.initialSignInPasswordLabel);
            ui.signInPasswordIsValid = false;
            ui.disableSignInSubmitButton();
         },

         disableSignInSubmitButton: function() {
            ui.$button_signInFormSubmit.prop("disabled", true);
         },

         enableSignInSubmitButton: function() {
            ui.$button_signInFormSubmit.prop("disabled", false);
         },

         //API Call
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
                  ui.setSignInFormFeedback("Success!");
                  appSession.currentUser = username;
                  await pause(700); //So that the 'Success!" message can be parsed by the user
                  await ui.hideCurrentView("fadeOutLeft")
                  ui.resetSignInForm();
                  ui.showUserHomeView("fadeInRight");
                  resolve();
               })
               .catch((returnedData)=> {
                  const errorStatus = returnedData.status;
                  const response = returnedData.responseJSON;
                  const errorType = response.errorType;
                  console.error("ERROR:", errorStatus, response);

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
                        ui.setSignInFormFeedback("No such account.", true);
                        ui.resetSignInPasswordField();
                        break;
                     default:
                        alert(`ERROR: signIn() enountered unexpected error '${errorType}'.`, );
                        break;
                  }
               });
            });
         },
      //#endregion

      //#region Register View Functions
         beforeShowingRegisterView: async function() {
            return new Promise((resolve, reject)=> {
               ui.resetRegisterForm();
               resolve();
            });
         },

         showRegisterView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingRegisterView();
            ui.showView(ui.$view_register, showAnimation, ui.$headerButton_signInInstead);
         },

         setRegisterFormFeedback: function(feedback, isProblematic=false) {
            ui.$text_registerFormFeedback.text(feedback);
            (isProblematic) ?
               ui.$text_signInFormFeedback.css("color", "#FF8A80")
               : ui.$text_signInFormFeedback.css("color", "");
         },

         validateRegisterForm: function() {
            (ui.registerUsernameIsValid && ui.registerEmailIsValid && ui.registerPasswordIsValid && ui.registerPasswordConfirmationIsValid) ?
               ui.enableRegisterSubmitButton()
               : ui.disableRegisterSubmitButton();
         },

         resetRegisterForm: function() {
            ui.setRegisterFormFeedback(ui.initialRegisterFormFeedback);
            ui.resetRegisterUsernameField();
            ui.resetRegisterEmailField();
            ui.resetRegisterPasswordField();
            ui.resetRegisterPasswordConfirmationField();
            ui.disableRegisterSubmitButton();
         },

         validateRegisterFormUsername: function() {
            const enteredUsername = this.$input_registerUsername.val();
            ui.registerUsernameIsValid = false;

            if(!enteredUsername) {
               ui.$label_registerUsername.addClass("invalid");
               ui.$label_registerUsername.text("Username is blank.");
            }

            else {
               ui.$label_registerUsername.removeClass("invalid");
               ui.$label_registerUsername.text(ui.initialRegisterUsernameLabel);
               ui.registerUsernameIsValid = true;
            }
         },

         resetRegisterUsernameField: function() {
            ui.$input_registerUsername.val("");
            ui.$label_registerUsername.val(ui.initialRegisterUsernameLabel);
            ui.registerUsernameIsValid = false;
            ui.disableRegisterSubmitButton();
         },

         validateRegisterFormEmail: function() {
            const enteredEmail = this.$input_registerEmail.val();
            const emailRegex = /[0-9a-zA-Z!#$%&'"*/=.?^_+\-`{|}~]+@{1}[^@\s]+/;

            if(enteredEmail!="" && enteredEmail != enteredEmail.match(emailRegex)) {
               ui.$label_registerEmail.addClass("invalid");
               ui.$label_registerEmail.text("Email is invalid.");
               ui.registerEmailIsValid = false;
            }

            else {
               ui.$label_registerEmail.removeClass("invalid");
               ui.$label_registerEmail.text(ui.initialRegisterEmailLabel);
               ui.registerEmailIsValid = true;
            }
         },

         resetRegisterEmailField: function() {
            ui.$input_registerEmail.val("");
            ui.$label_registerEmail.val(ui.initialRegisterEmailLabel);
            ui.registerEmailIsValid = false;
            ui.disableRegisterSubmitButton();
         },

         validateRegisterFormPassword: function() {
            const enteredPassword = this.$input_registerPassword.val();
            ui.signInPasswordIsValid = false;

            if(enteredPassword == "") {
               ui.$label_registerPassword.addClass("invalid");
               ui.$label_registerPassword.text("Password is blank.");
            }

            else if(enteredPassword.length < 10) {
               ui.$label_registerPassword.addClass("invalid");
               ui.$label_registerPassword.text("Password must be at least 10 characters.");
            }

            else {
               ui.$label_registerPassword.removeClass("invalid");
               ui.$label_registerPassword.text(ui.initialRegisterPasswordLabel);
               ui.registerPasswordIsValid = true;
            }

            //Changes to this field after the password has been confirmed cause re-test the validity of the confimed password.
            if(enteredPassword != ui.$input_registerConfirmPassword.val()) {
               ui.$label_registerConfirmPassword.addClass("invalid");
               ui.$label_registerConfirmPassword.text("Passwords do not match.");
               ui.registerPasswordConfirmationIsValid = false;
            }

            else {
               ui.$label_registerConfirmPassword.removeClass("invalid");
               ui.$label_registerConfirmPassword.text(ui.initialRegisterPasswordConfirmationLabel);
               ui.registerPasswordConfirmationIsValid = true;
            }
         },

         resetRegisterPasswordField: function() {
            ui.$input_registerPassword.val("");
            ui.$label_registerPassword.val(ui.initialRegisterPasswordLabel);
            ui.registerPasswordIsValid = false;
            ui.disableRegisterSubmitButton();
         },

         validateRegisterFormPasswordConfirmation: function() {
            const enteredPasswordConfirmation = this.$input_registerConfirmPassword.val();
            ui.registerPasswordConfirmationIsValid = false;

            if(enteredPasswordConfirmation == "") {
               ui.$label_registerConfirmPassword.addClass("invalid");
               ui.$label_registerConfirmPassword.text("Confirm your password.");
            }

            else if(enteredPasswordConfirmation != ui.$input_registerPassword.val()) {
               ui.$label_registerConfirmPassword.addClass("invalid");
               ui.$label_registerConfirmPassword.text("Passwords do not match.");
            }

            else {
               ui.$label_registerConfirmPassword.removeClass("invalid");
               ui.$label_registerConfirmPassword.text(ui.initialRegisterPasswordConfirmationLabel);
               ui.registerPasswordConfirmationIsValid = true;
            }
         },

         resetRegisterPasswordConfirmationField: function() {
            ui.$input_registerConfirmPassword.val("");
            ui.$label_registerConfirmPassword.val(ui.initialRegisterPasswordConfirmationLabel);
            ui.registerPasswordConfirmationIsValid= false;
            ui.disableRegisterSubmitButton();
         },

         disableRegisterSubmitButton: function() {
            this.$button_registerFormSubmit.prop("disabled", true);
         },

         enableRegisterSubmitButton: function() {
            this.$button_registerFormSubmit.prop("disabled", false);
         },

         //API Call
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
                  ui.setRegisterFormFeedback("Success!");
                  appSession.currentUser = getCookieValue("user");
                  await pause(700); //So that the 'Success!" message can be understood
                  await ui.hideCurrentView("fadeOutLeft");
                  ui.showUserHomeView("fadeInRight");
                  resolve();
               })
               .catch((returnedData)=> {
                  const response = returnedData.responseJSON;
                  const errorType = response.errorType;
                  console.error("ERROR:", response);

                  switch(errorType) {
                     case "UsernameNotUnique":
                        ui.$label_registerUsername.addClass("invalid");
                        ui.$label_registerUsername.text("Username already in use.");
                        ui.$input_registerUsername.val("");
                        ui.disableRegisterSubmitButton();
                        break;
                     case "EmailNotUnique":
                        ui.$label_registerEmail.addClass("invalid");
                        ui.$label_registerEmail.text("Email address already in use.");
                        ui.$input_registerEmail.val("");
                        ui.disableRegisterSubmitButton();
                        break;
                     default:
                        alert("ERROR: createUser() enountered an unexpected error.");
                        break;
                  }
               });
            });
         },
      //#endregion

      //#region User Home View Functions
         beforeShowingUserHomeView: async function() {
            return new Promise(async (resolve, reject)=> {
               let userInformation = await ui.getUserInformation(appSession.currentUser);
               const cocktailCount = userInformation.createdCocktails.length;
               const cocktails = userInformation.createdCocktails;

               //Set active username
               ui.$text_activeUser.text(appSession.currentUser);

               //Set recipe count
               if (cocktailCount === 1) {
                  ui.$text_recipeCount.text(`${userInformation.createdCocktails.length} Recipe`)
               }
               else {
                  ui.$text_recipeCount.text(`${userInformation.createdCocktails.length} Recipes`)
               }

               //Render cocktail recipe cards
               ui.renderCocktailRecipeCards(cocktails);

               resolve();
            });
         },

         showUserHomeView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingUserHomeView();
            ui.showView(ui.$view_userHome, showAnimation, ui.$headerButton_signOut);
            ui.showWithAnimation(ui.$button_addRecipe, "fadeIn");
            window.scrollTo(0, ui.userHomeViewScrollPosition || 0);
         },

         //API Call
         getUserInformation: function(targetUsername) {
            return new Promise((resolve, reject)=> {
               $.ajax({
                  method: "GET",
                  url: `/user/${targetUsername}`
               })
               .then((userInformation)=> {
                  resolve(userInformation);
               })
               .catch(async (error)=> {
                  const errorStatus = error.status;
                  const response = error.responseJSON;
                  const errorType = response.errorType;
                  console.error("ERROR:", errorStatus, response);

                  switch(errorType) {
                     case "NoSuchUser":
                        alert("ERROR: NoSuchUser");
                        ui.signOut();
                        break;
                     default:
                        alert("ERROR: Get User Information enountered an unexpected error.");
                        break;
                  }
               });
            });
         },

         buildCocktailRecipeCard: function(cocktailRecipeName, ingredientNames) {
            //TODO: buildCocktailRecipeCard()
            // `<div class="recipe-card">
				//    <h3 id="recipe-card-name" class="recipe-name typo-heading-small typo-color-orange3">Negroni</h3>
				//    <p id="recipe-card-ingredientNames" class="ingredients-list typo-body-small"></p>
				//    <img src="resources/icons/chevron.svg" class="svg-view-recipe-chevron" alt="View cocktail recipe...">
			   // </div>`
         },

         renderCocktailRecipeCards: function(cocktailRecipeCards = []) {
            //TODO: renderCocktailRecipeCards()
         },

         //API Call
         signOut: function() {
            return new Promise((resolve, reject)=> {
               $.ajax({
                  method: "GET",
                  url: "/api/auth/sign-out"
               })
               .then(()=> {
                  appSession.currentUser = null;
                  ui.hideWithAnimation(ui.$button_addRecipe, "fadeOutRight");
                  ui.hideCurrentView("fadeOutRight")
                  .then(()=> {
                     ui.showLandingView("fadeInLeft");
                     resolve();
                  });
               });
            });
         },
      //#endregion

      //#region Recipe Edit View
      beforeShowingRecipeEditView: async function() {
         return new Promise((resolve, reject)=> {
            //Do things here...
            resolve();
         });
      },

      showRecipeEditView: async function(showAnimation) {
         ui.validateShowAnimation(showAnimation);
         await ui.beforeShowingRecipeEditView();
         ui.showView(ui.$view_recipeEdit, showAnimation, ui.$headerButton_cancelRecipeEdit);
      },

      //#region Animate.css Functions
         hideCurrentView: function(hideAnimation) {
            return new Promise((resolve, reject)=> {
               const availableHideAnimations = ["fadeOutLeft", "fadeOutRight", "fadeOut", null];
               if (!availableHideAnimations.includes(hideAnimation)) {
                  reject(`hideCurrentView(): invalid hideAnimation value "${hideAnimation}".`);
               }

               //Hide all header buttons
               $("#wrapper-header-rightArea *").delay(150).fadeOut(400);
               //If there's an active view, hide it
               if (ui.$currentView && hideAnimation) {
                  ui.hideWithAnimation(ui.$currentView, hideAnimation)
                  .then(()=> {
                     resolve();
                  });
               }
               else {
                  resolve();
               }
            });
         },

         showView: function($view, showAnimation, $headerButtons) {
            const availableShowAnimations = ["fadeInLeft", "fadeInRight", "fadeIn"];
            if (!availableShowAnimations.includes(showAnimation)) {
               throw Error(`showCurrentView(): invalid showAnimation value "${showAnimation}".`);
            }

            ui.showWithAnimation($view, showAnimation);
            if ($headerButtons) {
               //'transition' disabled to prevent animation interactions
               //'pointer-events' disabled to prevent erroneous clicks that confuse execution
               $headerButtons.css({
                  "pointer-events": "none",
                  "transition": "none"
               });
               $headerButtons.delay(200).fadeIn(500, function() {
                  //Properties are cleared after the animation ends
                  $headerButtons.css({
                     "pointer-events": "",
                     "transition": ""
                  });
               });
            }
            //Set the $currentView state variable to the new $view
            ui.$currentView = $view;
         },

         hideWithAnimation: function($elementPointer, hideAnimation) {
            return new Promise((resolve, reject)=> {
               ui.validateHideAnimation(hideAnimation);

               //If the targeted element is not already hidden...
               if ($elementPointer.css("display") != "none") {
                  const animationEndEventPolyfill = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

                  //Register the animationEnd event handler
                  $elementPointer.one(animationEndEventPolyfill, function() {
                     //Add display:none to the element once it has finished animating
                     $(this).hide(0);
                     //Remove the animate.css classes from the element
                     $(this).removeClass(`animated fast ${hideAnimation}`);
                     resolve();
                  });

                  //Trigger the animationEnd event handler by applying the animate.css classes
                  $elementPointer.addClass(`animated fast ${hideAnimation}`);
               }
               else {
                  console.warn("hideWithAnimation() called on an already-hidden element.")
                  resolve();
               }

            });
         },

         validateHideAnimation: function(hideAnimation) {
            if (hideAnimation != "fadeOutLeft" && hideAnimation != "fadeOutRight" && hideAnimation != "fadeOut") {
               throw Error(`Invalid hideAnimation value '${hideAnimation}'`);
            }
         },

         showWithAnimation: function($elementPointer, showAnimation) {
            return new Promise((resolve, reject)=> {

               //If the targeted element is already hidden...
               if ($elementPointer.css("display") == "none") {
                  const animationEndEventPolyfill = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

                  //Register the animationEnd event handler
                  $elementPointer.one(animationEndEventPolyfill, function() {
                     //Remove the animate.css classes from the element
                     $(this).removeClass(`animated fast ${showAnimation}`);
                     resolve();
                  });

                  //Trigger the animationEnd event handler by applying the animate.css classes
                  $elementPointer.addClass(`animated fast ${showAnimation}`);
                  //Remove display:none from the element as it begins animating
                  $elementPointer.show(0);
               }
               else {
                  console.warn("showWithAnimation() called on an already-shown element.");
                  resolve();
               }

            });
         },

         validateShowAnimation: function(showAnimation) {
            if (showAnimation != "fadeInLeft" && showAnimation != "fadeInRight" && showAnimation != "fadeIn") {
               throw Error(`Invalid showAnimation value '${showAnimation}'`);
            }
         },
      //#endregion

   //#endregion
};