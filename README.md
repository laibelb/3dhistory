# Chronos Forge - AI-Powered Historical Gaming

This is the landing page for Chronos Forge, a platform for AI-developed 3D interactive games featuring rich historical narratives and dynamic gameplay powered by Unreal Engine 5.

## GitHub Repository

This project is now hosted on GitHub at: https://github.com/laibelb/3dhistory

## Features

- Responsive design with modern aesthetics
- Interactive 3D background using Three.js
- Smooth animations with GSAP
- Waitlist signup form
- Mobile-friendly layout

## Technologies Used

- HTML5
- CSS3 with custom properties (variables)
- JavaScript (ES6+)
- Three.js for 3D graphics
- GSAP for animations
- Google Fonts (Montserrat and Cinzel)

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling and responsive design
- `script.js` - JavaScript functionality including Three.js background and form handling

## Setup and Usage

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process required - this is a static website

## Browser Compatibility

The site is designed to work on all modern browsers that support:
- CSS Custom Properties
- ES6+ JavaScript
- WebGL (for Three.js)

## Future Enhancements

- Add backend integration for the waitlist form
- Implement more interactive elements
- Add a gallery section showcasing game previews
- Create a blog section for development updates

## License

All rights reserved © 2023 Chronos Forge

## Deployment Optimization

This project has been optimized for deployment by moving large media assets to a CDN/object storage service. Follow these steps to manage assets:

### Setting Up DigitalOcean Spaces (or similar object storage)

1. Create a DigitalOcean Spaces bucket (or similar object storage)
2. Update the `.env` file with your credentials:
   ```
   SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
   SPACES_REGION=us-east-1
   SPACES_BUCKET=your-bucket-name
   SPACES_KEY=your-spaces-access-key
   SPACES_SECRET=your-spaces-secret-key
   ```

### Uploading Assets to Object Storage

Run the following command to upload large assets to your object storage:

```
npm run upload-assets
```

This will:
- Scan the `assets` directory for files larger than 1MB
- Upload them to your object storage
- Create an `asset-mapping.json` file with the mapping between local paths and CDN URLs

### Updating Asset References

After uploading assets, run:

```
npm run update-references
```

This will:
- Update references in HTML, CSS, and JS files to point to the CDN URLs
- Update `.gitignore` and `.dockerignore` to exclude large assets from version control and Docker builds

### Cleaning Up Local Assets (Optional)

If you want to free up disk space after uploading assets to the CDN, you can run:

```
npm run cleanup-assets
```

This will:
- Delete the original large files from your local system
- Create small placeholder files with information about the CDN location
- Show how much disk space was freed

### Deployment

The application is configured to deploy to DigitalOcean App Platform. With the large assets moved to object storage, the deployment should now succeed.

## Local Development

For local development, you can still keep the assets locally. The scripts will not delete any local files, only update the references in the code.

## Optimizations

The website has been optimized for performance, SEO, and maintainability:

### CSS Optimization
- Modular CSS structure with separate files for:
  - Utils: variables, reset, utilities
  - Components: header, etc.
  - Sections: hero, features, gallery, testimonials, pricing, footer
- Minified CSS for production (main.min.css)

### JavaScript Optimization
- Minified JavaScript for production (script.min.js)
- Lazy loading for images and videos

### SEO Improvements
- Added structured data (JSON-LD) for better search engine visibility
- Created sitemap.xml for better indexing
- Added robots.txt to guide search engine crawlers
- Optimized meta tags and descriptions

### Performance Improvements
- Lazy loading for images and videos
- Minified CSS and JavaScript
- Optimized asset loading

## Development

### Prerequisites
- Node.js 18.x

### Installation
```bash
npm install
```

### Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Asset Management
```bash
# Upload assets to DigitalOcean Spaces
npm run upload-assets

# Update asset references in HTML, CSS, and JS files
npm run update-references

# Clean up local assets after uploading
npm run cleanup-assets
```

## Deployment

The website is deployed on DigitalOcean App Platform. See DEPLOYMENT.md for more details.

## License

All rights reserved. © 2025 3D History.