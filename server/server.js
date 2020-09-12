const { stat } = require("fs");
const http = require("http");
const utils = require("./serverUtils");


let message = "";

http.createServer(function (request, response){
  request.on("data", (dataReceived) =>{
    message = "";
    message += dataReceived;
}).on("end", () => {
    console.log("Recieved: " + message);
    response.setHeader('Access-Control-Allow-Origin', "*");
    response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    response.writeHead(200, {'Content-Type': 'text/html'});

    var result = searchForFlight(message).then(function(result){
      console.log("Sent: " + result);

      response.end(result);
    });
  });
}).listen(8081);

console.log("TicketMe serve is running!");

async function searchForFlight(data){

  //-----   puppeteer configuration   -----
  const puppeteer = require('puppeteer-extra');
  const stealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(stealthPlugin());

  //-----   browser creation    -----
  var browser = await puppeteer.launch({headless: false, slowMo: 150});

  //-----   normal search page creation   -----
  var page = await browser.newPage();
  var result = utils.fillData(page, data, "");

  //-----   incognito mode page creation    -----
  var context = await browser.createIncognitoBrowserContext();
  var incognitoPage = await context.newPage();
  var incognitoResult = utils.fillData(incognitoPage, data, " and incognito mode");

  //-----   wait for search result which are returned as Promis objects due to async function   -----
  var awaitedResult = await result;
  var awaitedIncognitoResult = await incognitoResult;

  //-----   dispose of browser    -----

  browser.close();
  var finalResultStatus = getFinalResult(awaitedResult, awaitedIncognitoResult)
  var resultMessageForClient;
  if(finalResultStatus == status.SUCCESS) {
    return parseResults(awaitedResult, awaitedIncognitoResult);
  }
  else if (finalResultStatus == status.SERVER_ERROR) {
    return "There was an unexpected error in the server, please run your search again.";
  }
  else if (finalResultStatus == status.RUN_BOTH ) {
    browser = await puppeteer.launch({headless: false, slowMo: 150});
    context = await browser.createIncognitoBrowserContext();

    page = await browser.newPage();
    incognitoPage = await context.newPage();
    
    incognitoResult = utils.fillData(incognitoPage, data, " and incognito mode");
    result = utils.fillData(page, data, "");

    awaitedIncognitoResult = await incognitoResult;
    awaitedResult = await result;

    var finalResult = getFinalResult(awaitedResult, awaitedIncognitoResult);
    
    if(finalResult == status.SUCCESS) {
      resultMessageForClient = parseResults(awaitedResult, awaitedIncognitoResult);
    }
    else if (finalResult == status.RUN_INCOGNITO) { resultMessageForClient = awaitedResult; }
    else if (finalResult == status.RUN_REGULAR) { resultMessageForClient = awaitedIncognitoResult; }
    else { resultMessageForClient = "There was an unexpected error in the server, please run your search again."; }
  }
  else if (finalResultStatus == status.RUN_INCOGNITO ) {
    browser = await puppeteer.launch({headless: false, slowMo: 150});
    context = await browser.createIncognitoBrowserContext();
    incognitoPage = await context.newPage();

    incognitoResult = utils.fillData(incognitoPage, data, " and incognito mode");

    awaitedIncognitoResult = await incognitoResult;
    var finalResult = getFinalResult(awaitedResult, awaitedIncognitoResult);
    if(finalResult == status.SUCCESS) { 
      resultMessageForClient = parseResults(awaitedResult, awaitedIncognitoResult);
    }
    else if (finalResult == status.RUN_INCOGNITO) { resultMessageForClient = awaitedResult; }
  }
  else if (finalResultStatus == status.RUN_REGULAR) {
    browser = await puppeteer.launch({headless: false, slowMo: 150});
    page = await browser.newPage();
    
    result = utils.fillData(page, data, "");

    awaitedResult = await result;
    var finalResult = getFinalResult(awaitedResult, awaitedIncognitoResult);
    if(finalResult == status.SUCCESS) { 
      resultMessageForClient = parseResults(awaitedResult, awaitedIncognitoResult);
    }
    else if (finalResult == status.RUN_REGULAR) { resultMessageForClient = awaitedIncognitoResult; }
  }

  browser.close();
  return resultMessageForClient;
}

const status = {
  SERVER_ERROR: "server_error",
  RUN_BOTH: "run_both",
  RUN_INCOGNITO: "run_incognito",
  RUN_REGULAR: "run_regular",
  SUCCESS: "success"
}

function getFinalResult(awaitedResult, awaitedIncognitoResult) {
  if (awaitedResult == "" && awaitedIncognitoResult == "") {
    return status.RUN_BOTH;
  }
  else if(awaitedResult != "" && awaitedIncognitoResult != "") {
    return status.SUCCESS;
  }
  else if( awaitedResult != "" && awaitedIncognitoResult == "") {
    return status.RUN_INCOGNITO;
  }
  else if(awaitedIncognitoResult != "" && awaitedResult == "") {
    return status.RUN_REGULAR;
  }
}

function parseResults(awaitedResult, awaitedIncognitoResult) {
      //-----   parse the result retreived to get the price per ticket    -----
      var firstStr = awaitedResult.substring(awaitedResult.indexOf("is") + 2, awaitedResult.length);
      var secondStr = awaitedIncognitoResult.substring(awaitedIncognitoResult.indexOf("is") + 2, awaitedIncognitoResult.length);
      var firstStrArr = firstStr.split(" ");
      var secondStrArr = secondStr.split(" ");
      firstStr = firstStrArr[0].slice(1);
      secondStr = secondStrArr[0].slice(1);
  
      //-----   if normal search result is higher or equal to the incognito mode result, return the incognito mode result   -----
      if(parseInt(firstStr) >= parseInt(secondStr)){
        return awaitedIncognitoResult;
      }
      else{                   //-----   else, return the normal search result   -----
        return awaitedResult;
      }
}
