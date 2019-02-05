"use strict";

const flags = {
   sessionActive: document.cookie.indexOf("session") != -1
}

//Entry Point
$(function entryPoint() {
   flags.sessionActive ? ui.activeSessionSetup() : ui.defaultSetup();
});