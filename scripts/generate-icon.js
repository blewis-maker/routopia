const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const sourcePath = path.join(__dirname, '../src/assets/icons/routpia-logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Define all the icons we need
const icons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcons() {
  // Create the output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  // Generate each icon
  for (const icon of icons) {
    const outputPath = path.join(outputDir, icon.name);
    
    await sharp(sourcePath)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(outputPath)
      .then(info => {
        console.log(`Generated ${icon.name}:`, info);
      })
      .catch(err => {
        console.error(`Error generating ${icon.name}:`, err);
      });
  }
}

generateIcons().catch(console.error); 