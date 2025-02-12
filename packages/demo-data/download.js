import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import urls from './data.json' assert { type: 'json' };
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function downloadImage(url, folder, name) {
  try {
    const response = await fetch(url, {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'cache-control': 'max-age=0',
        'if-modified-since': 'Tue, 11 Feb 2025 12:46:32 GMT',
        'if-none-match': 'W/"eaad68bbd7f47a9664422add6fdad121"',
        priority: 'u=0, i',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    const buffer = await response.text();
    const filepath = path.join(folder, name);

    await fs.writeFile(filepath, buffer);
    console.log(`Downloaded: ${name}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
  }
}

async function downloadImages(folder) {
  try {
    await fs.mkdir(folder, { recursive: true });
    const reversedList = urls.reverse();
    for (const company of reversedList) {
      const url = `https://staging.fey.com/images/logos/${company.logo}`;
      await downloadImage(url, folder, company.logo);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const downloadFolder = path.join(__dirname, 'images');
downloadImages(downloadFolder);
