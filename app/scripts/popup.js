'use strict';

// This script is called when the user creates a new redirect.
// It maps the user-given key to a redirect. 
var currentTab;

// Called when a user wants to save a key as a redirect to the currently open tab.
// If the key is not undefined or empty, it is saved.
var saveData = async function() {
    var given_key = document.getElementById("inputval").value;
    if(given_key != undefined &&  given_key != "" &&  given_key != " ") {
        document.getElementById("confirmation").innerHTML = "Your Redirect was created! <br />" +
            "<b>" + given_key + "</b>" + " --> " + currentTab; 
        
        // Save to chrome.storage.local instead of localStorage
        const data = {};
        data[given_key] = currentTab;
        await chrome.storage.local.set(data);
    }
}

// Updates the variable that keeps track of the current tab.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currentTab = tabs[0].url;
});

// Opens the settings page.
var openSettings = function() {
    chrome.tabs.create({
        url: 'settings.html'
    });
}

document.querySelector('#submit').addEventListener('click', saveData);
document.querySelector('#settings').addEventListener('click', openSettings);