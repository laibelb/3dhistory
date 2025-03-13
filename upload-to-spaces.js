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
  else if (extension === '.css') contentType = 'text/css';
  else if (extension === '.js') contentType = 'application/javascript';
  else if (extension === '.html') contentType = 'text/html';
  
  // Upload parameters
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: `assets/${relativePath}`,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: contentType
  };
  
  try {
    // Upload the file
    await s3.putObject(params).promise();
    console.log(`Uploaded: ${filePath} -> ${SPACES_BASE_URL}/assets/${relativePath}`);
    
    // Return the URL for the asset mapping
    return `${SPACES_BASE_URL}/assets/${relativePath}`;
  } catch (err) {
    console.error(`Error uploading ${filePath}:`, err);
    return null;
  }
}

// Function to upload all assets
async function uploadAssets() {
  try {
    // Create asset mapping object
    const assetMapping = {};
    
    // Upload assets directory
    console.log('Uploading assets directory...');
    const assetFiles = await getFiles('assets');
    for (const file of assetFiles) {
      const spacesUrl = await uploadFile(file);
      assetMapping[file] = spacesUrl;
    }
    
    // Upload CSS directory
    console.log('Uploading CSS directory...');
    try {
      const cssFiles = await getFiles('css');
      for (const file of cssFiles) {
        const relativePath = path.relative('css', file).replace(/\\/g, '/');
        const key = `css/${relativePath}`;
        
        // Read the file
        const fileContent = fs.readFileSync(file);
        
        // Set content type
        let contentType = 'text/css';
        if (path.extname(file).toLowerCase() === '.js') {
          contentType = 'application/javascript';
        }
        
        // Upload parameters
        const params = {
          Bucket: process.env.SPACES_BUCKET,
          Key: key,
          Body: fileContent,
          ACL: 'public-read',
          ContentType: contentType
        };
        
        // Upload the file
        await s3.putObject(params).promise();
        console.log(`Uploaded: ${file} -> ${SPACES_BASE_URL}/${key}`);
        
        // Add to asset mapping
        assetMapping[file] = `${SPACES_BASE_URL}/${key}`;
      }
    } catch (err) {
      console.log('No CSS directory or error uploading CSS files:', err.message);
    }
    
    // Save the asset mapping to a file
    fs.writeFileSync('asset-mapping.json', JSON.stringify(assetMapping, null, 2));
    console.log(`Asset mapping saved to asset-mapping.json with ${Object.keys(assetMapping).length} entries`);
    
    return assetMapping;
  } catch (err) {
    console.error('Error uploading assets:', err);
    throw err;
  }
}

// Run the upload function
uploadAssets(); 