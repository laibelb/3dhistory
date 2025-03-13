const fs = require('fs');
const path = require('path');

console.log('Starting enhanced fix-deployed-css.js script...');

// Files to check and fix
const filesToFix = [
  'deployed-site.html',
  'index.html'
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`File ${file} does not exist, skipping.`);
    return;
  }

  console.log(`Checking ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let updated = false;

  // Check if the CSS reference is missing or incorrectly placed
  if (!content.includes('css/main.min.css') && !content.includes('main.min.css')) {
    console.log(`  Adding missing CSS reference to ${file}`);
    
    // Add the CSS reference before the existing styles.css reference
    content = content.replace(
      /<link rel="stylesheet" href="styles.css">/,
      '<link rel="stylesheet" href="css/main.min.css">\n    <link rel="stylesheet" href="styles.css">'
    );
    updated = true;
  }

  // Ensure styles.css is properly referenced with absolute URL for production
  if (file === 'deployed-site.html' && content.includes('<link rel="stylesheet" href="styles.css">')) {
    console.log('  Updating styles.css reference to use absolute URL');
    content = content.replace(
      /<link rel="stylesheet" href="styles.css">/,
      '<link rel="stylesheet" href="/styles.css">'
    );
    updated = true;
  }

  // Fix image paths that might be using relative paths incorrectly
  if (file === 'deployed-site.html') {
    // Fix image paths in src attributes
    content = content.replace(/src="assets\//g, 'src="/assets/');
    
    // Fix image paths in CSS background-image properties
    content = content.replace(/url\(assets\//g, 'url(/assets/');
    
    // Fix CSS paths
    content = content.replace(/href="css\//g, 'href="/css/');
    
    // Fix script paths
    content = content.replace(/src="script.min.js"/g, 'src="/script.min.js"');
    content = content.replace(/src="script.js"/g, 'src="/script.js"');
    
    updated = true;
  }

  // Write the file back if changes were made
  if (updated) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`  Updated ${file}`);
  } else {
    console.log(`  No changes needed for ${file}`);
  }
});

// Also create a copy of styles.css in the root directory for the deployed site
if (fs.existsSync('styles.css')) {
  console.log('Copying styles.css to deployed-site directory...');
  fs.copyFileSync('styles.css', 'deployed-site/styles.css');
}

// Copy main.min.css to deployed-site directory
if (fs.existsSync('css/main.min.css')) {
  console.log('Copying main.min.css to deployed-site directory...');
  
  // Ensure the directory exists
  if (!fs.existsSync('deployed-site/css')) {
    fs.mkdirSync('deployed-site/css', { recursive: true });
  }
  
  fs.copyFileSync('css/main.min.css', 'deployed-site/css/main.min.css');
}

console.log('Enhanced CSS reference fix completed.'); 