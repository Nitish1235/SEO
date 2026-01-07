/**
 * Script to convert logo.svg to logo.png for Google Search results
 * Run: node scripts/convert-logo-to-png.js
 * 
 * Requirements: Install sharp first - npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Note: This script requires sharp or another image conversion library
// For a simpler approach, use an online SVG to PNG converter or:
// 1. Open logo.svg in a browser
// 2. Take a screenshot at 512x512px
// 3. Save as logo.png in public/ folder

console.log('To convert logo.svg to logo.png:');
console.log('');
console.log('Option 1 - Online Converter:');
console.log('1. Go to https://convertio.co/svg-png/ or https://cloudconvert.com/svg-to-png');
console.log('2. Upload public/logo.svg');
console.log('3. Set size to 512x512 pixels');
console.log('4. Download and save as public/logo.png');
console.log('');
console.log('Option 2 - Using ImageMagick (if installed):');
console.log('magick convert -background none -resize 512x512 public/logo.svg public/logo.png');
console.log('');
console.log('Option 3 - Using Inkscape (if installed):');
console.log('inkscape public/logo.svg --export-type=png --export-filename=public/logo.png -w 512 -h 512');
console.log('');
console.log('The logo.png file should be 512x512 pixels, square, PNG format.');

