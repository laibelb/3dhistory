const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
const videosDir = path.join(assetsDir, 'videos');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

// Create placeholder video files
const videoFiles = [
  'gameplay-demo-1.mp4',
  'gameplay-demo-2.mp4',
  'gameplay-demo-3.mp4',
  'gameplay-demo-4.mp4',
  'gameplay-demo-5.mp4',
  'gameplay-demo-6.mp4',
  'gameplay-demo-7.mp4',
  'background.mp4'
];

// Create a simple text file for each video
videoFiles.forEach(filename => {
  const filePath = path.join(videosDir, filename);
  fs.writeFileSync(filePath, 'Placeholder video file');
  console.log(`Created placeholder file: ${filePath}`);
});

console.log('All placeholder video files created!'); 