const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting enhanced deployment process...');

// Step 1: Create placeholder videos if they don't exist
console.log('\n1. Creating placeholder videos...');
try {
  // Create assets/videos directory if it doesn't exist
  const videosDir = path.join(__dirname, 'assets', 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
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

  let createdCount = 0;
  videoFiles.forEach(filename => {
    const filePath = path.join(videosDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, 'Placeholder video file');
      createdCount++;
    }
  });

  console.log(`Created ${createdCount} placeholder video files`);
} catch (error) {
  console.error('Error creating placeholder videos:', error);
  process.exit(1);
}

// Step 2: Build the CSS and JS files
console.log('\n2. Building CSS and JS files...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building CSS and JS files:', error);
  process.exit(1);
}

// Step 3: Upload assets to DigitalOcean Spaces
console.log('\n3. Uploading assets to DigitalOcean Spaces...');
try {
  execSync('npm run upload-assets', { stdio: 'inherit' });
} catch (error) {
  console.error('Error uploading assets:', error);
  process.exit(1);
}

// Step 4: Update asset references in the code
console.log('\n4. Updating asset references...');
try {
  execSync('node update-asset-references.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error updating asset references:', error);
  process.exit(1);
}

// Step 4.5: Fix CSS references in deployed HTML
console.log('\n4.5. Fixing CSS references in deployed HTML...');
try {
  execSync('node fix-deployed-css.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error fixing CSS references:', error);
  process.exit(1);
}

// Step 4.6: Ensure all assets are properly prepared for deployment
console.log('\n4.6. Ensuring all assets are properly prepared for deployment...');
try {
  execSync('node ensure-deployed-assets.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error ensuring assets for deployment:', error);
  process.exit(1);
}

// Step 5: Test the site locally
console.log('\n5. Testing the site locally...');
console.log('Starting the server. Press Ctrl+C to continue with deployment.');
try {
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  // This will always "fail" when the user presses Ctrl+C, so we don't exit
  console.log('Server stopped. Continuing with deployment...');
}

// Step 6: Commit changes
console.log('\n6. Committing changes...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Prepare for deployment with enhanced asset handling"', { stdio: 'inherit' });
} catch (error) {
  console.error('Error committing changes:', error);
  process.exit(1);
}

// Step 7: Push to GitHub
console.log('\n7. Pushing to GitHub...');
try {
  execSync('git push', { stdio: 'inherit' });
} catch (error) {
  console.error('Error pushing to GitHub:', error);
  process.exit(1);
}

console.log('\nEnhanced deployment process completed successfully!');
console.log('The site should now be available at https://threedhistory-8s36b.ondigitalocean.app/');
console.log('Please verify that all styles and images are displaying correctly.'); 