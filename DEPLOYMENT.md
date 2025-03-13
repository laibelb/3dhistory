# Deployment Checklist

Follow these steps to ensure successful deployment of Chronos Forge:

## Pre-Deployment

1. **Set up object storage**
   - Create a DigitalOcean Spaces bucket (or similar)
   - Update `.env` file with your credentials

2. **Upload large assets**
   ```
   npm run upload-assets
   ```

3. **Update asset references**
   ```
   npm run update-references
   ```

4. **Verify changes**
   - Check that HTML, CSS, and JS files now reference CDN URLs
   - Test locally to ensure assets load correctly from CDN
   - Run `npm start` and verify the application works

5. **Commit changes**
   ```
   git add .
   git commit -m "Move large assets to CDN for deployment optimization"
   git push
   ```

## Deployment

1. **Deploy to DigitalOcean App Platform**
   - The app should now deploy successfully since large assets are no longer included

2. **Verify deployment**
   - Check that the application loads correctly
   - Verify that all assets load from the CDN
   - Test all functionality

## Troubleshooting

If deployment still fails:

1. **Check deployment logs**
   - Look for specific error messages in the DigitalOcean App Platform logs

2. **Verify asset sizes**
   - Run `dir -Recurse | Measure-Object -Property Length -Sum` to check total project size
   - It should be significantly smaller than before

3. **Check .dockerignore**
   - Ensure large assets are properly excluded from the Docker build

4. **Verify environment variables**
   - Make sure any required environment variables are set in the App Platform settings

5. **Check resource limits**
   - Ensure your app is not exceeding resource limits (memory, CPU, etc.)

## Post-Deployment

1. **Clean up local assets (optional)**
   ```
   npm run cleanup-assets
   ```

2. **Update documentation**
   - Update any relevant documentation with information about the CDN setup

3. **Monitor performance**
   - Keep an eye on CDN usage and costs
   - Monitor application performance with assets served from CDN 