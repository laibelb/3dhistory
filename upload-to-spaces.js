const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Load environment variables
dotenv.config();

// Configure the AWS SDK to use DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
  region: process.env.SPACES_REGION || 'us-east-1'
});

// Base URL for your space
const SPACES_BASE_URL = `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_ENDPOINT}`;

// Function to get all files in a directory recursively
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

// Function to upload a file to Spaces
async function uploadFile(filePath) {
  // Get the relative path from the assets directory
  const relativePath = path.relative('assets', filePath).replace(/\\/g, '/');
  
  // Read the file
  const fileContent = fs.readFileSync(filePath);
  
  // Set the content type based on file extension
  const extension = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (extension === '.jpg' || extension === '.jpeg') contentType = 'image/jpeg';
  else if (extension === '.png') contentType = 'image/png';
  else if (extension === '.gif') contentType = 'image/gif';
  else if (extension === '.mp4') contentType = 'video/mp4';
  else if (extension === '.webm') contentType = 'video/webm';
  
  // Upload parameters
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: relativePath,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: contentType
  };
  
  try {
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully at ${data.Location}`);
    return {
      originalPath: filePath,
      spacesUrl: `${SPACES_BASE_URL}/${relativePath}`
    };
  } catch (err) {
    console.error(`Error uploading ${filePath}:`, err);
    return null;
  }
}

// Main function to upload all assets
async function uploadAssets() {
  try {
    // Get all files in the assets directory
    const assetFiles = await getFiles('assets');
    
    // Filter for large files (> 1MB)
    const largeFiles = [];
    for (const file of assetFiles) {
      const fileStats = await stat(file);
      if (fileStats.size > 1024 * 1024) { // > 1MB
        largeFiles.push(file);
      }
    }
    
    console.log(`Found ${largeFiles.length} large files to upload`);
    
    // Upload each large file
    const uploadResults = [];
    for (const file of largeFiles) {
      const result = await uploadFile(file);
      if (result) {
        uploadResults.push(result);
      }
    }
    
    // Generate a mapping file for reference
    const mapping = uploadResults.reduce((acc, item) => {
      acc[item.originalPath] = item.spacesUrl;
      return acc;
    }, {});
    
    fs.writeFileSync('asset-mapping.json', JSON.stringify(mapping, null, 2));
    console.log(`Uploaded ${uploadResults.length} files successfully`);
    console.log('Asset mapping saved to asset-mapping.json');
    
    return uploadResults;
  } catch (err) {
    console.error('Error uploading assets:', err);
  }
}

// Run the upload function
uploadAssets(); 