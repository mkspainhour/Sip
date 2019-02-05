const ui = {
   //#region jQuery Pointers
      $header: $("header"),

      $view_landing: $("#view-landing"),
         $button_register: $("#button-register"),
         $button_signIn: $("#button-signIn"),

      $view_signIn: $("#view-signIn"),
         $button_registerInstead: $("#button-registerInstead"),
         $text_signInInstructions: $("#signIn-instructions"),
         $input_signInUsername: $("#input-signIn-username"),
         $input_signInPassword: $("#input-signIn-password"),
         $button_signInSubmit: $("#button-signIn-submit"),

      $view_userHome: $("#view-user-home"),
         $button_signOut: $("#button-signOut"),
   //#endregion

   //#region UI State Information
      $activeView: null,
   //#endregion

   //#region Functions
      defaultSetup: function() {
         this.$activeView = this.$view_landing;
         this.configureEventListeners();
         this.showLandingView();
      },

      activeSessionSetup: function() {
         this.$activeView = this.$view_landing;
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
         this.$button_signIn.on("click", function(e) {
            ui.moveToView(ui.$view_signIn, "right", ui.$button_registerInstead);
         });

         $("#form-signIn input").on("input", function(e) {
            ui.validateSignInInputs();
         });

         this.$button_signInSubmit.on("click", function(e) {
            let enteredUsername = ui.$input_signInUsername.val();
            let enteredPassword = ui.$input_signInPassword.val();
            ui.signIn(enteredUsername, enteredPassword);
         });

         this.$button_signOut.on("click", function(e) {
            ui.signOut();
         });
      },

      showLandingView: function() {
         this.$view_landing.fadeIn(800);
         this.$button_signIn.css("transition", "none");
         this.$button_signIn.fadeIn(800, function() {
            ui.$button_signIn.css("transition", "");
         });
      },

      showUserView: function() {
         this.$view_userHome.fadeIn(800);
         this.$button_signOut.css("transition", "none");
         this.$button_signOut.fadeIn(800, function() {
            ui.$button_signOut.css("transition", "");
         });
      },

      moveToView: function($targetView, revealSide, $targetViewHeaderButton) {
         //#region revealSide validation
         let hideAnimation, showAnimation;
         if (revealSide == "right") {
            hideAnimation = "fadeOutLeft";
            showAnimation = "fadeInRight";
         }
         else if(revealSide == "left") {
            hideAnimation = "fadeOutRight";
            showAnimation = "fadeInLeft";
         }
         else {
            throw Error(`moveToSignInView(): revealSide must either equal "left" or "right".`);
         }
         //#endregion

         $("#header-right-wrapper *").delay(200).fadeOut(400);
         this.hideWithAnimation(this.$activeView, hideAnimation)
         .then(()=> {
            this.showWithAnimation($targetView, showAnimation);
            $targetViewHeaderButton.css("transition", "none");
            $targetViewHeaderButton.css("pointer-events", "none");
            $targetViewHeaderButton.delay(400).fadeIn(400, function() {
               $targetViewHeaderButton.css("transition", "");
               $targetViewHeaderButton.css("pointer-events", "");
            });
            this.$activeView = $targetView;
         });
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

      disableSignInSubmitButton: function() {
         this.$button_signInSubmit.prop("disabled", true);
      },

      enableSignInSubmitButton: function() {
         this.$button_signInSubmit.prop("disabled", false);
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
            this.moveToView(this.$view_userHome, "right", this.$button_signOut);
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
            this.moveToView(this.$view_landing, "left", this.$button_signIn);
         })
         .catch((returnData)=> {
            const errorStatus = returnData.status;
            const responseData = returnData.responseJSON;
            //TODO
            console.error("ERROR:", errorStatus, responseData);
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