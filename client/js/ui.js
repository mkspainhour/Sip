const ui = {
   //#region jQuery Pointers
      $view_landing: $("#view-landing"),
         $headerButton_signIn: $("#button-signIn"),
         $button_register: $("#button-register"),
      $view_signIn: $("#view-signIn"),
         $headerButton_registerInstead: $("#button-registerInstead"),
         $text_signInInstructions: $("#signIn-instructions"),
         $input_signInUsername: $("#input-signIn-username"),
         $input_signInPassword: $("#input-signIn-password"),
         $button_signInSubmit: $("#button-signIn-submit"),
      $view_register: $("#view-register"),
         $headerButton_signInInstead: $("#button-signInInstead"),
         $text_registerInstructions: $("#register-instructions"),
         $input_registerUsername: $("#input-register-username"),
         $input_registerEmail: $("#input-register-email"),
         $input_registerPassword: $("#input-register-password"),
         $input_registerConfirmPassword: $("#input-register-confirmPassword"),
         $button_registerSubmit: $("#button-register-submit"),
      $view_userHome: $("#view-userHome"),
         $headerButton_signOut: $("#button-signOut"),
         $text_activeUser: $("#active-user"),
         $text_recipeCount: $("#recipe-count"),
         $button_addRecipe: $("#button-addRecipe"),
   //#endregion

   //#region UI Variables
      //UI State
      $currentView: null,

      //Initial Values
      initialRegistrationInstructions: "",
      initialSignInInstructions: "",
   //#endregion

   //#region Functions
      //#region Setup Functions
         setup: function() {
            this.saveInitialValues();
            this.configureEventListeners();
         },

         //Capture initial HTML values so that they can be reset to when necessary
         saveInitialValues: function() {
            this.initialRegistrationInstructions = ui.$text_registerInstructions.text();
            this.initialSignInInstructions = ui.$text_signInInstructions.text();
         },

         configureEventListeners: function() {
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



            //Landing View
            ui.$headerButton_signIn.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutLeft");
               ui.showSignInView("fadeInRight");
            });

            ui.$button_register.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutLeft");
               ui.showRegisterView("fadeInRight");
            });



            //Sign In View
            ui.$headerButton_registerInstead.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               ui.showRegisterView("fadeInLeft");
            });

            $("#form-signIn").on("submit", function(e) {
               //$signInSubmit button catches enter-key presses, but the form itself shouldn't react to the event
               e.preventDefault();
            });

            $("#form-signIn input").on("input", function(e) {
               ui.validateSignInForm();
            });

            ui.$button_signInSubmit.on("click", async function(e) {
               let enteredUsername = ui.$input_signInUsername.val();
               let enteredPassword = ui.$input_signInPassword.val();

               await ui.signIn(enteredUsername, enteredPassword);
            });



            //Register View
            ui.$headerButton_signInInstead.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutLeft");
               ui.showSignInView("fadeInRight");
            });

            $("#form-register input").on("input", function(e) {
               ui.validateRegistrationForm();
            });

            ui.$button_registerSubmit.on("click", async function(e) {
               let enteredUsername = ui.$input_registerUsername.val();
               let enteredPassword = ui.$input_registerPassword.val();
               let enteredEmail = ui.$input_registerEmail.val();

               await ui.createUser(enteredUsername, enteredPassword, enteredEmail);
            });



            //User Home View
            this.$headerButton_signOut.on("click", async function(e) {
               await ui.signOut();
            });
         },
      //#endregion

      //DONE
      //#region Landing View Functions
         beforeShowingLandingView: function() {
            return new Promise((resolve, reject)=> {
               //Preparatory behaviors...
               resolve();
            });
         },

         showLandingView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingLandingView();
            ui.showView(ui.$view_landing, showAnimation, ui.$headerButton_signIn);
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
            ui.showView(ui.$view_userHome, "fadeIn", ui.$headerButton_signOut);
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
                  ui.hideCurrentView("fadeOutRight")
                  .then(()=> {
                     ui.showLandingView("fadeInLeft");
                     resolve();
                  });
               });
            });
         },
      //#endregion

      //#region Sign In View Functions
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

         validateSignInForm: function() {
            const enteredUsername = this.$input_signInUsername.val();
            const enteredPassword = this.$input_signInPassword.val();
            let formIsValid = false;

            if (enteredUsername == "") {
               ui.$text_signInInstructions.text("Please enter a username.");
            }
            else if (enteredPassword == "") {
               ui.$text_signInInstructions.text("Please enter a password.");
            }
            else if (enteredUsername.trim().length != enteredUsername.length) {
               ui.$text_signInInstructions.text("Usernames cannot begin or end with whitespace.");
            }
            else {
               ui.$text_signInInstructions.text("Sign In with the button below.");
               formIsValid = true;
            }

            formIsValid ? ui.enableSignInSubmitButton() : ui.disableSignInSubmitButton();
         },

         disableSignInSubmitButton: function() {
            ui.$button_signInSubmit.prop("disabled", true);
         },

         enableSignInSubmitButton: function() {
            ui.$button_signInSubmit.prop("disabled", false);
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
                  appSession.currentUser = username;
                  await ui.hideCurrentView("fadeOutLeft")
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
                        ui.$text_signInInstructions.text("Couldn't find an account with those credentials.");
                        ui.$input_signInPassword.val("");
                        ui.disableSignInSubmitButton();
                        break;
                     default:
                        alert(`ERROR: signIn() enountered an unexpected error.\n\n${errorType}`, );
                        break;
                  }
               });
            });
         },

         resetSignInForm: function() {
            ui.$text_signInInstructions.text(ui.initialSignInInstructions);
            ui.$input_signInUsername.val("");
            ui.$input_signInPassword.val("");
         },
      //#endregion

      //#region Register View Functions
         beforeShowingRegisterView: async function() {
            return new Promise((resolve, reject)=> {
               ui.resetRegistrationForm();
               resolve();
            });
         },

         showRegisterView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingRegisterView();
            ui.showView(ui.$view_register, showAnimation, ui.$headerButton_signInInstead);
         },

         validateRegistrationForm: function() {
            const enteredUsername = this.$input_registerUsername.val();
            const enteredPassword = this.$input_registerPassword.val();
            const enteredPasswordConfirmation = this.$input_registerConfirmPassword.val();
            let formIsValid = false;

            if (enteredUsername.length = 0) {
               ui.$text_registerInstructions.text(ui.defaultRegistrationInstructions);
            }
            else if (enteredUsername.trim().length != enteredUsername.length) {
               ui.$text_registerInstructions.text("Your username cannot begin or end with whitespace characters.");
            }
            else if (enteredPassword.length < 10) {
               ui.$text_registerInstructions.text("Your password must be at least 10 characters long.");
            }
            else if (enteredPassword.length >= 10 && enteredPasswordConfirmation.length == 0) {
               ui.$text_registerInstructions.text("Please confirm your password by entering it a second time.");
            }
            else if (enteredPassword != enteredPasswordConfirmation) {
               ui.$text_registerInstructions.text("Your password and password confirmation do not match.");
            }
            else {
               formIsValid = true;
               ui.$text_registerInstructions.text("Looks good! Click the register button below to continue.");
            }

            formIsValid ? ui.enableRegisterSubmitButton() : ui.disableRegisterSubmitButton();
         },

         resetRegistrationForm: function() {
            ui.$text_registerInstructions.text(ui.defaultRegistrationInstructions);
            ui.$input_registerUsername.val("");
            ui.$input_registerEmail.val("");
            ui.$input_registerPassword.val("");
            ui.$input_registerConfirmPassword.val("");
         },

         disableRegisterSubmitButton: function() {
            this.$button_registerSubmit.prop("disabled", true);
         },

         enableRegisterSubmitButton: function() {
            this.$button_registerSubmit.prop("disabled", false);
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
                  appSession.currentUser = getCookieValue("user");
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
                        ui.$text_registerInstructions.text("Unfortunately, that username is already in use.");
                        break;
                     case "EmailNotUnique":
                        ui.$text_registerInstructions.text("That email address is already in use. Do you already have an account?");
                        ui.$input_registerEmail.val("");
                        break;
                     default:
                        alert("ERROR: createUser() enountered an unexpected error.");
                        break;
                  }
               });
            });
         },
      //#endregion

      //#region Animate.css Functions
         hideCurrentView: function(hideAnimation) {
            return new Promise((resolve, reject)=> {
               const availableHideAnimations = ["fadeOutLeft", "fadeOutRight", "fadeOut", null];
               if (!availableHideAnimations.includes(hideAnimation)) {
                  reject(`hideCurrentView(): invalid hideAnimation value "${hideAnimation}".`);
               }

               //Hide all header buttons
               $("#header-right-wrapper *").delay(150).fadeOut(400);
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