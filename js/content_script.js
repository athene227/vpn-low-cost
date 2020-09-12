/************************************* content_script.js **************************************************************
The content script sends message to the background_script.js upon any change in the browser - 						  
for our use, it's in case of any input of the fields.																  
Then the content_scripts awaits for a response message from the background_script.js with the results 				  
which were calculated by the backend server.																		 
***********************************************************************************************************************/
const DIV_CLASS = "BpkCard_bpk-card__2xTqy BpkCard_bpk-card--padded__XtKLq TopMessage_safetyContainer__2oXBS";
const SUBMIT_BTN_CLASS = '[class = "BpkButtonBase_bpk-button__1pnhi BpkButtonBase_bpk-button--large__24bi- App_submit-button__3OawW App_submit-button-oneline__23Etl"]';
const PASSENGERS_POP_CLASS = ".BpkPopover_bpk-popover__body--padded__2lfLC";
const CABIN_DROP_DOWN_ID = "#search-controls-cabin-class-dropdown";
const AMOUNT_ADULTS_ID = "#search-controls-adults-nudger";
const AMOUNT_CHILDREN_ID = "#search-controls-children-nudger"
const CHILD_AGE_DROPDOWN_ID = "#children-age-dropdown-";
const ORIGIN_ID = "#fsc-origin-search";
const DESTINATION_ID = "#fsc-destination-search";
const DEPART_DATEPICKER_ID = "#depart-fsc-datepicker-button";
const RETURN_DATEPICKER_ID = "#return-fsc-datepicker-button";
const MAIN_PAGE_IDENTIFIER = "BpkText_bpk-text__SIwCj BpkText_bpk-text--xxl__2l0f2 BpkText_bpk-text--bold__1vmGe HeroImage_Title__3qMie";

console.log("vpn-low-cost is on!");

chrome.runtime.onMessage.addListener(messageRecieved);

var numOfAdults = 1;
var numOfChildren = 0;
var childrenAges = [];
var cabinClass = "Economy";

if(document.querySelector(SUBMIT_BTN_CLASS) != null){
  document.querySelector(SUBMIT_BTN_CLASS).addEventListener("click", gatherInfoFromPage);

  var mutationObj = new MutationObserver(()=>{
    if(document.querySelector(PASSENGERS_POP_CLASS) != null)
    {
      document.querySelector(PASSENGERS_POP_CLASS).addEventListener('mouseleave', getPassengerInfo);

      function getPassengerInfo()
      {
        childrenAges = [];

        if(document.querySelector(CABIN_DROP_DOWN_ID) != null){
          cabinClass = document.querySelector(CABIN_DROP_DOWN_ID).value;
        }

        numOfAdults = document.querySelector(AMOUNT_ADULTS_ID).value;
        numOfChildren = document.querySelector(AMOUNT_CHILDREN_ID).value;

        for(var i = 0; i < numOfChildren; i++){
          elementId = CHILD_AGE_DROPDOWN_ID + i
          childrenAges.push(document.querySelector(elementId).selectedIndex - 1);
        }
      }
    }
  });

  var body = document.querySelector("body");
  var bodyMutationConfig = {childList: true};
  mutationObj.observe(body, bodyMutationConfig);
}


function gatherInfoFromPage(){
  var message = "";

  console.log(numOfAdults);

  let from = document.querySelector(ORIGIN_ID).value
  let to = document.querySelector(DESTINATION_ID).value;
  let departureDate = document.querySelector(DEPART_DATEPICKER_ID).innerText;
  let returnDate = document.querySelector(RETURN_DATEPICKER_ID).innerText;
  let isDirectFlightsOnly = document.getElementsByName("directOnly")[0].checked;

  message += from + ";";
  message += to + ";";
  message += departureDate + ";";
  message += returnDate + ";";
  message += numOfAdults + ";";
  message += numOfChildren + ";";
  message += childrenAges + ";";
  message += cabinClass + ";";
  message += isDirectFlightsOnly;

  console.log(message);
  chrome.runtime.sendMessage(message);
}

