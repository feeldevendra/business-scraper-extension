import { parseCSV, downloadCSV } from "./utils.js";

let extractedData = [];

document.getElementById('startBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('csvFile');
  if (!fileInput.files.length) return alert('Please upload CSV file');

  const csvText = await fileInput.files[0].text();
  const rows = parseCSV(csvText);

  extractedData = [];
  document.getElementById('results').innerHTML = '';

  for (const row of rows) {
    try {
      const result = await scrapeWebsite(row.website);
      extractedData.push({ name: row.name, website: row.website, ...result });
      displayResult(row.name, result);
    } catch (e) {
      extractedData.push({ name: row.name, website: row.website, email: '', phone: '' });
    }
  }

  alert('Extraction complete! You can now download CSV.');
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!extractedData.length) return alert('No data extracted yet!');
  downloadCSV(extractedData, 'extracted_data.csv');
});

function displayResult(name, result) {
  const div = document.getElementById('results');
  const html = `<p><b>${name}</b>: Email - ${result.email || 'N/A'}, Phone - ${result.phone || 'N/A'}</p>`;
  div.innerHTML += html;
}

function scrapeWebsite(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url, active: false }, (tab) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const footer = document.querySelector('footer') || document.body;
            const text = footer.innerText;

            const emailMatch = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
            const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/);

            return { email: emailMatch ? emailMatch[0] : '', phone: phoneMatch ? phoneMatch[0] : '' };
          }
        },
        (results) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(results[0].result);
          }
          chrome.tabs.remove(tab.id);
        }
      );
    });
  });
}
