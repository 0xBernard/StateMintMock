/**
 * Image Optimization Script
 * Pre-generates optimized image sizes at build time to avoid runtime memory usage.
 *
 * Run manually: node scripts/optimize-images.js
 * Or automatically via: npm run build (integrated into prebuild)
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Installing sharp for image optimization...');
  require('child_process').execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  sharp = require('sharp');
}

const CONFIG = {
  sourceDir: path.join(__dirname, '../public/images/coins'),
  outputDir: path.join(__dirname, '../public/images/coins/optimized'),
  sizes: [
    { width: 400, suffix: 'sm' },
    { width: 800, suffix: 'md' },
    { width: 1200, suffix: 'lg' },
  ],
  webpQuality: 80,
};

async function optimizeImage(inputPath, outputDir, sizes) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const results = [];

  for (const size of sizes) {
    const outputFilename = `${filename}-${size.suffix}.webp`;
    const outputPath = path.join(outputDir, outputFilename);

    try {
      await sharp(inputPath)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: CONFIG.webpQuality })
        .toFile(outputPath);

      results.push({ size: size.suffix, created: true });
    } catch (error) {
      results.push({ size: size.suffix, error: error.message });
    }
  }

  return results;
}

async function main() {
  console.log('Image Optimization Script');
  console.log('=========================\n');

  if (!fs.existsSync(CONFIG.sourceDir)) {
    console.error(`Source directory not found: ${CONFIG.sourceDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`Created output directory: ${CONFIG.outputDir}\n`);
  }

  // Always rebuild optimized assets to avoid stale image/name pairings.
  const staleAssets = fs.readdirSync(CONFIG.outputDir).filter(
    file => file.endsWith('.webp') || file === 'manifest.json'
  );
  for (const file of staleAssets) {
    fs.unlinkSync(path.join(CONFIG.outputDir, file));
  }
  if (staleAssets.length > 0) {
    console.log(`Cleared ${staleAssets.length} existing optimized assets\n`);
  }

  const images = fs.readdirSync(CONFIG.sourceDir)
    .filter(file => file.endsWith('.webp') && !file.includes('-sm') && !file.includes('-md') && !file.includes('-lg'));

  if (images.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(`Found ${images.length} images to process...\n`);

  let created = 0;
  let errors = 0;

  for (const image of images) {
    const inputPath = path.join(CONFIG.sourceDir, image);
    process.stdout.write(`Processing: ${image}... `);

    const results = await optimizeImage(inputPath, CONFIG.outputDir, CONFIG.sizes);
    const createdCount = results.filter(r => r.created).length;
    const errorCount = results.filter(r => r.error).length;

    created += createdCount;
    errors += errorCount;

    if (errorCount > 0) {
      console.log(`${createdCount} created, ${errorCount} errors`);
    } else {
      console.log(`${createdCount} created`);
    }
  }

  console.log('\n=========================');
  console.log('Summary:');
  console.log(`  Created: ${created} images`);
  if (errors > 0) {
    console.log(`  Errors:  ${errors}`);
  }
  console.log('=========================\n');

  // Generate a manifest file for easy importing
  const manifest = {};
  const optimizedFiles = fs.readdirSync(CONFIG.outputDir).filter(f => f.endsWith('.webp'));

  for (const file of optimizedFiles) {
    const match = file.match(/^(.+)-(sm|md|lg)\.webp$/);
    if (match) {
      const [, name, size] = match;
      if (!manifest[name]) {
        manifest[name] = {};
      }
      manifest[name][size] = `/images/coins/optimized/${file}`;
    }
  }

  const manifestPath = path.join(CONFIG.outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated manifest: ${manifestPath}`);
}

main().catch(console.error);
