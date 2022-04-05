const fs = require("fs");

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

const results = JSON.parse(
  fs.readFileSync("./rawData/supasix.json")
);

console.log(results.length, "historical results");

const mostOccuring = tally => {
  let largestVal = 0;
  let largestKey;
  for (key in tally) {
    if (largestVal < tally[key]) {
      largestVal = tally[key];
      largestKey = key;
    }
  }
  return largestKey;
}

const tallyArray = arr => {
  const tally = {};
  arr.forEach(item => {
    if (tally[item]) {
      tally[item]++;
    } else {
      tally[item] = 1;
    }
  });
  return tally;
}

const mostOccuringInIndex = (arr, index) => {
  const tally = {};
  arr.forEach(row => {
    if (tally[row[index]]) {
      tally[row[index]]++;
    } else {
      tally[row[index]] = 1;
    }
  });
  let largestVal = 0;
  let largestKey;
  for (key in tally) {
    if (largestVal < tally[key]) {
      largestVal = tally[key];
      largestKey = key;
    }
  }
  return largestKey;
}

const splitResults = results.map( result => {
  return [
    ...result[1].split(" "),
    result[2],
    result[3]
  ];
});

const recurringPerSlot = [
  mostOccuringInIndex(splitResults, 0),
  mostOccuringInIndex(splitResults, 1),
  mostOccuringInIndex(splitResults, 2),
  mostOccuringInIndex(splitResults, 3),
  mostOccuringInIndex(splitResults, 4),
  mostOccuringInIndex(splitResults, 5),
  mostOccuringInIndex(splitResults, 6),
  mostOccuringInIndex(splitResults, 7),
];

console.log("Most recurring per slot: ", recurringPerSlot);

let allNumbers = [];

splitResults.forEach(result => {
  allNumbers.push(...result.slice(0,7));
});

const mostOccuringTotal = [];

let tally = tallyArray(allNumbers);

// 7 numbers to compensate for bonus ball
for (let index = 0; index < 7; index++) {
  // find the most occuring then remove it from the tally
  mostOccuringTotal.push(mostOccuring(tally));
  delete tally[mostOccuringTotal[index]];
}

//the letter didn't change
mostOccuringTotal.push(recurringPerSlot[7]);

console.log("Most recurring numbers across all slots: ", mostOccuringTotal);

const latestResultDate = new Date(results[0][0]);

// if is wednesday add 3 days, if is saturday add 4.
// hopefully this self heals if they skip drawings
const predictionDate =  latestResultDate.addDays(
  latestResultDate.getDay() == 3 ? 3 : 4
);
let filename = predictionDate.toLocaleDateString();
filename = filename.split("/").join("-");

console.log("Writing", `${filename}.json`);
fs.writeFileSync(`./predictions/${filename}.json`, JSON.stringify({
  mostPerSlot: recurringPerSlot,
  mostOccuring: mostOccuringTotal
}));

// generate new index
fs.rmSync("./predictions/index.json");
const predictionList = fs.readdirSync("./predictions");
let predictionIndex = {};
predictionList.forEach(item => {
  const temp = fs.readFileSync("./predictions/" + item);
  predictionIndex[item] = JSON.parse(temp);
});
fs.writeFileSync(
  "./predictions/index.json",
  JSON.stringify(predictionIndex)
);
