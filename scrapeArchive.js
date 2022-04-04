const fs = require("fs");
const puppeteer = require('puppeteer');

const args = process.argv.slice(2);

const scrape = async (page) => {
  return await page.evaluate(() => {
    // winning numbers
    const allWinningNumbersQuery = document.querySelectorAll(".table-0 .views-field-field-ls-winning-numbers");

    // bonus balls
    const allBonusBallsQuery = document.querySelectorAll(".table-0 .views-field-field-ls-bonus-ball-number");

    // free ticket letter
    const allFreeTicketLettersQuery = document.querySelectorAll(".table-0 .views-field-field-ls-free-ticket-letter");

    // free ticket letter
    const allDatesQuery = document.querySelectorAll(".table-0 .views-field-field-supa-6-date span");

    //combine everything
    const combinedResults = [];
    for (let index = 0; index < allDatesQuery.length; index++) {
      combinedResults.push([
        allDatesQuery[index]?.innerText,
        allWinningNumbersQuery[index + 1]?.innerText,
        allBonusBallsQuery[index + 1]?.innerText,
        allFreeTicketLettersQuery[index + 1]?.innerText
      ]);
    }

    return combinedResults;
  });
}

const main = async () => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-dev-shm-usage"
    ]
  });
  const page = await browser.newPage();
  await page.goto('https://guyana-lottery.com/lottery/results-archive', {
    waitUntil: 'networkidle2',
  });

  let results = [];
  let count = 1;

  // initial scrape
  console.log("Getting page", count);
  results = results.concat(await scrape(page));
  count++;

  if (args[0] == "all") {
    // scrape as long as there are next pages to click
    while ( await page.$(".view-lotto-supa-6 .pager-next a") ) {
      console.log("Getting page", count);
      await page.click(".view-lotto-supa-6 .pager-next a");
      await page.waitForNetworkIdle();
      results = results.concat(await scrape(page));
      count++;
    }
  }

  console.log(results.length, "results");

  // we're done with the browser at this point
  await page.close();
  await browser.close();

  if (args[0] == "update") {
    const oldResults = JSON.parse(fs.readFileSync("./rawData/supasix.json"));
    const oldRecentDate = new Date(oldResults[0][0]);
    // check for updated results
    let newResults = [];
    results.forEach(result => {
      const resultDate = new Date(result[0]);
      if (resultDate > oldRecentDate) {
        newResults.push(result);
      }
    });
    console.log("Adding", newResults.length, "new result(s)");
    // we want the new results to be infront
    newResults = newResults.concat(oldResults);
    fs.writeFileSync(
      "./rawData/supasix.json",
      JSON.stringify(newResults)
    );
  }

  if (args[0] == "all") {
    fs.writeFileSync(
      "./rawData/supasix.json",
      JSON.stringify(results)
    );
  }

}

main();
