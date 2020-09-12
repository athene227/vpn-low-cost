

module.exports = {
  fillData: async function(page, data, searchType){   //  data is a string representing the user's choices
              try{
                const CABIN_DROP_DOWN_ID = "#search-controls-cabin-class-dropdown";
                const CHILD_AGE_DROPDOWN_ID = "#children-age-dropdown-";
                const ORIGIN_ID = "#fsc-origin-search";
                const DESTINATION_ID = "#fsc-destination-search";
                const DEPART_DATEPICKER_ID = "#depart-fsc-datepicker-button";
                const RETURN_DATEPICKER_ID = "#return-fsc-datepicker-button";
                const DEPART_MONTH_CALANDER_DROPDOWN_ID = "#depart-calendar__bpk_calendar_nav_select";
                const COOKIE_BANNER_CLASS = ".CookieBanner_CookieBanner__buttons-wrapper__zXGDH";
                const COOKIE_BANNER_ROOT_ID = "#cookie-banner-root";
                const GOTO_SKYSCANNER_US_CLASS = ".BpkLink_bpk-link__yVUen";
                const RETURN_MONTH_CALANDER_DROPDOWN_ID = "#return-calendar__bpk_calendar_nav_select";
                const CABIN_CLASS_DROPDOWN_BTN_ID = "#CabinClassTravellersSelector_fsc-class-travellers-trigger__1qSiF";
                const RETURN_RADIO_BTN_ID = "#fsc-trip-type-selector-return";
                const ONEWAY_RADIO_BTN_ID = "#fsc-trip-type-selector-one-way";
                const TICKET_STUB_CLASS = "TicketStub_horizontalStubContainer__2aEis";
                const CONTINUE_BTN_CLASS = "BpkButtonBase_bpk-button__32RaK DirectDays_flexAlignEnd__1CPAu DirectDays_rightAlign__2VVxV DirectDays_bottomMargin__3K1IE";
                const TICKET_STUB_PRICE_CLASS = ".Price_mainPriceContainer__1dqsw";
                const LEG_INFO_CLASS = ".LegInfo_stopsLabelContainer__2dEdt";
                const AIRLINE_IMG_CLASS = ".BpkImage_bpk-image__img__3HwXN";
                const SHOW_WHOLE_MONTH_BTN_CLASS = ".BpkLink_bpk-link__2Jqrw";

                await page.setJavaScriptEnabled(true);
                await page.setViewport({
                  width: 1280,
                  height: 800,
                  deviceScaleFactor: 1
                });
                await page.goto("https://www.skyscanner.com", {waitUntil: "domcontentloaded", timeout: 0});



                const isNotEnglish = await page.evaluate((ORIGIN_ID) => {
                  return (document.querySelector(ORIGIN_ID) == null);
                },ORIGIN_ID);

                const waitedIsNotEnglish = await isNotEnglish;

                if(waitedIsNotEnglish){
                  await page.evaluate((COOKIE_BANNER_ROOT_ID, COOKIE_BANNER_CLASS, GOTO_SKYSCANNER_US_CLASS) => {
                    document.querySelector(COOKIE_BANNER_ROOT_ID).querySelector(COOKIE_BANNER_CLASS).firstElementChild.click();
                    document.querySelector(GOTO_SKYSCANNER_US_CLASS).click();
                  },COOKIE_BANNER_ROOT_ID, COOKIE_BANNER_CLASS, GOTO_SKYSCANNER_US_CLASS);


                  await Promise.all([
                    page.waitForNavigation(),
                    page.waitForSelector(ORIGIN_ID)
                  ]);


                  var functionToWaitForInDOM =  () => {
                    return document.querySelector('body').hasChildNodes(document.querySelector(ORIGIN_ID));
                  }

                  await page.waitForFunction(functionToWaitForInDOM);
                }
                //-----   parse the string recieved from client to an array of strings    -----
                let input = data.split(';');

                /*
                input[0] = Origin airport.
                input[1] = Destination airport.
                input[2] = Departure date.
                input[3] = Return date.
                input[4] = Number of adults.
                input[5] = Number of children.
                input[6] = Children Ages (seperated by ',').
                input[7] = Cabin class (e.g. "Economy", "FirstClass" etc.).
                input[8] = Is direct flights only
                */
                //remove portion of string inside brackets. for example: "Amsterdam (AMS)"
                var indexOfOpeningBracket = input[0].indexOf('('); //parse origin
                input[0] = input[0].substring(0, indexOfOpeningBracket);
                indexOfOpeningBracket = input[1].indexOf('('); 
                input[1] = input[1].substring(0, indexOfOpeningBracket); // parse destination

                //-----   neccsary for the origin airport input   -----
                await page.mouse.down({clickCount: 1});
                await page.mouse.down({clickCount: 2});

                //-----   type in the origin and destination airports strings   -----
                await page.type(ORIGIN_ID, input[0]);
                await page.keyboard.press('Enter');
                await page.type(DESTINATION_ID, input[1]);
                await page.keyboard.press('Enter');

                //-----   parse the month selection from the departure date string and choose the month   -----
                var departSelection = getSelectedOption(input[2]);
                await page.click(DEPART_DATEPICKER_ID);
                await page.select(DEPART_MONTH_CALANDER_DROPDOWN_ID, departSelection);

                //-----   parse the day selection from the departure date string and choose the day   -----
                var departDate = input[2].split('/');
                var departDay = getDay(departDate[0]);

                //  chooseDay is a function that recieves the day in string and chooses the correct day from the grid of days in the month
                await page.evaluate(chooseDay, departDay);

                //-----   parse the month selection from the return date string and choose the month   -----
                var returnSelection = getSelectedOption(input[3]);
                await page.click(RETURN_DATEPICKER_ID);
                await page.select(RETURN_MONTH_CALANDER_DROPDOWN_ID, returnSelection);

                //-----   parse the day selection from the departure date string and choose the day   -----
                var returnDate = input[3].split('/');
                var returnDay = getDay(returnDate[0]);

                await page.evaluate(chooseDay, returnDay);

                //-----   press the passengers dropdown and chhose the cabin class    -----
                await page.click(CABIN_CLASS_DROPDOWN_BTN_ID);
                if(await page.evaluate((CABIN_DROP_DOWN_ID) => {document.querySelector(CABIN_DROP_DOWN_ID);},CABIN_DROP_DOWN_ID) != null){
                  await page.select(CABIN_DROP_DOWN_ID, input[7]);
                }

                //-----   press the button that increases number of adults a specific amount of times   -----
                for(var i = 1; i < input[4]; i++){  // input[4] is the number of adults
                  await page.click("[title = 'Increase number of adults']");//[title = 'Augmenter le nombre d'adultes']");
                }

                //-----   split the ages of the children to an array of strings   -----
                var childrenAges = input[6].split(',');

                //-----   press the button that increases number of children a specific amount of times   -----
                for(var i = 0; i < input[5]; i++){  //  input[5] is the number of children
                  //await page.click("[title = 'Increase number of children']");
                  await page.click("[title = 'Increase number of children']");//[title = 'Augmenter le nombre d'enfants']")

                  await page.select(CHILD_AGE_DROPDOWN_ID + i, childrenAges[i]);  //  select the correct age for each child
                }

                //-----   check if the return date is "One way". if so, choose one way selector. else, choose return selector   -----
                if(input[3] == "(One way)")
                {
                  await page.click(ONEWAY_RADIO_BTN_ID);
                }
                else
                {
                  await page.click(RETURN_RADIO_BTN_ID);
                }

                if(input[8] === "true")
                {
                  await page.click("[name = 'directOnly']");
                }

                //-----   click the "Search flights" button to submit the form    -----
                await Promise.all([
                  page.click('[type = "submit"]'),
                  page.waitForNavigation("domcontentloaded")
                ]);

                var textResult = "";

                console.log("beforeTStub");
                const isTicketStubExistsAndNotEmpty = (TICKET_STUB_CLASS) => {
                  var elementIsValid;
                  console.log("isTicketStubExistAndNotEmpty ->" + "TSubDefine:" + TICKET_STUB_CLASS);
                  var hasNodes = document.querySelector('body').hasChildNodes("." + TICKET_STUB_CLASS);
                  var element = document.getElementsByClassName(TICKET_STUB_CLASS)[0];
                  
                  if(element != null) {
                    elementIsValid = (element.innerText != "");
                  }
                  else {
                    if(document.querySelector('body').innerText.includes("Continue")) {
                      return true;
                    }
                  }

                  return hasNodes && elementIsValid;
                };

                await page.waitForFunction(isTicketStubExistsAndNotEmpty,{}, TICKET_STUB_CLASS);

                var isContinueButtonAppears = await page.evaluate(() => { return document.querySelector('body').innerText.includes("Continue"); });

                if(isContinueButtonAppears){
                  await page.evaluate((CONTINUE_BTN_CLASS) => {
                    document.getElementsByClassName(CONTINUE_BTN_CLASS)[0].click();
                  },CONTINUE_BTN_CLASS);
                  await page.waitForFunction(isTicketStubExistsAndNotEmpty);
                }

                const pricePerTicketText = await page.evaluate((TICKET_STUB_PRICE_CLASS)=> {
                  var element = document.querySelector(TICKET_STUB_PRICE_CLASS);
                  return element.innerText;
                },TICKET_STUB_PRICE_CLASS);
                
                if(pricePerTicketText != null) {
                  const isNonStop = await page.evaluate((LEG_INFO_CLASS) => {
                    var element = document.querySelector(LEG_INFO_CLASS);
                    return Promise.resolve(element.innerText.includes("Direct") || element.innerText.includes("Non-stop")); // ~!!!~
                  },LEG_INFO_CLASS);
                  
                  var totalPriceText = "";
                  var totalAmountOfPassengers = parseInt(input[4]) +  parseInt(input[5])
                  if(totalAmountOfPassengers > 1) {
                    totalPriceText = await page.evaluate((TICKET_STUB_CLASS) => {
                      var currentStubElement;
                      var allTicketStubsElements = document.getElementsByClassName(TICKET_STUB_CLASS);
                      for(var stubElement of allTicketStubsElements ) {
                        if(stubElement.children[0].children[1] != null) {
                          currentStubElement = stubElement.children[0].children[1];
                          break;
                        }
                      }

                      return Promise.resolve(currentStubElement.innerText);
                    },TICKET_STUB_CLASS);
                  }
                    
                  const airlineText = await page.evaluate((AIRLINE_IMG_CLASS) => {
                    var element = document.querySelector(AIRLINE_IMG_CLASS);
                    return Promise.resolve(element.alt);
                  },AIRLINE_IMG_CLASS);

                  textResult = "The server found that the best result is a ";
                  if(isNonStop){
                    textResult += "non stop ";
                  }
                  else{
                    textResult += "";
                  }

                  textResult += "flight with " + airlineText + " by using VPN" + searchType + ".";
                  textResult += "The price per ticket for the flight found is " + pricePerTicketText ;
                  
                  if(totalAmountOfPassengers > 1) {
                    textResult += " for a total of " + totalPriceText;
                  }

                  textResult += ".";
                }
                else{
                  textResult = "No matches found";
                }

                await Promise.all([
                  page.click(SHOW_WHOLE_MONTH_BTN_CLASS),
                  page.click(SHOW_WHOLE_MONTH_BTN_CLASS),
                  page.waitForNavigation("domcontentloaded")
                ]);
                
                await page.waitForFunction("document.querySelector('body').innerText.includes('16')");

                var isOneWayFlightIndicator = (input[3] == "(One way)");
                var bestResultInMonth = await getBestResultInWholeMonth(searchType, page, isOneWayFlightIndicator);
                var awaitedBestResultInMonth = await bestResultInMonth;
                
                console.log(textResult + awaitedBestResultInMonth);

                return textResult + awaitedBestResultInMonth; // + cheapestPriceResult;
              }
              catch(err){
                console.error(err.message);
                console.error(err.stack);
                //probably an ad.
                return "";
              }
            }
}

