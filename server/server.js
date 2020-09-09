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

    var result = test(message).then(function(result){
      console.log("Sent: " + result);

      response.write(result);
      response.end(result);
    });
  });
}).listen(8081);

console.log("server is running!");

async function test(data){

  //-----   puppeteer configuration   -----
  const puppeteer = require('puppeteer-extra');
  const stealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(stealthPlugin());

  //-----   browser creation    -----
  const browser = await puppeteer.launch({headless: false, slowMo: 150});

  //-----   normal search page creation   -----
  const page = await browser.newPage();
  const result = utils.fillData(page, data, "");

  //-----   incognito mode page creation    -----
  const context = await browser.createIncognitoBrowserContext();
  const incognitoPage = await context.newPage();
  const incognitoResult = utils.fillData(incognitoPage, data, " and incognito mode");

  //-----   wait for search result which are returned as Promis objects due to async function   -----
  var awaitedResult = await result;
  var awaitedIncognitoResult = await incognitoResult;

  //-----   dispose of browser    -----
  browser.close();

  if(awaitedResult == "" && awaitedIncognitoResult == "")
  {
    return "There was an issue while searching for results";
  }

  if(awaitedIncognitoResult == ""){
    return awaitedResult;
  }

  if(awaitedResult == ""){
    return awaitedIncognitoResult;
  }

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
