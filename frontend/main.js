const prediction1El = document.querySelector("#prediction1");
const prediction2El = document.querySelector("#prediction2");
const nextDateEl = document.querySelector("#nextDate");
const pastPredictionsEl = document.querySelector("#past-predictions");

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

async function get(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    // console.log("ERROR getting data", error);
  }
}

function getDateFromFilename(filename) {
  return new Date(
    filename.split(".")[0].split("-").join("/")
  );
}

function checkMatches(arr1, arr2) {
  let matches = 0;
  let matchedNumbers = [];
  arr1.forEach( item => {
    if (arr2.includes(item)) {
      matchedNumbers.push(item);
      matches++;
    }
  });
  return {
    matches,
    matchedNumbers
  };
}

async function main() {
  const rawData = await get("rawData/supasix.json");

  // chart all balls
  const splitResults = rawData.map( result => {
    return [
      ...result[1].split(" "),
      result[2],
      result[3]
    ];
  });
  let allNumbers = [];
  splitResults.forEach(result => {
    allNumbers.push(...result.slice(0,7));
  });
  const tally = tallyArray(allNumbers);
  delete tally["09"];
  const labels = Object.keys(tally);
  const data = Object.values(tally);

  data.sort();
  labels.sort((a, b) => tally[a] - tally[b]);

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Number Frequency',
      data: data,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  };
  const config = {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            text: "Lottery Number",
            display: true,
            align: "end"
          }
        },
        y: {
          title: {
            text: "Frequency",
            display: true,
            align: "end"
          },
          beginAtZero: true
        }
      }
    },
  };
  const numberFrequency = new Chart(
    document.getElementById('number-frequency'),
    config
  );
  // end chart all balls

  const latestResultDate = new Date(rawData[0][0]);
  // console.log(rawData);
  const predictions = await get("predictions/index.json");
  // console.log(predictions);

  const lottoResults = {};

  for (filename in predictions) {
    const predictionDate = getDateFromFilename(filename);
    const prediction1 = predictions[filename].mostPerSlot;
    const results = prediction1.slice(0,6);
    const prediction2 = predictions[filename].mostOccuring;
    const results2 = prediction2.slice(0,6);

    if ( predictionDate > latestResultDate ) {
      nextDateEl.textContent = predictionDate.toDateString();
      prediction1El.innerHTML = `
        ${results.join(" ")} <b>${prediction1[6]}</b> ${prediction1[7]}
      `;
      prediction2El.innerHTML = `
        ${results2.join(" ")} <b>${prediction2[6]}</b> ${prediction2[7]}
      `;
    } else {
      const lottoResult = rawData.find(row => {
        const rowDate = new Date(row[0]);
        if (rowDate.toDateString() == predictionDate.toDateString()) {
          return true;
        } else {
          return false;
        }
      });
      // console.log(lottoResult);
      if (lottoResult) {
        lottoResults[predictionDate.toDateString()] = lottoResult;
      }
    }
  }
  console.log(lottoResults);

  const orderedKeys = Object.keys(lottoResults).sort((a,b) => {
    return new Date(b) - new Date(a);
  });
  // console.log(orderedKeys);
  let allMatchedNumbers = [];
  orderedKeys.forEach(key => {
    let filename = new Date(key).toLocaleDateString()+".json";
    filename = filename.split("/").join("-");
    const prediction = predictions[filename];
    console.log(prediction);
    const match1 = checkMatches(
      prediction.mostPerSlot.slice(0,6), lottoResults[key][1].split(" ").concat([lottoResults[key][2]])
    );
    const match2 = checkMatches(
      prediction.mostOccuring.slice(0,6), lottoResults[key][1].split(" ").concat([lottoResults[key][2]])
    );
    allMatchedNumbers = allMatchedNumbers.concat(match1.matchedNumbers).concat(match2.matchedNumbers);

    const content = `
      <div class="column is-one-third-tablet is-one-quarter-desktop">
        <div class="box has-text-left past-prediction">
          <p><b>Date:</b> ${key}</p>
          <p>
            <b>Results:</b>
            ${lottoResults[key][1]}
            <b>${lottoResults[key][2]}</b>
            ${lottoResults[key][3]}
          </p>
          <p>
            <b>Prediction 1:</b>
            ${prediction.mostPerSlot.slice(0,6).join(" ")}
            <b>${prediction.mostPerSlot[6]}</b>
            ${prediction.mostPerSlot[7]} <br/>
            (${match1.matches} matched${prediction.mostPerSlot[7] == lottoResults[key][3] ? ", Free Ticket" : ""}
            )
          </p>
          <p>
            <b>Prediction 2:</b>
            ${prediction.mostOccuring.slice(0,6).join(" ")}
            <b>${prediction.mostOccuring[6]}</b>
            ${prediction.mostOccuring[7]} <br/>
            (${match2.matches} matched${prediction.mostOccuring[7] == lottoResults[key][3] ? ", Free Ticket" : ""}
            )
          </p>
        </div>
      </div>
    `;
    // console.log(content);
    pastPredictionsEl.innerHTML += content;
  });

  // start charting matched numbers
  const matchedTally = tallyArray(allMatchedNumbers);
  const matchedLabels = Object.keys(matchedTally);
  const matchedData = Object.values(matchedTally);
  console.log('matchedTally :>> ', matchedTally);
  console.log('matchedLabels :>> ', matchedLabels);
  console.log('matchedData :>> ', matchedData);
  matchedData.sort();
  matchedLabels.sort((a, b) => matchedTally[a] - matchedTally[b]);
  console.log('after sort matchedLabels :>> ', matchedLabels);
  console.log('after sort matchedData :>> ', matchedData);
  const matchedChartData = {
    labels: matchedLabels,
    datasets: [{
      label: 'Match Frequency',
      data: matchedData,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  };
  const matchedConfig = {
    type: 'bar',
    data: matchedChartData,
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            text: "Lottery Number",
            display: true,
            align: "end"
          }
        },
        y: {
          title: {
            text: "Matches",
            display: true,
            align: "end"
          },
          beginAtZero: true
        }
      }
    },
  };
  const matchedChart = new Chart(
    document.getElementById('match-frequency'),
    matchedConfig
  );
  // end charting matched numbers
}

main();