function getSelectedOption(date){
  
  var arr = date.split('/');

  let opt = arr[2] + "-" + arr[1];

  return opt;
}

function getDay(day){
  
  var retDay = day;

  if(parseInt(day) < 10){
    retDay = day.substring(1);
  }

  return retDay;
}

function chooseDay(day){
  const WEEK_TABLE_ROW_CLASS = "bpk-calendar-grid__week";

  tableRows = document.getElementsByClassName(WEEK_TABLE_ROW_CLASS);

  for(var i = 0; i < tableRows.length; i ++)
  {
    for(var j = 0; j < 7; j++)
    {
      if(tableRows[i].cells[j].innerText == day)
      {
        tableRows[i].cells[j].children[0].click();
        break;
      }
    }
  }
}

async function getBestResultInWholeMonth(searchType, page, isOneWayFlightIndicator){
  try{
    const WHOLE_MONTH_OUTBOUND_SELECTOR_ID = "outbound__bpk_calendar_nav_select";
    const WHOLE_MONTH_INBOUND_SELECTOR_ID = "inbound__bpk_calendar_nav_select";
    var results = "";

    var outboundCount = await page.evaluate(() => {
      var calendarData = document.getElementsByTagName("td");
      var count = 0;
      for (var item of calendarData) {
        if(item.firstElementChild.getAttribute('direction') == "outbound" && item.firstElementChild.lastElementChild.innerText != ""){
          count += 1;
        }
      }

      return count;
    });

    const awaitedCount = await outboundCount;


    var bestInboundDate = "";
    var bestOutboundDate = "";
    var bestPrice = 1000000;
    var currentOutboundData;
    var currentInboundData;
    var currencySign = "";

    for(var i = 0; i < awaitedCount; i++){
      currentOutboundData = await page.evaluate((index, WHOLE_MONTH_OUTBOUND_SELECTOR_ID) =>{
        var calendarData = document.getElementsByTagName("td");
        var validCells = [];

        for (var item of calendarData) {
          if(item.firstElementChild.getAttribute('direction') == "outbound" && item.firstElementChild.lastElementChild.innerText != ""){
            validCells.push(item);
          }
        }

        var price = parseInt(validCells[index].firstElementChild.lastElementChild.innerText.substring(1))
        var day = validCells[index].firstElementChild.firstElementChild.innerText;
        var currencySign = validCells[index].firstElementChild.lastElementChild.innerText.substring(0, 1);

        var monthText = document.getElementById(WHOLE_MONTH_OUTBOUND_SELECTOR_ID).value;
        var monthString = monthText.substring(5);
        var date = day + "/" + monthString;

        validCells[index].firstElementChild.click();

        return [price, date, currencySign];
      }, i, WHOLE_MONTH_OUTBOUND_SELECTOR_ID);

      var awaitedOutboundData = await currentOutboundData;
      var awaitedInboundData = [0, ""];

      if(!isOneWayFlightIndicator) {
        currentInboundData = await page.evaluate((WHOLE_MONTH_INBOUND_SELECTOR_ID) => {
          var calendarData = document.getElementsByTagName("td");
          var validCells = [];
  
          for (var item of calendarData) {
            if(item.firstElementChild.getAttribute('direction') == "inbound" && item.firstElementChild.lastElementChild.innerText != ""){
              validCells.push(item);
            }
          }
  
          var lowestInboundPrice = 1000000;
          var lowestInboundItem;
  
          for(var item of validCells){
            if(parseInt(item.firstElementChild.lastElementChild.innerText.substring(1)) < lowestInboundPrice){
              lowestInboundPrice = parseInt(item.firstElementChild.lastElementChild.innerText.substring(1));
              lowestInboundItem = item;
            }
          }
  
          var day = lowestInboundItem.firstElementChild.firstElementChild.innerText;
  
          var monthText = document.getElementById(WHOLE_MONTH_INBOUND_SELECTOR_ID).value;
          var monthString = monthText.substring(5);
          var date = day + "/" + monthString;
  
          return [lowestInboundPrice, date];
        }, WHOLE_MONTH_INBOUND_SELECTOR_ID);

        var awaitedInboundData = await currentInboundData;
      }

      if(awaitedOutboundData[0] + awaitedInboundData[0] < bestPrice)
      {
        bestPrice = awaitedOutboundData[0] + awaitedInboundData[0]; // awaitedInboundData[0] equals to 0 if one way flight was chosen
        bestInboundDate = awaitedInboundData[1]; //empty string if one way flight was chosen
        bestOutboundDate = awaitedOutboundData[1];
      }

      currencySign = awaitedOutboundData[2];
    }


    console.log("Price: " + bestPrice);
    console.log("Out: " + bestOutboundDate);
    console.log("In: " + bestInboundDate);

    if(bestPrice < 1000000){
      if(!isOneWayFlightIndicator) {
        results += "When observing the entire month, the server found that the best combination for flights is when choosing ";
        results += "an outbound flight on " + bestOutboundDate + " and an inbound flight on " + bestInboundDate + "."
        results += "The best combination is at a price of " + currencySign + bestPrice + " by using VPN" + searchType +".";
      }
      else {
        results += "When observing the entire month, the server found that the best flight ";
        results += "is at " + bestOutboundDate + " at a price of " + currencySign + bestPrice + " by using VPN" + searchType +".";
      }
    }
    else{
      results += "No prices were found when observing the entire month."
    }

      return  results;
  }
  catch(err){
    console.error(err.message);
    console.error(err.stack);
    return "";
  }
}
