
module.exports = {
  fillData: async function(page, data, searchType){   //  data is a string representing the user's choices
              try{
                await page.setJavaScriptEnabled(true);
                await page.setViewport({
                  width: 1280,
                  height: 800,
                  deviceScaleFactor: 1
                });
                await page.goto("https://www.skyscanner.com", {waitUntil: "domcontentloaded", timeout: 0});



                const isNotEnglish = await page.evaluate(() => {
                  return (document.querySelector("#fsc-origin-search") == null);
                });

                const waitedIsNotEnglish = await isNotEnglish;

                if(waitedIsNotEnglish){
                  await page.evaluate(() => {
                    document.querySelector("#cookie-banner-root").querySelector(".CookieBanner_CookieBanner__buttons-wrapper__zXGDH").firstElementChild.click();
                    document.querySelector(".BpkLink_bpk-link__yVUen").click();
                  });


                  await Promise.all([
                    page.waitForNavigation(),
                    page.waitForSelector("#fsc-origin-search")
                  ]);

                    await page.waitForFunction("document.querySelector('body').hasChildNodes(document.querySelector('#fsc-origin-search')");
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

                //remove portion of strings inside brackets. for example: "Amsterdam (AMS)"
                let n = input[0].indexOf('(');
                input[0] = input[0].substring(0, n);
                n = input[1].indexOf('(');
                input[1] = input[1].substring(0, n);

                //-----   neccsary for the origin airport input   -----
                await page.mouse.down({clickCount: 1});
                await page.mouse.down({clickCount: 2});

                //-----   type in the origin and destination airports strings   -----
                await page.type("#fsc-origin-search", input[0]);
                await page.keyboard.press('Enter');
                await page.type("#fsc-destination-search", input[1]);
                await page.keyboard.press('Enter');

                //-----   parse the month selection from the departure date string and choose the month   -----
                var departSelection = getSelectedOption(input[2]);
                await page.click("#depart-fsc-datepicker-button");
                await page.select("#depart-calendar__bpk_calendar_nav_select", departSelection);

                //-----   parse the day selection from the departure date string and choose the day   -----
                var departDate = input[2].split('/');
                var departDay = getDay(departDate[0]);

                //  chooseDay is a function that recieves the day in string and chooses the correct day from the grid of days in the month
                await page.evaluate(chooseDay, departDay);

                //-----   parse the month selection from the return date string and choose the month   -----
                var returnSelection = getSelectedOption(input[3]);
                await page.click("#return-fsc-datepicker-button");
                await page.select("#return-calendar__bpk_calendar_nav_select", returnSelection);

                //-----   parse the day selection from the departure date string and choose the day   -----
                var returnDate = input[3].split('/');
                var returnDay = getDay(returnDate[0]);

                await page.evaluate(chooseDay, returnDay);

                //-----   press the passengers dropdown and choose the cabin class    -----
                await page.click("#CabinClassTravellersSelector_fsc-class-travellers-trigger__1qSiF");
                if(await page.evaluate(() => {document.querySelector("#search-controls-cabin-class-dropdown");}) != null){
                  await page.select("#search-controls-cabin-class-dropdown", input[7]);
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

                  await page.select("#children-age-dropdown-" + i, childrenAges[i]);  //  select the correct age for each child
                }

                //-----   check if the return date is "One way". if so, choose one way selector. else, choose return selector   -----
                if(input[3] == "(One way)")
                {
                  await page.click("#fsc-trip-type-selector-one-way");
                }
                else
                {
                  await page.click("#fsc-trip-type-selector-return");
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

                const waitFunction = () => {
                  var hasNodes = document.querySelector('body').hasChildNodes(".TicketStub_horizontalStubContainer__2aEis");
                  var element = document.getElementsByClassName("TicketStub_horizontalStubContainer__2aEis")[0];
                  var elementIsValid = element.innerText != "";

                  return hasNodes && elementIsValid;
                };
                await page.waitForFunction(waitFunction);
                //"document.querySelector('body').innerText.includes('total')"
                const pricePerTicketText = await page.evaluate(()=>{
                  var element = document.querySelector(".Price_mainPriceContainer__1dqsw");
                  return element.innerText;
                });
                console.log(pricePerTicketText);

                if(pricePerTicketText != null){
                  const isNonStop = await page.evaluate(() => {
                    var element = document.querySelector(".LegInfo_stopsLabelContainer__2dEdt");
                    return Promise.resolve(element.innerText.includes("Non-stop"));
                  });

                  const totalPriceText = await page.evaluate(() => {
                    var element = document.querySelector(".TicketStub_horizontalStubContainer__2aEis").children[0].children[1];
                    return Promise.resolve(element.innerText);
                  });

                  const airlineText = await page.evaluate(() => {
                    var element = document.querySelector(".BpkImage_bpk-image__img__3HwXN");
                    return Promise.resolve(element.alt);
                  });

                  textResult = "The server found that the best result is a ";
                  if(isNonStop){
                    textResult += "non stop ";
                  }
                  else{
                    textResult += "";
                  }

                  textResult += "flight with " + airlineText + " by using VPN" + searchType + ".";
                  textResult += "The price per ticket for the flight found is " + pricePerTicketText + " for a total of " + totalPriceText + ".";
                }
                else{
                  textResult = "No matches found";
                }

                await Promise.all([
                  page.click(".BpkLink_bpk-link__2Jqrw"),
                  page.waitForNavigation("domcontentloaded")
                ]);

                await page.waitForFunction("document.querySelector('body').innerText.includes('16')");

                var bestResultInMonth = await /*page.evaluate*/getBestResultInWholeMonth(searchType, page);
                // var cheapestPriceResult = getCheapestPrice(page, searchType);
                var awaitedBestResultInMonth = await bestResultInMonth;

                return textResult + awaitedBestResultInMonth; // + cheapestPriceResult;
              }
              catch(err){
                console.error(err);
                return "";
                //module.exports.fillData(page, data, searchType);
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
  tableRows = document.getElementsByClassName("bpk-calendar-grid__week");

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

async function getBestResultInWholeMonth(searchType, page){
  try{
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
    var done;

    for(var i = 0; i < awaitedCount; i++){
      currentOutboundData = await page.evaluate((index) =>{
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

        var monthText = document.getElementById("outbound__bpk_calendar_nav_select").value;
        var monthString = monthText.substring(5);
        var date = day + "/" + monthString;

        validCells[index].firstElementChild.click();

        return [price, date, currencySign];
      }, i);

      var awaitedOutboundData = await currentOutboundData;

      currentInboundData = await page.evaluate((index) =>{
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

        var monthText = document.getElementById("inbound__bpk_calendar_nav_select").value;
        var monthString = monthText.substring(5);
        var date = day + " /" + monthString;

        return [lowestInboundPrice, date];
      }, i);

      var awaitedInboundData = await currentInboundData;

      if(awaitedOutboundData[0] + awaitedInboundData[0] < bestPrice)
      {
        bestPrice = awaitedOutboundData[0] + awaitedInboundData[0];
        bestInboundDate = awaitedInboundData[1];
        bestOutboundDate = awaitedOutboundData[1];
      }

      currencySign = awaitedOutboundData[2];

      if(i == awaitedCount)
      {
        done = await page.evaluate(() => true);
      }
    }


    console.log("Price: " + bestPrice);
    console.log("Out: " + bestOutboundDate);
    console.log("In: " + bestInboundDate);

    if(bestPrice < 1000000){
      results += "When observing the entire month, the server found that the best combination for flights is when choosing ";
      results += "an outbound flight on " + bestOutboundDate + " and an inbound flight on " + bestInboundDate + "."
      results += "The best combination is at a price of " + currencySign + bestPrice + " by using VPN" + searchType +".";
    }
    else{
      results += "No prices were found when observing the entire month. ."
    }

      return  results;
  }
  catch(err){
    console.log(err);
    return "";
  }
}
