const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
const videosDir = path.join(assetsDir, 'videos');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

// URL of a free stock video (from Pexels)
const videoUrl = 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f62a23f8eb71a9bfb2247de103bfb4ecb8&profile_id=139&oauth2_token_id=57447761';
const videoPath = path.join(videosDir, 'background.mp4');

console.log(`Downloading video from ${videoUrl} to ${videoPath}...`);

// Determine if we need http or https
const client = videoUrl.startsWith('https') ? https : http;

const request = client.get(videoUrl, (response) => {
  // Handle redirects
  if (response.statusCode === 301 || response.statusCode === 302) {
    const newUrl = response.headers.location;
    console.log(`Redirected to ${newUrl}`);
    return;
  }
  
  // Check if the response is successful
  if (response.statusCode !== 200) {
    console.error(`Failed to download video: ${response.statusCode}`);
    return;
  }
  
  // Create a write stream to save the video
  const fileStream = fs.createWriteStream(videoPath);
  
  // Pipe the response to the file
  response.pipe(fileStream);
  
  // Handle errors
  fileStream.on('error', (err) => {
    fs.unlink(videoPath, () => {}); // Delete the file if there's an error
    console.error(`Error writing video file: ${err.message}`);
  });
  
  // Finish the download
  fileStream.on('finish', () => {
    fileStream.close();
    console.log(`Downloaded video to ${videoPath}`);
  });
});

// Handle request errors
request.on('error', (err) => {
  fs.unlink(videoPath, () => {}); // Delete the file if there's an error
  console.error(`Error downloading video: ${err.message}`);
});

// Set a timeout
request.setTimeout(60000, () => {
  request.abort();
  fs.unlink(videoPath, () => {}); // Delete the file if there's a timeout
  console.error(`Request timeout for ${videoUrl}`);
}); 