/************************************* content_script.js **************************************************************
The content script sends message to the background_script.js upon any change in the browser - 						  *
for our use, it's in case of any input of the fields.																  *
Then the content_scripts awaits for a response message from the background_script.js with the results 				  *
which were calculated by the backend server.																		  *
***********************************************************************************************************************/

console.log("vpn-low-cost is on!");

chrome.runtime.onMessage.addListener(messageRecieved);

//Just a test of ours to see if the extension works on a specific site, in this case the extension changes all the paragraphs background to purple.
let paragraphs = document.getElementsByTagName('p');
for (elt of paragraphs) {
    elt.style['background-color'] = '#FF00FF';
}

let from = document.querySelector('[placeholder = "From"]');
from.onchange = function(){
    let msg = from.value;
    chrome.runtime.sendMessage(msg);
  };

  function messageRecieved(message, sender, sendResponse){
    console.log(message);
  }
