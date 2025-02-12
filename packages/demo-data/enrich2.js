import fs from 'fs';
import data from './data.json' assert { type: 'json' };

const inputFile = 'fortune_1000.csv'; // Change this to your CSV file path
const outputFile = 'output.json';

const results = [];
for (const company of data) {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${company.ticker}&apikey=U2STVXNTFUOTJ4N4`,
    );
    const json = await res.json();
    console.log('RESULT', json);
    results.push({
      ...json,
      ...company,
    });
  } catch (error) {
    console.error(`Error fetching data for ${company.ticker}:`, error);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(results.filter(Boolean)));
