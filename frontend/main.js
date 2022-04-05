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
    console.log("ERROR getting data", error);
  }
}

function getDateFromFilename(filename) {
  return new Date(
    filename.split(".")[0].split("-").join("/")
  );
}

async function main() {
  const rawData = await get("rawData/supasix.json");
  console.log(rawData);
  const predictions = await get("predictions/index.json");
  console.log(predictions);

  for (filename in predictions) {
    const predictionDate = getDateFromFilename(filename);
    nextDateEl.textContent = predictionDate.toDateString();

    if (new Date() < predictionDate) {
      const prediction1 = predictions[filename].mostPerSlot;
      const results = prediction1.slice(0,6);
      prediction1El.innerHTML = `
        ${results.join(" ")} <b>${prediction1[6]}</b> ${prediction1[7]}
      `;

      const prediction2 = predictions[filename].mostOccuring;
      const results2 = prediction2.slice(0,6);
      prediction2El.innerHTML = `
        ${results2.join(" ")} <b>${prediction2[6]}</b> ${prediction2[7]}
      `;
    }
  }

}

main();