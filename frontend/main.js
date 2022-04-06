const prediction1El = document.querySelector("#prediction1");
const prediction2El = document.querySelector("#prediction2");
const nextDateEl = document.querySelector("#nextDate");
const pastPredictionsEl = document.querySelector("#past-predictions");

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
  arr1.forEach( item => {
    if (arr2.includes(item)) {
      matches++;
    }
  });
  return matches;
}

async function main() {
  const rawData = await get("rawData/supasix.json");
  const latestResultDate = new Date(rawData[0][0]);
  // console.log(rawData);
  const predictions = await get("predictions/index.json");
  // console.log(predictions);

  const lottoResults = {};

  for (filename in predictions) {
    const predictionDate = getDateFromFilename(filename);
    nextDateEl.textContent = predictionDate.toDateString();

    const prediction1 = predictions[filename].mostPerSlot;
    const results = prediction1.slice(0,6);
    const prediction2 = predictions[filename].mostOccuring;
    const results2 = prediction2.slice(0,6);

    if ( predictionDate > latestResultDate ) {
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
  orderedKeys.forEach(key => {
    let filename = new Date(key).toLocaleDateString()+".json";
    filename = filename.split("/").join("-");
    const prediction = predictions[filename];
    console.log(prediction);
    const content = `
      <div class="column is-one-third-tablet is-one-quarter-desktop">
        <div class="box has-text-left">
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
            ${prediction.mostPerSlot[7]}
            (${checkMatches(
              prediction.mostPerSlot.slice(0,6), lottoResults[key][1].split(" ").concat([lottoResults[key][2]])
              )} matched${prediction.mostPerSlot[7] == lottoResults[key][3] ? ", Free Ticket" : ""}
            )
          </p>
          <p>
            <b>Prediction 2:</b>
            ${prediction.mostOccuring.slice(0,6).join(" ")}
            <b>${prediction.mostOccuring[6]}</b>
            ${prediction.mostOccuring[7]}
            (${checkMatches(
              prediction.mostOccuring.slice(0,6), lottoResults[key][1].split(" ").concat([lottoResults[key][2]])
              )} matched${prediction.mostOccuring[7] == lottoResults[key][3] ? ", Free Ticket" : ""}
            )
          </p>
        </div>
      </div>
    `;
    // console.log(content);
    pastPredictionsEl.innerHTML += content;
  });
}

main();