'use strict';

// This script contains logic for the settings page. It allows users to 
// create new directs and delete ones. 

// When the user specifies a key and redirect, it's saved. 
var createRedirect = async function() {
  var given_key = document.getElementById("newInput").value;
  var redirect = document.getElementById("url").value;
  if (redirect.substring(0, 7) != "http://" && redirect.substring(0, 8) != "https://") {
    // TODO: There may be a better way of doing this. Regex?
    redirect = "http://".concat(redirect);  
  }

  // TODO: factor out this code
  if(given_key != undefined && given_key != "" && given_key != " ") {
    document.getElementById("confirmationVal").innerHTML = "Your Redirect was created! <br />" +
      "<b>" + given_key + "</b>" + " --> " + redirect; 
    
    // Save to chrome.storage.local instead of localStorage
    const data = {};
    data[given_key] = redirect;
    await chrome.storage.local.set(data);
  }  
}

// Displays saved redirects in a table.
window.onload = async function() {
  var table = document.getElementById("mainTables");

  // Get all stored redirects
  const allRedirects = await chrome.storage.local.get(null);
  
  for (var key in allRedirects) {
    // Creates an empty table row and adds it to the first position of the table
    var row = table.insertRow(-1);

    // Insert three new cells into the new table row
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    // Populates the new cells with text and a delete button
    cell1.innerHTML = key;
    cell2.innerHTML = allRedirects[key]; 
    cell3.innerHTML = "<button id='" + key + "' class='removeElement'>Remove</button>" 
  }

  var items = document.getElementsByClassName("removeElement");
  for (var i = 0; i < items.length; i++) {
    items[i].onclick = function() {removeRedirect(this);}
  } 
}

// Removes the key, redirect, and row in the table and refreshes the page so that
// the table of redirects is updated.
var removeRedirect = async function(button) {  
    var key = button.id;
    console.log("Deleting " + button.id); 
    await chrome.storage.local.remove(key);
    chrome.tabs.reload();
}

var button = document.getElementById("new").onclick = createRedirect;
var remove = document.getElementsByClassName("removeElement").onclick = function () {gallerymake();};