function messageRecieved(message, sender, sendResponse){
  console.log("Received: " + message);
  if(document.getElementsByClassName(MAIN_PAGE_IDENTIFIER)[0] == undefined ){
    var messageArray = message.split(".");

    console.log(messageArray);
  
    var div = document.createElement("div");
    div.className = DIV_CLASS;
    div.style.backgroundColor = "#FFCEED";
  
    div.appendChild(createResultElement(messageArray));
    var resultDivElement = document.getElementById("pagewrap");
    resultDivElement.insertBefore(div, resultDivElement.childNodes[0]);
  }
}

function createResultElement(messageInArray){
  var table = document.createElement("table");
  var tr = document.createElement("tr");
  var td1 = document.createElement("td");
  var img = document.createElement("img");
  img.width = "90";
  img.height = "90";
  img.src = "https://image.flaticon.com/icons/svg/984/984233.svg";
  td1.appendChild(img);
  tr.appendChild(td1);

  var blankRow = document.createElement("tr");
  blankRow.appendChild(document.createElement("td").appendChild(document.createElement("p")));
  var td2 = document.createElement("td");
  var subTable = document.createElement("table");
  var subTr1 = document.createElement("tr");
  var subTr2 = document.createElement("tr");
  var subTr3 = document.createElement("tr");
  var subTr4 = document.createElement("tr");
  var subTd1 = document.createElement("td");
  var subTd2 = document.createElement("td");
  var subTd3 = document.createElement("td");
  var subTd4 = document.createElement("td");
  var firstLine = document.createElement("p");
  firstLine.className = "BpkText_bpk-text__2NHsO BpkText_bpk-text--base__2vfTl TopMessage_adviceContainer__1Zieo";
  var firstLineText = document.createTextNode(messageInArray[0] + ".");
  firstLine.appendChild(firstLineText);
  subTd1.appendChild(firstLine);
  subTr1.appendChild(subTd1);
  var secondLine = document.createElement("p");
  secondLine.className = "BpkText_bpk-text__2NHsO BpkText_bpk-text--base__2vfTl TopMessage_adviceContainer__1Zieo";
  var secondLineText;

  if(messageInArray[1] != undefined && messageInArray[1] != null && messageInArray[1] != ""){
    secondLineText = document.createTextNode(messageInArray[1] + ".");
  }
  else{
    secondLineText = document.createTextNode("");
    img.width = "30";
    img.height = "30";
  }

  secondLine.appendChild(secondLineText);
  subTd2.appendChild(secondLine);
  subTr2.appendChild(subTd2);
  var thirdLine = document.createElement("p");
  thirdLine.className = "BpkText_bpk-text__2NHsO BpkText_bpk-text--base__2vfTl TopMessage_adviceContainer__1Zieo";
  var thirdLineText;

  if(messageInArray[2] != undefined && messageInArray[2] != null && messageInArray[2] != ""){
    thirdLineText = document.createTextNode(messageInArray[2] + ".");
  }
  else{
    thirdLineText = document.createTextNode("");
  }

  thirdLine.appendChild(thirdLineText);
  subTd3.appendChild(thirdLine);
  subTr3.appendChild(subTd3);

  var fourthLine = document.createElement("p");
  fourthLine.className = "BpkText_bpk-text__2NHsO BpkText_bpk-text--base__2vfTl TopMessage_adviceContainer__1Zieo";
  var fourthLineText;

  console.log(messageInArray[3]); 

  if(messageInArray[3] != undefined && messageInArray[3] != null && messageInArray[3] != "") {
    fourthLineText = document.createTextNode(messageInArray[3] + ".");
  }
  else {
    fourthLineText = document.createTextNode("");
  }

  fourthLine.appendChild(fourthLineText);
  subTd4.appendChild(fourthLine);
  subTr4.appendChild(subTd4);
  subTable.appendChild(subTr1);
  subTable.appendChild(subTr2);
  subTable.appendChild(blankRow);
  subTable.appendChild(subTr3);
  subTable.appendChild(subTr4);
  td2.appendChild(subTable);
  tr.appendChild(td1);
  tr.appendChild(td2);
  table.appendChild(tr);

  return table;
}
