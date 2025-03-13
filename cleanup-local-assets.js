const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);

// Load the asset mapping
let assetMapping;
try {
  assetMapping = JSON.parse(fs.readFileSync('asset-mapping.json', 'utf8'));
} catch (err) {
  console.error('Error loading asset-mapping.json:', err);
  console.error('Please run "npm run upload-assets" first to generate the mapping file.');
  process.exit(1);
}

// Function to get all files in a directory recursively
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

// Function to create a placeholder file
function createPlaceholder(filePath, cdnUrl) {
  const placeholderContent = `This file has been moved to the CDN.
URL: ${cdnUrl}
Original file size: ${fs.statSync(filePath).size} bytes
Date: ${new Date().toISOString()}

This placeholder file is kept for development reference.`;

  // Create a placeholder file with the same name but .placeholder extension
  const placeholderPath = `${filePath}.placeholder`;
  fs.writeFileSync(placeholderPath, placeholderContent);
  console.log(`Created placeholder: ${placeholderPath}`);
}

// Main function to clean up local assets
async function cleanupLocalAssets() {
  try {
    console.log('Starting cleanup of local assets...');
    
    // Get the list of files that have been uploaded to the CDN
    const uploadedFiles = Object.keys(assetMapping);
    console.log(`Found ${uploadedFiles.length} files in the asset mapping`);
    
    // Confirm with the user
    console.log('\nWARNING: This will delete the original large files from your local system.');
    console.log('Make sure you have run "npm run upload-assets" and "npm run update-references" first.');
    console.log('The files will be replaced with small placeholder files.');
    console.log('\nPress Ctrl+C to cancel or wait 5 seconds to continue...');
    
    // Wait for 5 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Process each file
    let deletedCount = 0;
    let totalSizeFreed = 0;
    
    for (const filePath of uploadedFiles) {
      try {
        // Check if the file exists
        const fileStats = await stat(filePath);
        totalSizeFreed += fileStats.size;
        
        // Create a placeholder file
        createPlaceholder(filePath, assetMapping[filePath]);
        
        // Delete the original file
        await unlink(filePath);
        deletedCount++;
        console.log(`Deleted: ${filePath}`);
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
      }
    }
    
    // Print summary
    const mbFreed = (totalSizeFreed / (1024 * 1024)).toFixed(2);
    console.log(`\nCleanup complete!`);
    console.log(`Deleted ${deletedCount} files`);
    console.log(`Freed approximately ${mbFreed} MB of disk space`);
    console.log(`Created ${deletedCount} placeholder files`);
    
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

// Run the cleanup function
cleanupLocalAssets(); 