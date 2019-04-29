"use strict";

const appSession = {
   sessionToken: getCookieValue("session"),
   user: getCookieValue("user"),
   userCocktails: null,
   activeCocktail: null,
   reset: function() {
      this.sessionToken = null;
      this.user = null;
      this.userCocktails = null;
      this.activeCocktail = null;
   }
}

$(function entryPoint() {
   //Prep
   ui.setup();

   //Begin
   if (appSession.sessionToken && appSession.user) {
      userHomeView.show("fadeIn");
   }
   else {
      landingView.show("fadeIn");
   }
});





//SECTION: Utility Functions
function getCookieValue(cookieName) {
   let locatedSegment = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
   return locatedSegment ? locatedSegment.pop() : null;
}

function pause(ms) {
   return new Promise((resolve)=> {
      setTimeout(resolve, ms);
   });
}

function round(value, decimalPoints) {
   let multiplier = Math.pow(10, decimalPoints||0);
   return Math.round(value * multiplier) / multiplier;
}