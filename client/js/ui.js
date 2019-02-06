const ui = {
   //#region jQuery Pointers
      $header: $("header"),
         $headerButton_signIn: $("#button-signIn"),
         $headerButton_signInInstead: $("#button-signInInstead"),
         $headerButton_registerInstead: $("#button-registerInstead"),
         $headerButton_signOut: $("#button-signOut"),

      $view_landing: $("#view-landing"),
         $button_register: $("#button-register"),

      $view_signIn: $("#view-signIn"),
         $text_signInInstructions: $("#signIn-instructions"),
         $input_signInUsername: $("#input-signIn-username"),
         $input_signInPassword: $("#input-signIn-password"),
         $button_signInSubmit: $("#button-signIn-submit"),

      $view_register: $("#view-register"),
         $text_registerInstructions: $("#register-instructions"),
         $input_registerUsername: $("#input-register-username"),
         $input_registerEmail: $("#input-register-email"),
         $input_registerPassword: $("#input-register-password"),
         $input_registerConfirmPassword: $("#input-register-confirmPassword"),
         $button_registerSubmit: $("#button-register-submit"),

      $view_userHome: $("#view-userHome"),
   //#endregion

   //#region UI State Information
      $currentView: null,
   //#endregion

   //#region Functions
      defaultSetup: function() {
         this.configureEventListeners();
         this.showLandingView();
      },

      activeSessionSetup: function() {
         this.configureEventListeners();
         this.showUserView();
      },

      configureEventListeners: function() {
         //If the user navigations with the mouse, accessibility focus outlines can be hidden
         $(window).on("mousedown", function handleClick(e) {
            if($("html").hasClass("user-navigates-with-keyboard")) {
               $("html").removeClass("user-navigates-with-keyboard");
            }
         });

         //If they tab key is pressed, restore accessibility focus outlines
         $(window).on("keydown", function handleTab(e) {
            if($("html").hasClass("user-navigates-with-keyboard") == false) {
               if (e.keyCode === 9) {
                  $("html").addClass("user-navigates-with-keyboard");
               }
            }
         });

         //Header, Sign In Button
         this.$headerButton_signIn.on("click", function(e) {
            ui.moveToView(ui.$view_signIn, "fadeInRight", ui.$headerButton_registerInstead);
         });

         ui.$button_register.on("click", function(e) {
            ui.moveToView(ui.$view_register, "fadeInRight", ui.$headerButton_signInInstead);
         });

         ui.$headerButton_registerInstead.on("click", function(e) {
            ui.clearSignInForm();
            ui.moveToView(ui.$view_register, "fadeInRight", ui.$headerButton_signInInstead);
         });

         ui.$headerButton_signInInstead.on("click", function(e) {
            ui.clearRegistrationForm();
            ui.moveToView(ui.$view_signIn, "fadeInLeft", ui.$headerButton_registerInstead);
         });

         $("#form-signIn input").on("input", function(e) {
            ui.validateSignInInputs();
         });

         this.$button_signInSubmit.on("click", function(e) {
            let enteredUsername = ui.$input_signInUsername.val();
            let enteredPassword = ui.$input_signInPassword.val();
            ui.signIn(enteredUsername, enteredPassword);
         });

         $("#form-register input").on("input", function(e) {
            ui.validateRegistrationInputs();
         });

         this.$button_registerSubmit.on("click", function(e) {
            let enteredUsername = ui.$input_registerUsername.val();
            let enteredPassword = ui.$input_registerPassword.val();
            let enteredEmail = ui.$input_registerEmail.val();
            ui.register(enteredUsername, enteredPassword, enteredEmail);
         });

         this.$headerButton_signOut.on("click", function(e) {
            ui.signOut();
         });
      },

      showLandingView: function() {
         ui.moveToView(ui.$view_landing, "fadeIn", ui.$headerButton_signIn);
      },

      showUserView: function() {
         ui.moveToView(ui.$view_userHome, "fadeIn", ui.$headerButton_signOut);
      },

      moveToView: function($view, showAnimation, $headerButtons = null) {
         let hideAnimation;
         if (showAnimation == "fadeInRight") {
            hideAnimation = "fadeOutLeft";
         }
         else if (showAnimation == "fadeInLeft") {
            hideAnimation = "fadeOutRight";
         }
         else if (showAnimation == "fadeIn") {
            hideAnimation = null;
         }
         else {
            throw Error(`moveToView(): showAnimation must either equal "fadeInRight", "fadeInLeft", or "fadeIn".`);
         }

         //Hide all present header buttons
         $("#header-right-wrapper *").delay(150).fadeOut(400);

         let showViewAndButtons = function($view, showAnimation, $headerButtons) {
            ui.showWithAnimation($view, showAnimation);
            if ($headerButtons) {
               //'transition' is disabled to prevent interaction with animate.css '.view' transitions.
               $headerButtons.css("transition", "none");
               //'pointer-events' is disabled to prevent erroneous clicks that confuse execution.
               $headerButtons.css("pointer-events", "none");
               $headerButtons.delay(200).fadeIn(500, function() {
                  //settings are restored after the animations end
                  $headerButtons.css("transition", "");
                  $headerButtons.css("pointer-events", "");
               });
            }
         };
         if (ui.$currentView && hideAnimation) {
            this.hideWithAnimation(ui.$currentView, hideAnimation)
            .then(()=> {
               showViewAndButtons($view, showAnimation, $headerButtons);
            });
         }
         else {
            showViewAndButtons($view, showAnimation, $headerButtons);
         }
         //sets UI state variable for reference elsewhere
         this.$currentView = $view;
      },

      validateSignInInputs: function() {
         enteredUsername = this.$input_signInUsername.val();
         enteredPassword = this.$input_signInPassword.val();

         if(enteredUsername.trim().length >= 1 && enteredPassword.length >= 1) {
            this.enableSignInSubmitButton();
         }
         else {
            this.disableSignInSubmitButton();
         }
      },

      clearSignInForm: function() {
         ui.$input_signInUsername.val("");
         ui.$input_signInPassword.val("");
      },

      validateRegistrationInputs: function() {
         let enteredUsername = this.$input_registerUsername.val();
         let enteredPassword = this.$input_registerPassword.val();
         let enteredPasswordConfirmation = this.$input_registerConfirmPassword.val();

         if(enteredUsername.length < 1) {
            this.disableRegisterSubmitButton();
            ui.$text_registerInstructions.text("Please enter your desired username.");
         }
         else if(enteredUsername.trim().length != enteredUsername.length) {
            this.disableRegisterSubmitButton();
            ui.$text_registerInstructions.text("Your username cannot begin or end with whitespace characters.");
         }
         else if(enteredPassword.length < 10) {
            this.disableRegisterSubmitButton();
            ui.$text_registerInstructions.text("Your password must be at least 10 characters long.");
         }
         else if(enteredPassword.length >= 10 && enteredPasswordConfirmation.length == 0) {
            this.disableRegisterSubmitButton();
            ui.$text_registerInstructions.text("Please confirm your password by entering it a second time.");
         }
         else if(enteredPassword != enteredPasswordConfirmation) {
            this.disableRegisterSubmitButton();
            ui.$text_registerInstructions.text("Your password and password confirmation do not match.");
         }
         else {
            this.enableRegisterSubmitButton();
            ui.$text_registerInstructions.text("Looks good! Click the register button below to continue.");
         }
      },

      clearRegistrationForm: function() {
         ui.$text_registerInstructions.text("Please enter your desired username.");
         ui.$input_registerUsername.val("");
         ui.$input_registerEmail.val("");
         ui.$input_registerPassword.val("");
         ui.$input_registerConfirmPassword.val("");
      },

      disableSignInSubmitButton: function() {
         this.$button_signInSubmit.prop("disabled", true);
      },

      enableSignInSubmitButton: function() {
         this.$button_signInSubmit.prop("disabled", false);
      },

      disableRegisterSubmitButton: function() {
         this.$button_registerSubmit.prop("disabled", true);
      },

      enableRegisterSubmitButton: function() {
         this.$button_registerSubmit.prop("disabled", false);
      },

      //POST /api/auth/sign-in
      signIn: function(username, password) {
         $.ajax({
            method: "POST",
            url: "/api/auth/sign-in",
            contentType: "application/json",
            data: JSON.stringify({
               username: username,
               password: password
            }),
            dataType: "json"
         })
         .then(()=> {
            ui.moveToView(ui.$view_userHome, "fadeInRight", ui.$headerButton_signOut);
         })
         .catch((returnData)=> {
            const errorStatus = returnData.status;
            const responseData = returnData.responseJSON;
            //TODO
            console.error("ERROR:", errorStatus, responseData);
         });
      },

      //GET /api/auth/sign-out
      signOut: function() {
         $.ajax({
            method: "GET",
            url: "/api/auth/sign-out",
            dataType: "json"
         })
         .then((returnData)=> {
            console.log(returnData);
            this.moveToView(ui.$view_landing, "fadeInLeft", ui.$headerButton_signIn);
         })
         .catch((returnData)=> {
            const errorStatus = returnData.status;
            const responseData = returnData.responseJSON;
            //TODO
            console.error("ERROR:", errorStatus, responseData);
         });
      },

      //POST /api/user/create
      register: function(username, password, email = "") {
         let requestData = {
            username,
            password
         }

         if(email) {
            requestData.email = email;
         }

         console.log(requestData);

         $.ajax({
            method: "POST",
            url: "/api/user/create",
            contentType: "application/json",
            data: JSON.stringify(requestData),
            dataType: "json"
         })
         .then((returnData)=> {
            console.log(returnData);
            this.moveToView(ui.$view_userHome, "fadeInRight", ui.$headerButton_signOut);
         })
         .catch((returnData)=> {
            const errorStatus = returnData.status;
            const errorType = returnData.responseJSON.errorType;
            const responseData = returnData.responseJSON;

            console.error(`ERROR: ${errorType}`);
            if (errorType == "CredentialNotUnique") {
               ui.$text_registerInstructions.text("Unfortunately, that username is already in use.");
               ui.$input_registerUsername.val("");
               ui.disableRegisterSubmitButton();
            }
            else {
               console.error(`Server response: ${responseData}`);
            }
         });
      },

      //Target an element and hide it using an animate.css animation
      hideWithAnimation: function($elementPointer, animationName) {
         return new Promise((resolve, reject)=> {
            if ($elementPointer.css("display") != "none") {
               const animationEndEventPolyfill = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

               $elementPointer.addClass("animated");
               $elementPointer.addClass("fast");
               $elementPointer.addClass(animationName);
               $elementPointer.one(animationEndEventPolyfill, function() {
                  $(this).hide(0);
                  $(this).removeClass("animated");
                  $(this).removeClass("fast");
                  $(this).removeClass(animationName);
                  resolve();
               });
            }
            else {
               reject(`hideWithAnimation() cannot be called on an already hidden element.`);
            }
         })
      },

      //Target an element and show it using an animate.css animation
      showWithAnimation: function($elementPointer, animationName) {
         return new Promise((resolve, reject)=> {
            if ($elementPointer.css("display") == "none") {
               const animationEndEventPolyfill = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

               $elementPointer.one(animationEndEventPolyfill, function() {
                  $(this).removeClass("animated");
                  $(this).removeClass("fast");
                  $(this).removeClass(animationName);
                  resolve();
               });
               $elementPointer.addClass("animated");
               $elementPointer.addClass("fast");
               $elementPointer.addClass(animationName);
               $elementPointer.show(0);
            }
            else {
               reject(`showWithAnimation() cannot be called on an already shown element.`);
            }
         })
      }
   //#endregion
};