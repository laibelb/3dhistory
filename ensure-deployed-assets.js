const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting ensure-deployed-assets.js script...');

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Ensure deployed-site directory exists
ensureDirectoryExists('deployed-site');
ensureDirectoryExists('deployed-site/css');
ensureDirectoryExists('deployed-site/assets');
ensureDirectoryExists('deployed-site/assets/images');
ensureDirectoryExists('deployed-site/assets/videos');

// Copy essential files to deployed-site directory
console.log('Copying essential files to deployed-site directory...');

// Copy CSS files
if (fs.existsSync('styles.css')) {
  fs.copyFileSync('styles.css', 'deployed-site/styles.css');
  console.log('Copied styles.css to deployed-site directory');
}

if (fs.existsSync('css/main.min.css')) {
  fs.copyFileSync('css/main.min.css', 'deployed-site/css/main.min.css');
  console.log('Copied main.min.css to deployed-site/css directory');
}

// Copy JavaScript files
if (fs.existsSync('script.js')) {
  fs.copyFileSync('script.js', 'deployed-site/script.js');
  console.log('Copied script.js to deployed-site directory');
}

if (fs.existsSync('script.min.js')) {
  fs.copyFileSync('script.min.js', 'deployed-site/script.min.js');
  console.log('Copied script.min.js to deployed-site directory');
}

// Copy HTML file
if (fs.existsSync('index.html')) {
  // Read the index.html file
  let indexContent = fs.readFileSync('index.html', 'utf8');
  
  // Fix asset paths for production
  indexContent = indexContent.replace(/src="assets\//g, 'src="/assets/');
  indexContent = indexContent.replace(/href="assets\//g, 'href="/assets/');
  indexContent = indexContent.replace(/url\(assets\//g, 'url(/assets/');
  indexContent = indexContent.replace(/href="css\//g, 'href="/css/');
  indexContent = indexContent.replace(/src="script.min.js"/g, 'src="/script.min.js"');
  indexContent = indexContent.replace(/src="script.js"/g, 'src="/script.js"');
  
  // Write the modified content to deployed-site/index.html
  fs.writeFileSync('deployed-site/index.html', indexContent);
  console.log('Copied and fixed index.html to deployed-site directory');
}

// Copy assets directory recursively
console.log('Copying assets directory...');

// Function to copy directory recursively
function copyDirectoryRecursive(source, destination) {
  // Create destination directory if it doesn't exist
  ensureDirectoryExists(destination);
  
  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} to ${destPath}`);
    }
  }
}

// Copy assets directory if it exists
if (fs.existsSync('assets')) {
  copyDirectoryRecursive('assets', 'deployed-site/assets');
}

console.log('Deployment assets preparation completed.');

// Update the deploy.js script to include this new step
console.log('Updating deploy.js to include the new asset preparation step...');

if (fs.existsSync('deploy.js')) {
  let deployContent = fs.readFileSync('deploy.js', 'utf8');
  
  // Check if the step is already included
  if (!deployContent.includes('ensure-deployed-assets.js')) {
    // Add the new step before the "Pushing to GitHub" step
    deployContent = deployContent.replace(
      '// Step 7: Push to GitHub',
      '// Step 6.5: Ensure all assets are properly prepared for deployment\nconsole.log(\'\\n6.5. Ensuring all assets are properly prepared for deployment...\');\ntry {\n  execSync(\'node ensure-deployed-assets.js\', { stdio: \'inherit\' });\n} catch (error) {\n  console.error(\'Error ensuring assets for deployment:\', error);\n  process.exit(1);\n}\n\n// Step 7: Push to GitHub'
    );
    
    // Write the updated content back to deploy.js
    fs.writeFileSync('deploy.js', deployContent);
    console.log('Updated deploy.js to include the new asset preparation step');
  } else {
    console.log('deploy.js already includes the asset preparation step');
  }
}

console.log('Asset preparation script completed successfully!'); 