/* global document, console, chrome, setTimeout, window */
"use strict";

// This script is called when the user creates a new redirect.
// It maps the user-given key to a redirect.
var currentTab;

var commonFunctions = window.commonFunctions;

function getCurrentKey() {
  return document.getElementById("inputval").value;
}

// Called when a user wants to save a key as a redirect to the currently open tab.
// If the key is not undefined or empty, it is saved.
var saveData = function saveData() {
  const key = getCurrentKey();
  if (!commonFunctions.isValidKey(key)) {
    commonFunctions.alertIsInvalidKey();
    return;
  }
  commonFunctions.checkKeyAndSave(key, currentTab, showCurrentRedirects);
};

// Updates the variable that keeps track of the current tab.
chrome.tabs.query(
  {
    active: true,
    lastFocusedWindow: true,
  },
  function (tabs) {
    // and use that tab to fill in out title and url
    const tab = tabs[0];
    currentTab = tab?.url;
  },
);

// Opens the settings page.
var openSettings = function () {
  chrome.runtime.openOptionsPage();
};

/**
 * Called after all Redirects are examined. Prints a message if no Redirects
 * are created for the current url.
 */
var showMsg = function showMsg(hasKeys) {
  if (!hasKeys) {
    var messg = "No Redirects created for this url.";
    document.getElementById("_noRedirects").textContent = messg;
  }
};

/**
 * Examines all saved Redirects for the current url and
 * displays them in an unordered list.
 */
var showCurrentRedirects = function showCurrentRedirects() {
  var hasKeys = false;
  var ul = document.getElementById("currentRedirects");

  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  chrome.storage.sync.get(null, function (items) {
    for (var key in items) {
      // check hasOwnProperty to make sure it's a key and doesn't come from the
      // prototype
      if (items.hasOwnProperty(key) && !commonFunctions.isPrivateKey(key)) {
        if (currentTab === items[key]) {
          hasKeys = true;
          var elem = document.createElement("li");
          elem.innerHTML = key;

          ul.appendChild(elem);

          var msg = "Redirects for this url:";
          document.getElementById("_redirectsMsg").textContent = msg;
        }
      }
    }
    showMsg(hasKeys);
  });
};

document
  .querySelector("#inputForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    saveData();
  });

document.querySelector("#submit").addEventListener("click", saveData);
document.querySelector("#settings").addEventListener("click", openSettings);
document.querySelector("#overwrite").addEventListener("click", () => {
  commonFunctions.saveDataGuarantee({
    optionalKey: getCurrentKey(),
    optionalUrl: currentTab,
    callback: showCurrentRedirects,
  });
});
document
  .querySelector("#cancel")
  .addEventListener("click", commonFunctions.cancel);

// Focus on the text box for immediate typing. We have to set a timeout because
// without one the focus change doesn't take. It seems like this is because the
// popup isn't completely rendered when we're trying to act on it. This 100ms
// timeout feels instantaneous to the user but lets the page render first.
setTimeout(function foo() {
  document.getElementById("inputval").focus();
}, 100);

// Displays previously created redirects
window.onload = function () {
  showCurrentRedirects();
};
