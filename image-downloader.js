const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
const imagesDir = path.join(assetsDir, 'images');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// List of image URLs to download - using reliable public domain images
const imageUrls = [
  // Ancient Egypt
  {
    url: 'https://images.pexels.com/photos/3522880/pexels-photo-3522880.jpeg?auto=compress&cs=tinysrgb&w=1920',
    filename: 'ancient-egypt-1.jpg',
    category: 'ancient-egypt'
  },
  {
    url: 'https://images.pexels.com/photos/3522881/pexels-photo-3522881.jpeg?auto=compress&cs=tinysrgb&w=1920',
    filename: 'ancient-egypt-2.jpg',
    category: 'ancient-egypt'
  },
  {
    url: 'https://cdn.pixabay.com/photo/2016/02/02/18/33/sphinx-1175828_1280.jpg',
    filename: 'ancient-egypt-3.jpg',
    category: 'ancient-egypt'
  },
  
  // Medieval Europe
  {
    url: 'https://images.pexels.com/photos/2832077/pexels-photo-2832077.jpeg?auto=compress&cs=tinysrgb&w=1920',
    filename: 'medieval-europe-1.jpg',
    category: 'medieval-europe'
  },
  {
    url: 'https://images.pexels.com/photos/2767739/pexels-photo-2767739.jpeg?auto=compress&cs=tinysrgb&w=1920',
    filename: 'medieval-europe-2.jpg',
    category: 'medieval-europe'
  },
  {
    url: 'https://cdn.pixabay.com/photo/2020/01/31/07/26/castle-4807312_1280.jpg',
    filename: 'medieval-europe-3.jpg',
    category: 'medieval-europe'
  },
  
  // Ancient Rome
  {
    url: 'https://images.pexels.com/photos/1797158/pexels-photo-1797158.jpeg?auto=compress&cs=tinysrgb&w=1920',
    filename: 'ancient-rome-1.jpg',
    category: 'ancient-rome'
  },
  {
    url: 'https://images.pexels.com/photos/1697076/pexels-photo-1697076.jpeg?auto=compress&cs=tinysrgb&w=1920',
    filename: 'ancient-rome-2.jpg',
    category: 'ancient-rome'
  },
  {
    url: 'https://cdn.pixabay.com/photo/2019/10/06/08/57/architecture-4529605_1280.jpg',
    filename: 'ancient-rome-3.jpg',
    category: 'ancient-rome'
  }
];

// Create category directories
const categories = ['ancient-egypt', 'medieval-europe', 'ancient-rome'];
categories.forEach(category => {
  const categoryDir = path.join(imagesDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir);
  }
});

// Function to download an image
function downloadImage(imageObj) {
  return new Promise((resolve, reject) => {
    const { url, filename, category } = imageObj;
    const filePath = path.join(imagesDir, category, filename);
    
    console.log(`Downloading ${url} to ${filePath}...`);
    
    // Determine if we need http or https
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const newUrl = response.headers.location;
        console.log(`Redirected to ${newUrl}`);
        
        // Update the URL and try again
        imageObj.url = newUrl;
        downloadImage(imageObj).then(resolve).catch(reject);
        return;
      }
      
      // Check if the response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      // Create a write stream to save the image
      const fileStream = fs.createWriteStream(filePath);
      
      // Pipe the response to the file
      response.pipe(fileStream);
      
      // Handle errors
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there's an error
        reject(err);
      });
      
      // Finish the download
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    });
    
    // Handle request errors
    request.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      reject(err);
    });
    
    // Set a timeout
    request.setTimeout(30000, () => {
      request.abort();
      fs.unlink(filePath, () => {}); // Delete the file if there's a timeout
      reject(new Error(`Request timeout for ${url}`));
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('Starting download of all images...');
  
  for (const imageObj of imageUrls) {
    try {
      await downloadImage(imageObj);
    } catch (error) {
      console.error(`Error downloading ${imageObj.url}:`, error.message);
    }
  }
  
  console.log('All downloads completed!');
}

// Start the download process
downloadAllImages();

// Add testimonial images
const testimonialImages = [
    {
        url: 'https://randomuser.me/api/portraits/women/65.jpg',
        path: 'assets/images/testimonials/principal.jpg',
        description: 'School Principal'
    },
    {
        url: 'https://randomuser.me/api/portraits/men/32.jpg',
        path: 'assets/images/testimonials/teacher.jpg',
        description: 'History Teacher'
    },
    {
        url: 'https://randomuser.me/api/portraits/women/42.jpg',
        path: 'assets/images/testimonials/tech-director.jpg',
        description: 'Technology Director'
    }
];

// Download testimonial images
async function downloadTestimonialImages() {
    console.log('Downloading testimonial images...');
    
    for (const image of testimonialImages) {
        try {
            const response = await fetch(image.url);
            if (!response.ok) {
                throw new Error(`Failed to download ${image.url}: ${response.statusText}`);
            }
            
            const buffer = await response.arrayBuffer();
            await fs.promises.writeFile(image.path, Buffer.from(buffer));
            console.log(`Downloaded ${image.description} image to ${image.path}`);
        } catch (error) {
            console.error(`Error downloading ${image.url}:`, error);
        }
    }
}

// Call the function to download testimonial images
downloadTestimonialImages(); 