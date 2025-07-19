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

// Display existing redirects for the current URL
var showExistingRedirects = async function() {
    // Get all redirects
    const allRedirects = await chrome.storage.local.get(null);
    const existingKeys = [];
    
    // Find keys that redirect to the current URL
    for (const key in allRedirects) {
        if (allRedirects[key] === currentTab) {
            existingKeys.push(key);
        }
    }
    
    // Display existing redirects if any
    if (existingKeys.length > 0) {
        const existingDiv = document.createElement('div');
        existingDiv.id = 'existing';
        existingDiv.style.marginTop = '10px';
        existingDiv.style.fontSize = '11px';
        existingDiv.style.color = '#666';
        existingDiv.innerHTML = '<b>Existing shortcuts:</b><ul>' + 
            existingKeys.map(key => '<li>' + key + '</li>').join('') + 
            '</ul>';
        
        // Insert after the confirmation paragraph
        const confirmation = document.getElementById('confirmation');
        confirmation.parentNode.insertBefore(existingDiv, confirmation.nextSibling);
    }
}

// Updates the variable that keeps track of the current tab.
chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
    currentTab = tabs[0].url;
    // Show existing redirects after getting current tab
    await showExistingRedirects();
});

// Opens the settings page.
var openSettings = function() {
    chrome.tabs.create({
        url: 'settings.html'
    });
}

document.querySelector('#submit').addEventListener('click', saveData);
document.querySelector('#settings').addEventListener('click', openSettings);