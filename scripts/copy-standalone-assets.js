/**
 * Post-build script to copy static assets to standalone folder
 * This is required for standalone deployments (output: 'standalone')
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

// Check if standalone build exists
if (!fs.existsSync(standaloneDir)) {
  console.log('⏭️  No standalone build found, skipping asset copy');
  process.exit(0);
}

console.log('📁 Copying static assets to standalone folder...');

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`   ⚠️  Source not found: ${src}`);
    return 0;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  
  return count;
}

// Copy .next/static to .next/standalone/.next/static
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const staticCount = copyDir(staticSrc, staticDest);
console.log(`   ✅ Copied ${staticCount} static files`);

// Copy public folder to .next/standalone/public
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
const publicCount = copyDir(publicSrc, publicDest);
console.log(`   ✅ Copied ${publicCount} public files`);

console.log('✅ Standalone assets ready!');

