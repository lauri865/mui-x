import csv from 'csv-parser';
import fs from 'fs';
import data from './data.json' assert { type: 'json' };

const inputFile = 'fortune_1000.csv'; // Change this to your CSV file path
const outputFile = 'output.json';
const results = [];

const tickerToData = data.reduce((acc, company) => {
  acc[company.ticker] = company;
  return acc;
}, {});

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (data) => {
    if (!tickerToData[data.ticker]) {
      return;
    }
    results.push({
      ...data,
      display_code: tickerToData[data.ticker]?.display_code,
      logo: tickerToData[data.ticker]?.logo,
      about: tickerToData[data.ticker]?.about,
    });
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(results));
    console.log(`JSON file saved as ${outputFile}`);
  });
