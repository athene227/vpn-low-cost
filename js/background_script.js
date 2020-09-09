/*************************************************** background_script.js **************************************************************
The background script recieves data from the content_script.js and sends it to the backend server for parsing and further calculations,*
then recieves the results and sends it back to the content_script so it could display the user with the results.					   *
****************************************************************************************************************************************/
console.log("background is on!");
chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse){
  sendResponse = "Recieved: " + message;

  // chrome.tabs.query({
  //     active: true,
  //      currentWindow: true
  //    }, function(tabs) {
  //      chrome.tabs.sendMessage(tabs[0].id, sendResponse);
  //   });

//Sends a message to the server with the user input for parse and calculations.
  $.ajax({
      url: "http://localhost:8081",
      type: "POST",
      data: message,
      crossDomain: true,
      success: function(data, status, jqXhr){
        console.log(data);
        // alert(data);

        chrome.tabs.query({
            active: true,
             currentWindow: true
           }, function(tabs) {
             chrome.tabs.sendMessage(tabs[0].id, data);
          });

      },
      error: function(jqXhr, textStatus, errorMessage){
        console.log("Failure to connect! Error: " + errorMessage);
      }
  });
}
