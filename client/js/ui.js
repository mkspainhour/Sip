const ui = {
   //#region jQuery Pointers
      $view_landing: $("#js-view-landing"),
         $headerButton_signIn: $("#js-headerButton-signIn"),
         $button_goToRegisterView: $("#js-landing-button-register"),

      $view_signIn: $("#js-view-signIn"),
         $headerButton_registerInstead: $("#js-headerButton-registerInstead"),
         $text_signInFormFeedback: $("#js-signIn-formFeedback"),
         $input_signInUsername: $("#js-signIn-input-username"),
         $label_signInUsername: $("#js-signIn-label-username"),
         $input_signInPassword: $("#js-signIn-input-password"),
         $label_signInPassword: $("#js-signIn-label-password"),
         $button_signInFormSubmit: $("#js-signIn-button-submit"),

      $view_register: $("#js-view-register"),
         $headerButton_signInInstead: $("#js-headerButton-signInInstead"),
         $text_registerFormFeedback: $("#js-register-formFeedback"),
         $input_registerUsername: $("#js-register-input-username"),
         $label_registerUsername: $("#js-register-label-username"),
         $input_registerEmail: $("#js-register-input-email"),
         $label_registerEmail: $("#js-label-register-email"),
         $input_registerPassword: $("#js-register-input-password"),
         $label_registerPassword: $("#js-register-label-password"),
         $input_registerConfirmPassword: $("#js-register-input-confirmPassword"),
         $label_registerConfirmPassword: $("#js-register-label-confirmPassword"),
         $button_registerFormSubmit: $("#js-register-button-submit"),

      $view_userHome: $("#js-view-userHome"),
         $headerButton_signOut: $("#js-headerButton-signOut"),
         $headerButton_addRecipe: $("#js-headerButton-addRecipe"),
         $text_activeUser: $("#js-userHome-text-currentUser"),
         $text_recipeCount: $("#js-userHome-text-recipeCount"),

      $view_recipeCreate: $("#js-view-recipeCreate"),
         $headerButton_cancelRecipeCreate: $("#js-headerButton-recipeCreateCancel"),

         $input_recipeCreateCocktailName: $("#js-input-recipeCreate-cocktailName"),
         $label_recipeCreateCocktailName: $("#js-label-recipeCreate-cocktailName"),
         $form_recipeCreate: $("#js-form-recipeCreate"),
         $button_addIngredientBlock: $("#js-button-recipeCreate-addIngredientBlock"),
         $wrapper_recipeCreateIngredientBlocks: $("#js-wrapper-recipeCreate-ingredientBlocks"),
         $button_recipeCreateFormSubmit: $("#js-button-recipeCreate-submit"),

      $view_recipe: $("#js-view-recipe"),
         $headerButton_recipeBack: $("#js-headerButton-recipeBack"),
         $headerButton_editRecipe: $("#js-headerButton-recipeEdit"),

      $view_recipeEdit: $("#js-view-recipeEdit"),
         $headerButton_cancelRecipeEdit: $("#js-headerButton-recipeEditCancel"),
         $button_saveEditedRecipe: $("js-button-recipeEdit-submit"),
   //#endregion

   //#region UI Variables
      //UI State
      $currentView: null,
      userHomeViewScrollPosition: null,
      existingRecipeCreateIngredientBlockIDs: [],

      //Sign In Form Valid Field Flags
      signInUsernameIsValid: false,
      signInPasswordIsValid: false,

      //Register Form Valid Field Flags
      registerUsernameIsValid: false,
      registerEmailIsValid: true,
      registerPasswordIsValid: false,
      registerPasswordConfirmationIsValid: false,

      //Recipe Create Form Valid Field Flags
      recipeCreateCocktailNameIsValid: false,
      recipeCreateIngredientBlocksAreValid: false,

      //Initial Values
         //Sign In Form
         initialSignInFormFeedback: null,
         initialSignInUsernameLabel: null,
         initialSignInPasswordLabel: null,

         //Register Form
         initialRegisterFormFeedback: null,
         initialRegisterUsernameLabel: null,
         initialRegisterEmailLabel: null,
         initialRegisterPasswordLabel: null,
         initialRegisterPasswordConfirmationLabel: null,

         //Recipe Create View
         initialRecipeCreateIngredientBlocks: null,
         initialRecipeCreateCocktailNameLabel: null,
         initialIngredientBlockNameLabel: null,
         initialIngredientBlockAmountLabel: null,
         initialIngredientBlockUnitLabel: null,
         initialIngredientBlockAbvLabel: null,
   //#endregion

   //#region Functions
      //#region Setup Functions
         setup: function() {
            this.saveInitialValues();
            this.configureEventListeners();
         },

         reset: function() {
            ui.userHomeViewScrollPosition = null;
         },

         //Capture initial HTML values so that they can be restored when necessary
         saveInitialValues: function() {
            //Sign In Form
            ui.initialSignInFormFeedback = ui.$text_signInFormFeedback.text();
            ui.initialSignInUsernameLabel = ui.$label_signInUsername.text();
            ui.initialSignInPasswordLabel = ui.$label_signInPassword.text();

            //Register Form
            ui.initialRegisterFormFeedback = ui.$text_registerFormFeedback.text();
            ui.initialRegisterUsernameLabel = ui.$label_registerUsername.text();
            ui.initialRegisterEmailLabel = ui.$label_registerEmail.text();
            ui.initialRegisterPasswordLabel = ui.$label_registerPassword.text();
            ui.initialRegisterPasswordConfirmationLabel = ui.$label_registerConfirmPassword.text();

            //Recipe Create Form
            ui.initialRecipeCreateCocktailNameLabel = ui.$label_recipeCreateCocktailName.text();
            ui.initialRecipeCreateIngredientBlocks = ui.$wrapper_recipeCreateIngredientBlocks.html();
         },

         configureEventListeners: function() {
            //DONE
            //#region General Events
            //If the user navigates with the mouse, style for accessibility accordingly
            $(window).on("mousedown", function handleClick(e) {
               if($("html").hasClass("user-navigating-with-keyboard")) {
                  $("html").removeClass("user-navigating-with-keyboard");
               }
            });

            //If the user navigates with the keybaord (tab key is pressed), style for accessibility accordingly
            $(window).on("keydown", function handleTab(e) {
               if($("html").hasClass("user-navigating-with-keyboard") == false) {
                  if (e.keyCode === 9) {
                     $("html").addClass("user-navigating-with-keyboard");
                  }
               }
            });
            //#endregion

            //DONE
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

            //DONE
            //#region Sign In View
            ui.$headerButton_registerInstead.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               ui.showRegisterView("fadeInLeft");
            });

            $("#form-signIn").on("submit", function(e) {
               //Prevents unnecessary refreshing behavior.
               //The form's submit button interprets the submit event on behalf of the form element.
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

            //DONE
            //#region Register View
            ui.$headerButton_signInInstead.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutLeft");
               ui.showSignInView("fadeInRight");
            });

            $("#form-register").on("submit", function(e) {
               //Prevents unnecessary refreshing behavior.
               //The form's submit button interprets the submit event on behalf of the form element.
               e.preventDefault();
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
               ui.setRegisterFormFeedback("Registering...");
               await ui.createUser(ui.$input_registerUsername.val(), ui.$input_registerPassword.val(), ui.$input_registerEmail.val());
            });
            //#endregion

            //DONE
            //#region User Home View
            ui.$headerButton_signOut.on("click", function(e) {
               ui.signOut();
            });

            ui.$headerButton_addRecipe.on("click", async function(e) {
               ui.saveUserHomeViewScrollPosition();
               await ui.hideCurrentView("fadeOutLeft");
               ui.showRecipeCreateView("fadeInRight");
            });

            ui.$view_userHome.on("click", ".recipe-card", async function(e) {
               //Isolates 'n' from the element id 'recipe-card-n'
               recipeCardId = e.currentTarget.id.replace("recipe-card-", "");
               appSession.currentCocktail = appSession.userCocktailsCache[recipeCardId];

               console.log("Clicked Recipe:", appSession.currentCocktail.name);
               ui.saveUserHomeViewScrollPosition();

               await ui.hideCurrentView("fadeOutLeft");
               ui.showRecipeView("fadeInRight");
            });
            //#endregion

            //#region Recipe Create View
            ui.$headerButton_cancelRecipeCreate.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               ui.showUserHomeView("fadeInLeft");
            });

            ui.$form_recipeCreate.on("submit", function(e) {
               //Prevents unnecessary refreshing behavior.
               //The form's submit button interprets the submit event on behalf of the form element.
               e.preventDefault();
            });

            ui.$form_recipeCreate.on("input", function(e) {
               ui.validateRecipeCreateForm();
            });

            ui.$input_recipeCreateCocktailName.on("input", function(e) {
               ui.validateRecipeName();
            });

            ui.$wrapper_recipeCreateIngredientBlocks.on("click", ".wrapper-ingredientBlock-svg-remove", async function(e) {
               targetedIngredientBlock = e.currentTarget.parentElement;
               $(targetedIngredientBlock).slideUp(400, function() {
                  this.remove();
               });
            });

            ui.$wrapper_recipeCreateIngredientBlocks.on("input", ".recipeCreate-ingredientBlock", function(e) {
               ui.validateIngredientBlocks();
            });

            ui.$button_addIngredientBlock.on("click", function(e) {
               ui.recipeCreate_addIngredientBlock();
            });

            ui.$button_recipeCreateFormSubmit.on("click", function(e) {
               ui.buildRecipeCreateRequest();
            });
            //#endregion

            //#region Recipe View
            ui.$headerButton_recipeBack.on("click", async function(e) {
               await ui.hideCurrentView("fadeOutRight");
               ui.showUserHomeView("fadeInLeft");
            });

            ui.$headerButton_editRecipe.on("click", async function(e) {
               await ui.hideCurrentView("fadeOut");
               ui.showRecipeEditView(appSession.currentCocktail, "fadeIn");
            });
            //#endregion

            //#region Recipe Edit View
            ui.$headerButton_cancelRecipeEdit.on("click", async function(e) {
               await ui.hideCurrentView("fadeOut");
               ui.showRecipeView("fadeIn");
            });

            ui.$button_saveEditedRecipe.on("click", function(e) {
               console.log("saving edited recipe");
               ui.updateRecipe();
            });
            //#endregion
         },
      //#endregion



      //DONE
      //#region Landing View Functions
         beforeShowingLandingView: function() {
            return new Promise((resolve, reject)=> {
               //Things...
               resolve();
            });
         },

         showLandingView: async function(showAnimation) {
            ui.validateShowAnimation(showAnimation);
            await ui.beforeShowingLandingView();
            ui.showView(ui.$view_landing, showAnimation, ui.$headerButton_signIn);
         },
      //#endregion

      //DONE
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
               ui.$label_signInUsername.text("Username begins/ends in whitespace.");
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
                  appSession.currentUser = getCookieValue("user");
                  await pause(700); //So that the 'Success!" message can be parsed by the user

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

      //DONE
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

            window.scrollTo(0, 0);
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

            else if(enteredUsername.trim().length != enteredUsername.length) {
               ui.$label_registerUsername.addClass("invalid");
               ui.$label_registerUsername.text("Username begins or ends with whitspace.");
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
            ui.registerEmailIsValid = true;
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

      //DONE
      //#region User Home View Functions
         beforeShowingUserHomeView: async function() {
            return new Promise(async (resolve, reject)=> {
               let userInformation = await ui.getUserInformation(appSession.currentUser);
                  console.log("fetched userInformation:", userInformation);
               const cocktailCount = userInformation.createdCocktails.length;
               const cocktails = userInformation.createdCocktails;

               //Set active username
               ui.$text_activeUser.text(appSession.currentUser);

               //Set recipe count
               if (cocktailCount === 1) {
                  ui.$text_recipeCount.text("1 Recipe");
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
            ui.showView(ui.$view_userHome, showAnimation, $("#js-headerButton-signOut, #js-headerButton-addRecipe"));

            window.scrollTo(0, ui.userHomeViewScrollPosition || 0);
         },

         //API Call
         getUserInformation: function(targetUsername) {
            return new Promise((resolve, reject)=> {
               $.ajax({
                  method: "GET",
                  url: `/api/user/${targetUsername}`
               })
               .then((userInformation)=> {
                  appSession.userCocktailsCache = userInformation.createdCocktails;
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
                        //The user is both signed in, and nonexistent. This can only happen if the user tampers with their cookies, so the session is deemed invalid and the user is forcibly 'signed out', clearing any active cookies.
                        ui.signOut();
                        break;
                     default:
                        alert("ERROR: Get User Information enountered an unexpected error.");
                        break;
                  }
               });
            });
         },

         buildCocktailRecipeCard: function(cardIndex, cocktailRecipeName, ingredientNames) {
            return `
               <div id="recipe-card-${cardIndex}" class="recipe-card">
                  <h3 id="recipe-card-name" class="recipe-name typo-heading-small typo-color-orange">${cocktailRecipeName}</h3>
                  <p id="recipe-card-ingredientNames" class="ingredients-list typo-body-small">${ingredientNames}</p>
                  <img src="resources/icons/chevron_right.svg" class="svg-icon svg-show-recipe-chevron" alt="View cocktail recipe...">
               </div>`;
         },

         renderCocktailRecipeCards: function(cocktails) {
            builtCocktails = [];
            cocktails.forEach((cocktail, index)=> {
               //Compose a comma-separated list of ingredient names
               cocktail.ingredientNames = cocktail.ingredients.map((ingredient)=> {return ingredient.name}).join(", ");
               builtCocktails.push( ui.buildCocktailRecipeCard(index, cocktail.name, cocktail.ingredientNames) )
            });

            $("#js-userHome-wrapper-recipeCards").html(builtCocktails.join(""));
         },

         //API Call
         signOut: function() {
            return new Promise((resolve, reject)=> {
               $.ajax({
                  method: "GET",
                  url: "/api/auth/sign-out"
               })
               .then(()=> {
                  appSession.reset();
                  ui.reset();

                  ui.hideCurrentView("fadeOutRight")
                  .then(()=> {
                     ui.showLandingView("fadeInLeft");
                     resolve();
                  });
               });
            });
         },

         saveUserHomeViewScrollPosition: function() {
            ui.userHomeViewScrollPosition = window.scrollY;
         },
      //#endregion

      //#region Recipe Create View
      beforeShowingRecipeCreateView: async function() {
         return new Promise((resolve, reject)=> {
            ui.resetRecipeCreateView();
            resolve();
         });
      },

      resetRecipeCreateView: function() {
         ui.resetCocktailNameField();
         ui.resetRecipeCreateIngredientBlocks();
      },

      resetCocktailNameField: function() {
         ui.$input_recipeCreateCocktailName.val("");
         ui.$label_recipeCreateCocktailName.text(ui.initialRecipeCreateCocktailNameLabel);
      },

      resetRecipeCreateIngredientBlocks: function() {
         ui.$wrapper_recipeCreateIngredientBlocks.html(ui.initialRecipeCreateIngredientBlocks);
      },

      showRecipeCreateView: async function(showAnimation) {
         ui.validateShowAnimation(showAnimation);
         await ui.beforeShowingRecipeCreateView();
         ui.showView(ui.$view_recipeCreate, showAnimation, ui.$headerButton_cancelRecipeCreate);
         window.scrollTo(0, 0);
      },

      recipeCreate_addIngredientBlock: async function() {
         //The new block's index begins as the number of existing ingredientBlocks
         let newBlockIndex = $(".recipeCreate-ingredientBlock").length;

         //However, depending on how the user has added and deleted blocks, an ingredientBlock with that index may already exist
         while( $(`#recipeCreate-ingredientBlock-${newBlockIndex}`).length ) {
            console.log(`#recipeCreate-ingredientBlock-${newBlockIndex} already exists. Incrementing ID and trying again.`)
            newBlockIndex++;
         }

         ingredientBlockTemplate = `
            <div id="recipeCreate-ingredientBlock-${newBlockIndex}" class="recipeCreate-ingredientBlock" style="display:none;">

               <div class="wrapper-ingredientBlock-svg-remove">
                  <img src="resources/icons/close.svg" class="svg-ingredientBlock-remove" alt="Remove ingredient.">
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-name">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-name" type="text" title="Ingredient name." aria-label="ingredient name" required>
                  <label id="js-label-recipeCreate-ingredientBlock-${newBlockIndex}-name" class="typo-body-small typo-color-orange">Ingredient Name</label>
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-amount">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-amount" type="number" min="0" title="Ingredient amount." aria-label="ingredient amount" required>
                  <label id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-amount" class="typo-body-small typo-color-orange">Ingredient Amount</label>
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-measurementUnit">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-measurementUnit" type="text" title="Ingredient measurement unit." aria-label="ingredient measurement unit" required>
                  <label id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-measurementUnit" class="typo-body-small typo-color-orange">Measurement Unit</label>
               </div>

               <div class="wrapper-input wrapper-ingredientBlock-abv">
                  <input id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-abv" type="number" min="0" max="100" title="Ingredient ABV Percentage." aria-label="ingredient ABV">
                  <label id="js-input-recipeCreate-ingredientBlock-${newBlockIndex}-abv" class="typo-body-small typo-color-orange">ABV Percentage (Optional)</label>
               </div>
            </div>
         `;

         ui.$wrapper_recipeCreateIngredientBlocks.append(ingredientBlockTemplate);
         $(`#recipeCreate-ingredientBlock-${newBlockIndex}`).slideDown(400);
         ui.scrollToBottom(400);
      },

      validateRecipeName: function() {
         const cocktailName = ui.$input_recipeCreateCocktailName.val();
         ui.recipeCreateCocktailNameIsValid = false;

         if(!cocktailName) {
            ui.$label_recipeCreateCocktailName.addClass("invalid");
            ui.$label_recipeCreateCocktailName.text("Cocktail Name is blank.");
         }
         else if(cocktailName.trim().length != cocktailName.length) {
            ui.$label_recipeCreateCocktailName.addClass("invalid");
            ui.$label_recipeCreateCocktailName.text("Cocktail Name begins/ends in whitespace.");
         }
         else {
            ui.$label_recipeCreateCocktailName.removeClass("invalid");
            ui.$label_recipeCreateCocktailName.text(ui.initialRecipeCreateCocktailNameLabel);
            ui.recipeCreateCocktailNameIsValid = true;
         }
      },

      validateIngredientBlocks: function() {
         //TODO: validateIngredientBlock()
         const ingredientBlocks = [];

         //Create array of present ingredientBlock id's to be used as reference
         $(".recipeCreate-ingredientBlock").each((index, element)=> {
            ingredientBlocks.push("#"+element.id);
         });


            // let currentIngredientName = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-name`).val();
            // let currentIngredientAmount = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-amount`).val();
            // let currentIngredientMeasurementUnit = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-measurementUnit`).val();
            // let currentIngredientAbv = $(`js-input-recipeCreate-ingredientBlock-${ingredientBlockIdIndex}-abv`).val();

            // console.log({
            //    currentIngredientName,
            //    currentIngredientAmount,
            //    currentIngredientMeasurementUnit,
            //    currentIngredientAbv
            // })

         console.log("located blocks:", ingredientBlocks);
      },

      validateRecipeCreateForm: function() {
         (ui.recipeCreateCocktailNameIsValid && ui.recipeCreateIngredientBlocksAreValid) ?
         ui.enableRecipeCreateSubmitButton()
         : ui.disableRecipeCreateSubmitButton();
      },

      disableRecipeCreateSubmitButton: function() {
         this.$button_recipeCreateFormSubmit.prop("disabled", true);
      },

      enableRecipeCreateSubmitButton: function() {
         this.$button_recipeCreateFormSubmit.prop("disabled", false);
      },

      buildRecipeCreateRequest: function() {
         //TODO: buildRecipeCreateRequest()
         const presentIngredientBlocks = $(".recipeCreate-ingredientBlock");
            console.log("Detected Ingredient Blocks:", presentIngredientBlocks);
         let cocktail = {};

         //Build cocktail from name and ingredient blocks...

         ui.createCocktail(cocktail);
      },

      //API Call
      createCocktail: function(cocktail) {
         //TODO: createCocktail()
      },
      //#endregion

      //#region Recipe View
      beforeShowingRecipeView: function() {
         return new Promise(async (resolve, reject)=> {
            ui.resetRecipeView();
            ui.renderRecipeView(appSession.currentCocktail);
            resolve();
         });
      },

      resetRecipeView: function() {
         //TODO: resetRecipeView()
      },

      renderRecipeView: function() {
         console.log("renderRecipeView():", appSession.currentCocktail.name);
         //TODO: renderRecipeView()
      },

      showRecipeView: async function(showAnimation) {
         ui.validateShowAnimation(showAnimation);
         await ui.beforeShowingRecipeView();
         ui.showView(ui.$view_recipe, showAnimation, $("#js-headerButton-recipeEdit, #js-headerButton-recipeBack"));
      },
      //#endregion

      //#region Recipe Edit View
      beforeShowingRecipeEditView: async function(recipe) {
         return new Promise((resolve, reject)=> {
            ui.resetRecipeEditView();
            ui.renderRecipeEditView(recipe);
            resolve();
         });
      },

      resetRecipeEditView: function() {
         //TODO: resetRecipeEditView()
      },

      renderRecipeEditView: function(recipe) {
         console.log("renderRecipeEditView():", appSession.currentCocktail.name);
         //TODO: renderRecipeEditView()
      },

      showRecipeEditView: async function(recipe, showAnimation) {
         ui.validateShowAnimation(showAnimation);
         await ui.beforeShowingRecipeEditView(recipe);
         ui.showView(ui.$view_recipeEdit, showAnimation, ui.$headerButton_cancelRecipeEdit);
      },

      //API Call
      updateRecipe: function() {
         //TODO: updateRecipe
      },
      //#endregion



      //#region View-agnostic Functions
      scrollToBottom: function(ms) {
         $("html").stop(true).animate({
            scrollTop: $(document).height()
         }, ms);
      },
      //#endregion

      //#region Animate.css Functions
         hideCurrentView: function(hideAnimation) {
            return new Promise((resolve, reject)=> {
               ui.validateHideAnimation(hideAnimation);

               //Hide all header buttons
               $("#wrapper-header-rightArea button").delay(100).fadeOut(300);
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

         showView: async function($view, showAnimation, $headerButtons) {
            ui.validateShowAnimation(showAnimation);

            await ui.showWithAnimation($view, showAnimation);
            if ($headerButtons) {
               //'transition' disabled to prevent animation interactions
               //'pointer-events' disabled to prevent erroneous clicks that confuse execution
               $headerButtons.css({
                  "pointer-events": "none",
                  "transition": "none"
               });
               $headerButtons.fadeIn(200, function() {
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
                     $(this).removeClass(`animated faster ${hideAnimation}`);
                     resolve();
                  });

                  //Trigger the animationEnd event handler by applying the animate.css classes
                  $elementPointer.addClass(`animated faster ${hideAnimation}`);
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
                     $(this).removeClass(`animated faster ${showAnimation}`);
                     resolve();
                  });

                  //Trigger the animationEnd event handler by applying the animate.css classes
                  $elementPointer.addClass(`animated faster ${showAnimation}`);
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