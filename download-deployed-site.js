const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

const baseUrl = 'https://threedhistory-8s36b.ondigitalocean.app';
const outputDir = 'deployed-site';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Download a file from the deployed site
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${url}`);
          resolve();
        });
      } else if (response.statusCode === 404) {
        console.log(`File not found: ${url}`);
        file.close();
        fs.unlinkSync(outputPath);
        resolve();
      } else {
        file.close();
        fs.unlinkSync(outputPath);
        reject(`Failed to download ${url}: ${response.statusCode}`);
      }
    }).on('error', (err) => {
      fs.unlinkSync(outputPath);
      reject(err);
    });
  });
}

// Files to download
const filesToDownload = [
  '/index.html',
  '/styles.css',
  '/script.js',
  '/script.min.js',
  '/assets/images/ancient-rome/ancient-rome-1.jpg',
  '/assets/images/ancient-rome/ancient-rome-2.jpg',
  '/assets/images/ancient-rome/ancient-rome-3.jpg',
  '/assets/images/ancient-egypt/ancient-egypt-1.jpg',
  '/assets/images/ancient-egypt/ancient-egypt-2.jpg',
  '/assets/images/ancient-egypt/ancient-egypt-3.jpg',
  '/assets/images/medieval-europe/medieval-europe-1.jpg',
  '/assets/images/medieval-europe/medieval-europe-2.jpg',
  '/assets/images/medieval-europe/medieval-europe-3.jpg',
];

// Download all files
async function downloadAllFiles() {
  for (const file of filesToDownload) {
    const url = `${baseUrl}${file}`;
    const outputPath = path.join(outputDir, file);
    
    try {
      await downloadFile(url, outputPath);
    } catch (error) {
      console.error(error);
    }
  }
  
  console.log('Download completed!');
}

downloadAllFiles(); 