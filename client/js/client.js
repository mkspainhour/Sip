"use strict";

const launchFlags = {
   sessionCookiePresent: getCookieValue("session") != null,
   userCookiePresent: getCookieValue("user") != null
}

const appSession = {
   currentUser: getCookieValue("user")
}



$(function entryPoint() {
   //Prep
   ui.setup();

   //Begin
   if (launchFlags.sessionCookiePresent && launchFlags.userCookiePresent) {
      appSession.currentUser = getCookieValue("user");
      ui.showUserHomeView("fadeIn");
   }
   else {
      ui.showLandingView("fadeIn");
   }
});





//Utility Functions
function getCookieValue(cookieName) {
   //Credit: https://stackoverflow.com/a/25490531
   var locatedSegment = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
   return locatedSegment ? locatedSegment.pop() : null;
}

function pause(ms) {
   return new Promise((resolve)=> {
      setTimeout(resolve, ms);
   });
}