const fs = require('fs');
const path = require('path');

console.log('Starting enhanced update-asset-references.js script...');

// Load the asset mapping
let assetMapping;
try {
  assetMapping = JSON.parse(fs.readFileSync('asset-mapping.json', 'utf8'));
  console.log('Loaded asset mapping with', Object.keys(assetMapping).length, 'entries');
  console.log('First entry:', Object.keys(assetMapping)[0], '->', assetMapping[Object.keys(assetMapping)[0]]);
} catch (err) {
  console.error('Error loading asset-mapping.json:', err);
  process.exit(1);
}

// Function to update file references in HTML and JS files
function updateFileReferences(filePath, mapping) {
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let updated = false;
    
    console.log(`Checking file: ${filePath} (${content.length} bytes)`);
    
    // Replace all local asset references with CDN URLs
    Object.keys(mapping).forEach(localPath => {
      // Convert Windows paths to Unix style for consistency
      const unixLocalPath = localPath.replace(/\\/g, '/');
      
      // Create different path formats that might be used in the code
      const relativePath = unixLocalPath.replace(/^.*?assets\//, 'assets/');
      const cdnUrl = mapping[localPath];
      
      console.log(`Checking for references to: ${relativePath}`);
      
      // Replace references in various formats
      // Full path
      if (content.includes(unixLocalPath)) {
        console.log(`  Found full path reference: ${unixLocalPath}`);
        content = content.replace(new RegExp(escapeRegExp(unixLocalPath), 'g'), cdnUrl);
        updated = true;
      }
      
      // Relative path
      if (content.includes(relativePath)) {
        console.log(`  Found relative path reference: ${relativePath}`);
        content = content.replace(new RegExp(escapeRegExp(relativePath), 'g'), cdnUrl);
        updated = true;
      }
      
      // Just the filename
      const filename = path.basename(unixLocalPath);
      if (content.includes(filename)) {
        console.log(`  Found filename reference: ${filename}`);
        // Be more careful with filenames as they might be common
        // Only replace if it's in an img src, video src, or similar context
        const mediaContexts = [
          `src=["']([^"']*${escapeRegExp(filename)})["']`,
          `href=["']([^"']*${escapeRegExp(filename)})["']`,
          `url\\(["']?([^"'\\)]*${escapeRegExp(filename)})["']?\\)`
        ];
        
        mediaContexts.forEach(context => {
          const regex = new RegExp(context, 'g');
          content = content.replace(regex, (match, p1) => {
            // Only replace if it's a relative path (not already a full URL)
            if (!p1.startsWith('http')) {
              console.log(`    Replacing: ${p1} -> ${cdnUrl}`);
              return match.replace(p1, cdnUrl);
            }
            return match;
          });
        });
      }
    });
    
    // Special handling for CSS files to ensure they're properly referenced
    if (filePath.endsWith('.html')) {
      // Make sure the main.min.css file is properly referenced
      if (!content.includes('css/main.min.css') && !content.includes('main.min.css')) {
        console.log('  Adding missing CSS reference to main.min.css');
        content = content.replace(
          /<link rel="stylesheet" href="styles.css">/,
          '<link rel="stylesheet" href="css/main.min.css">\n    <link rel="stylesheet" href="styles.css">'
        );
        updated = true;
      }
      
      // Ensure all asset paths use absolute paths for production
      if (filePath === 'index.html' || filePath === 'deployed-site.html') {
        console.log('  Ensuring all asset paths use absolute paths for production');
        
        // Fix relative paths for assets
        content = content.replace(/src="assets\//g, 'src="/assets/');
        content = content.replace(/href="assets\//g, 'href="/assets/');
        content = content.replace(/url\(assets\//g, 'url(/assets/');
        
        // Fix relative paths for CSS
        content = content.replace(/href="css\//g, 'href="/css/');
        content = content.replace(/href="styles.css"/g, 'href="/styles.css"');
        
        // Fix relative paths for JS
        content = content.replace(/src="script.min.js"/g, 'src="/script.min.js"');
        content = content.replace(/src="script.js"/g, 'src="/script.js"');
        
        updated = true;
      }
    }
    
    // Special handling for CSS files
    if (filePath.endsWith('.css')) {
      console.log('  Checking CSS file for asset references');
      
      // Fix relative paths in CSS
      content = content.replace(/url\(["']?assets\//g, 'url("/assets/');
      content = content.replace(/url\(["']?\.\.\/assets\//g, 'url("/assets/');
      
      updated = true;
    }
    
    // Write the file back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated references in ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed in ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`Error updating references in ${filePath}:`, err);
    return false;
  }
}

// Helper function to escape special characters in strings for use in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Files to update
const filesToUpdate = [
  'index.html',
  'deployed-site.html',
  'script.js',
  'styles.css'
];

// Update each file
let updatedCount = 0;
filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    const updated = updateFileReferences(file, assetMapping);
    if (updated) updatedCount++;
  } else {
    console.log(`File ${file} does not exist, skipping.`);
  }
});

console.log(`Updated references in ${updatedCount} files`);

// Create a .gitignore entry for the large assets
console.log('Adding large assets to .gitignore...');
let gitignore = fs.readFileSync('.gitignore', 'utf8');

// Add entries for large assets if not already present
const assetsEntry = '\n# Large assets (now on CDN)\nassets/generated/\nassets/videos/\nassets/images/\n';
if (!gitignore.includes('# Large assets (now on CDN)')) {
  gitignore += assetsEntry;
  fs.writeFileSync('.gitignore', gitignore);
  console.log('Updated .gitignore');
}

// Update .dockerignore to exclude large assets
console.log('Updating .dockerignore...');
let dockerignore = fs.readFileSync('.dockerignore', 'utf8');
const dockerAssetsEntry = '\n# Large assets (now on CDN)\nassets/generated/\nassets/videos/\nassets/images/\n';
if (!dockerignore.includes('# Large assets (now on CDN)')) {
  dockerignore += dockerAssetsEntry;
  fs.writeFileSync('.dockerignore', dockerignore);
  console.log('Updated .dockerignore');
}

// Create a copy of the updated files in the deployed-site directory
console.log('Creating copies of updated files in deployed-site directory...');

// Ensure deployed-site directory exists
if (!fs.existsSync('deployed-site')) {
  fs.mkdirSync('deployed-site', { recursive: true });
  console.log('Created deployed-site directory');
}

// Copy updated files to deployed-site directory
filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('deployed-site', file));
    console.log(`Copied ${file} to deployed-site directory`);
  }
});

console.log('Enhanced asset reference update complete!'); 