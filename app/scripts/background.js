"use strict";

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(async function (text, suggest) {
  const result = await chrome.storage.sync.get(text);
  const url = result[text];

  if (url == undefined) {
    chrome.omnibox.setDefaultSuggestion({ description: "No redirect found." });
  } else {
    chrome.omnibox.setDefaultSuggestion({
      description: "Redirecting you to: " + url,
    });
  }
});

// This event is fired when the user accepts the input in the omnibox.
// It opens the redirect that the user-given key maps to.
chrome.omnibox.onInputEntered.addListener(async function (text) {
  const result = await chrome.storage.sync.get(text);
  const urlval = result[text];
  console.log("url: " + urlval);
  if (urlval != undefined) {
    chrome.tabs.update({ url: urlval });
  }
});
