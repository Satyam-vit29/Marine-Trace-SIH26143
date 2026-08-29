import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('../MarineTrace_Demo.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

console.log('File size bytes:', html.length);
console.log('File size MB:', (html.length / (1024 * 1024)).toFixed(2));
console.log('Includes <div id="root">:', html.includes('<div id="root"></div>'));
console.log('Includes window.__EMBEDDED_DATA__:', html.includes('window.__EMBEDDED_DATA__'));
console.log('Includes window.__EMBEDDED_SAR_IMAGE__:', html.includes('window.__EMBEDDED_SAR_IMAGE__'));
console.log('Includes CSS styles:', html.includes('.tactical-leaflet-map-light'));
console.log('Includes JS code:', html.includes('function') || html.includes('=>'));
console.log('Includes OpenStreetMap layer:', html.includes('tile.openstreetmap.org'));
