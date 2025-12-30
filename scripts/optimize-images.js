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
  console.log('📦 Installing sharp for image optimization...');
  require('child_process').execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  sharp = require('sharp');
}

// Configuration
const CONFIG = {
  // Source directory for original images
  sourceDir: path.join(__dirname, '../public/images/coins'),
  
  // Output directory for optimized images
  outputDir: path.join(__dirname, '../public/images/coins/optimized'),
  
  // Sizes to generate (width in pixels)
  sizes: [
    { width: 400, suffix: 'sm' },   // Mobile cards
    { width: 800, suffix: 'md' },   // Tablet / 2x mobile
    { width: 1200, suffix: 'lg' },  // Desktop
  ],
  
  // Quality settings
  webpQuality: 80,
  
  // Skip if optimized versions already exist and are newer than source
  skipExisting: true,
};

async function optimizeImage(inputPath, outputDir, sizes) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const results = [];

  for (const size of sizes) {
    const outputFilename = `${filename}-${size.suffix}.webp`;
    const outputPath = path.join(outputDir, outputFilename);

    // Check if we should skip this file
    if (CONFIG.skipExisting && fs.existsSync(outputPath)) {
      const inputStat = fs.statSync(inputPath);
      const outputStat = fs.statSync(outputPath);
      if (outputStat.mtime > inputStat.mtime) {
        results.push({ size: size.suffix, skipped: true });
        continue;
      }
    }

    try {
      await sharp(inputPath)
        .resize(size.width, null, {
          withoutEnlargement: true, // Don't upscale smaller images
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
  console.log('🖼️  Image Optimization Script');
  console.log('============================\n');

  // Check source directory exists
  if (!fs.existsSync(CONFIG.sourceDir)) {
    console.error(`❌ Source directory not found: ${CONFIG.sourceDir}`);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${CONFIG.outputDir}\n`);
  }

  // Get all WebP images
  const images = fs.readdirSync(CONFIG.sourceDir)
    .filter(file => file.endsWith('.webp') && !file.includes('-sm') && !file.includes('-md') && !file.includes('-lg'));

  if (images.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(`Found ${images.length} images to process...\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const image of images) {
    const inputPath = path.join(CONFIG.sourceDir, image);
    process.stdout.write(`Processing: ${image}... `);

    const results = await optimizeImage(inputPath, CONFIG.outputDir, CONFIG.sizes);
    
    const createdCount = results.filter(r => r.created).length;
    const skippedCount = results.filter(r => r.skipped).length;
    const errorCount = results.filter(r => r.error).length;

    created += createdCount;
    skipped += skippedCount;
    errors += errorCount;

    if (errorCount > 0) {
      console.log(`⚠️  ${createdCount} created, ${errorCount} errors`);
    } else if (skippedCount === results.length) {
      console.log('⏭️  up to date');
    } else {
      console.log(`✅ ${createdCount} created`);
    }
  }

  console.log('\n============================');
  console.log(`📊 Summary:`);
  console.log(`   Created: ${created} images`);
  console.log(`   Skipped: ${skipped} (already up to date)`);
  if (errors > 0) {
    console.log(`   Errors:  ${errors}`);
  }
  console.log('============================\n');

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
  console.log(`📄 Generated manifest: ${manifestPath}`);
}

main().catch(console.error);

