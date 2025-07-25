/* global window, console, document, chrome, localStorage */

// Functions shared between pages.
"use strict";

var scoped = function () {
  // A string representing the current version. Should be incremented with each
  // release.
  var VERSION = "1.3.1";
  // The key in the key value store under which the version is saved. It is
  // important to note the leading underscore, which prevents collisions with
  // user-defined redirects (at least as of alphanumeric checking introduced in
  // 1.1.0).
  var VERSION_KEY = "_version";

  // The error code when trying to access local storage.
  var ERROR_FLAG = -1;

  var MSG_SAVE_FAIL = "Your redirect was not saved: ";
  var MSG_SAVE_SUCCESS = "Your redirect was created!<br>";
  var MSG_BAD_KEY = "Redirects must have at least one character.";

  // The public object we are going to expose on window.
  var pub = {};
  pub.version = VERSION;
  pub.errorFlag = ERROR_FLAG;

  /**
   * Returns true if str is a valid key, else returns false.
   */
  pub.isValidKey = function isValidKey(str) {
    if (!str) {
      // null, '', and undefined checking. Must be truthy.
      return false;
    }
    return true;
  };

  pub.saveDataGuarantee = function saveDataGuarantee({
    optionalKey,
    optionalUrl,
    callback,
  }) {
    document.getElementById("overwriteDiv").style.display = "none";
    var key = document.getElementById("inputval").value;
    if (typeof currentTab !== "undefined") {
      pub.saveRedirect(key, currentTab);
    } else {
      pub.createRedirectSettings({
        guarentee: "guarentee",
        optionalKey,
        optionalUrl,
        callback,
      });
    }
  };

  // Since the user is creating the Redirect, we're not guaranteed that the
  // Redirect is properly formatted.
  pub.createRedirectSettings = function createRedirectSettings({
    // the string 'guarentee' to skip checking if you are overriding
    guarentee,
    optionalKey,
    optionalUrl,
    callback,
  }) {
    var givenKey = optionalKey ?? document.getElementById("inputval").value;
    var redirect = optionalUrl ?? document.getElementById("url").value;

    if (!pub.isValidKey(givenKey)) {
      pub.alertIsInvalidKey();
      return;
    }

    // If they didn't include the scheme, we need to include it.
    if (
      !redirect.includes("chrome://") &&
      !redirect.includes("chrome-extension") &&
      !/^http[s]?:\/\//.test(redirect)
    ) {
      redirect = "https://".concat(redirect);
    }
    if (guarentee === "guarentee") {
      pub.saveRedirect(givenKey, redirect, callback);
    } else {
      pub.checkKeyAndSave(givenKey, redirect, callback);
    }
  };

  pub.cancel = function cancel() {
    document.getElementById("overwriteDiv").style.display = "none";
  };

  pub.showReconfirmationMessage = function showReconfirmationMessage(
    key,
    value,
  ) {
    document.getElementById("priors").style.display = "none";
    document.getElementById("formDiv").style.display = "none";
    document.getElementById("overwriteDiv").style.display = "inherit";
    var messg = key + " → " + value;
    document.getElementById("msgOverwrite").textContent = messg;
    document.getElementById("inputval").value = key;
  };

  pub.alertIsInvalidKey = function alertIsInvalidKey() {
    pub.setMessage(MSG_BAD_KEY);
  };

  pub.showReconfirmationMessage = function showReconfirmationMessage(
    key,
    value,
  ) {
    document.getElementById("overwriteDiv").style.display = "inherit";
    var messg = key + " → " + value;
    document.getElementById("msgOverwrite").textContent = messg;
  };

  pub.checkKeyAndSave = function checkKeyAndSave(key, currentTab, success) {
    var exists = false;
    var value = "";
    chrome.storage.sync.get(key, function (items) {
      for (key in items) {
        exists = true;
        value = items[key];
      }

      // Ask user to reconfirm their key if it already exists
      if (exists) {
        pub.showReconfirmationMessage(key, value);
      } else {
        pub.saveRedirect(key, currentTab, success);
      }
    });
  };

  /**
   * Sets msg to be displayed to the user. If msg is not truthy, does nothing.
   * This uses .innerHTML, permitting styling, but also requiring the caller to
   * escape the message as necessary.
   *
   * This function expects confirmation to occur in an element with the id
   * '_confirmation'. The underscore is important as it is illegal in keys,
   * ensuring that keys are safe to use as id values in HTML elements.
   */
  pub.setMessage = function setMessage(msg) {
    var confirmationElId = "_confirmation";
    if (!msg) {
      console.log("untruthy str passed to setMessage: " + msg);
      return;
    }
    document.getElementById("_confirmation").innerHTML = msg;
  };

  /**
   * Save the redirect. It is the caller's responsibility to ensure that the
   * key is valid and safe for storage.
   *
   * success is an optional callback called on success
   */
  pub.saveRedirect = function saveRedirect(key, value, success) {
    var keyValue = {};
    keyValue[key] = value;
    chrome.storage.sync.set(keyValue, function () {
      if (chrome.runtime.lastError) {
        console.error('could not save "' + key + '" → "' + value + '"');
        console.error(chrome.runtime.lastError);
        // Something went wrong saving.
        pub.setMessage(MSG_SAVE_FAIL + chrome.runtime.lastError);
      } else {
        pub.setMessage(MSG_SAVE_SUCCESS + key + " → " + value);
        var noRedirect = document.getElementById("_noRedirects");
        if (noRedirect) {
          noRedirect.style.display = "none";
        }
        document.getElementById("overwriteDiv").style.display = "none";

        if (success) {
          // invoke if present
          success();
        }
      }
    });

    var priors = document.getElementById("priors");
    if (priors) {
      priors.innerHTML = "";
    }
  };

  /**
   * Returns the version saved in storage. callback is invoked on completion.
   * It accounts for three cases with (parameters).
   *
   * 1) Success and an existing version (version_string)
   * 2) Success and no prior existing version (null)
   * --This will only occur when upgrading from 1.0.2
   * 3) Error (-1, error_msg)
   * --The error warning is defined by ERROR_FLAG, and in this example is -1
   */
  pub.getSavedVersion = function getSavedVersion(callback) {
    if (!callback) {
      // No callback, so we can't communicate with the caller. Do nothing.
      console.log("A callback function must be passed to getSavedVersion");
      return;
    }
    chrome.storage.sync.get(VERSION_KEY, function (items) {
      if (chrome.runtime.lastError) {
        // An error occurred.
        callback(pub.errorFlag, chrome.runtime.lastError);
        return;
      }
      if (items.hasOwnProperty(VERSION_KEY)) {
        // We have a previous version saved.
        callback(items[VERSION_KEY]);
      } else {
        // No previous version was saved in storage.
        callback(null);
      }
    });
  };

  /**
   * Returns true if the key is not a redirect but a key private to the
   * extension machinery. This gives Redirect a way to store values that were
   * not created by users (e.g. a version string) in storage. Returns false if
   * not a private key or if key isn't truthy.
   */
  pub.isPrivateKey = function isPrivateKey(key) {
    if (key) {
      // We are assuming private keys start with a leading underscore.
      return key.startsWith("_");
    } else {
      console.log("key passed to isPrivateKey() was not truthy: " + key);
      return false;
    }
  };

  /**
   * Performs a version upgrade.
   */
  function upgrade() {
    pub.getSavedVersion(function (version, errMsg) {
      if (version === pub.errorFlag) {
        console.log("An error occurred during upgrade attempt: " + errMsg);
        return;
      }
      if (version === null) {
        // Upgrading from 1.0.2, which did not have a version saved.
        // Copy all keys from local storage.
        var keyValues = {};
        for (var key in localStorage) {
          keyValues[key] = localStorage[key];
        }
        // At this point we want to write the redirects to sync storage. After
        // that has completed, we want to add the version key to sync storage.
        // chrome.storage.sync.set() can fail during write, at which point we
        // might be left in an indeterminate state. This will be compounded if
        // using pub.saveRedirect(), which saves a single key at a time.
        // Instead we are going to call the storage API directly.
        chrome.storage.sync.set(keyValues, function () {
          if (chrome.runtime.lastError) {
            console.log(
              "Error occurred during upgrade attempt. " +
                "Upgrade was not completed: " +
                chrome.runtime.lastError,
            );
          } else {
            var versionInfo = {};
            versionInfo[VERSION_KEY] = pub.version;
            chrome.storage.sync.set(versionInfo, function () {
              if (chrome.runtime.lastError) {
                console.log(
                  "Version could not be written to storage: " +
                    chrome.runtime.lastError,
                );
              } else {
                console.log("Upgraded to " + pub.version + "!");
              }
            });
          }
        });
      }
    });
  }

  // Every time this script is loaded, attempt an upgrade.
  upgrade();

  return pub;
};

window.commonFunctions = scoped();
