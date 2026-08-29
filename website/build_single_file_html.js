import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const websiteDir = path.resolve(__dirname);
const distDir = path.resolve(websiteDir, 'dist');
const publicDir = path.resolve(websiteDir, 'public');

console.log('Generating standalone MarineTrace_Demo.html with Case A (Bay of Bengal) and Case B (Arabian Sea)...');

// 1. Read production compiled JS & CSS from dist/
const assetsDir = path.resolve(distDir, 'assets');
const assetFiles = fs.readdirSync(assetsDir);

const jsFile = assetFiles.find((f) => f.endsWith('.js'));
const cssFile = assetFiles.find((f) => f.endsWith('.css'));

if (!jsFile || !cssFile) {
  throw new Error('Could not find JS or CSS bundle in dist/assets!');
}

console.log(`Found JS bundle: ${jsFile}`);
console.log(`Found CSS bundle: ${cssFile}`);

const jsCode = fs.readFileSync(path.resolve(assetsDir, jsFile), 'utf-8');
const cssCode = fs.readFileSync(path.resolve(assetsDir, cssFile), 'utf-8');

// 2. Read SAR Radar Image and encode as Base64 Data URI
const sarImagePath = path.resolve(publicDir, 'sentinel1_sar_scene.png');
let sarBase64Uri = '';
if (fs.existsSync(sarImagePath)) {
  const sarBuffer = fs.readFileSync(sarImagePath);
  sarBase64Uri = `data:image/png;base64,${sarBuffer.toString('base64')}`;
  console.log(`Embedded SAR image as Base64 (${(sarBase64Uri.length / 1024).toFixed(1)} KB)`);
}

// 3. Read JSON datasets for Case A (Bay of Bengal) and Case B (Arabian Sea)
const caseADir = path.resolve(publicDir, 'data', 'case_a');
const caseBDir = path.resolve(publicDir, 'data', 'case_b');

const caseA = {
  satellite: JSON.parse(fs.readFileSync(path.resolve(caseADir, 'satellite_detection.json'), 'utf-8')),
  forcing: JSON.parse(fs.readFileSync(path.resolve(caseADir, 'environmental_forcing.json'), 'utf-8')),
  forward: JSON.parse(fs.readFileSync(path.resolve(caseADir, 'trajectory.json'), 'utf-8')),
  backward: JSON.parse(fs.readFileSync(path.resolve(caseADir, 'backward_trajectory.json'), 'utf-8')),
  origin: JSON.parse(fs.readFileSync(path.resolve(caseADir, 'origin.json'), 'utf-8')),
  ais: JSON.parse(fs.readFileSync(path.resolve(caseADir, 'ais_web.json'), 'utf-8')),
};

const caseB = {
  satellite: JSON.parse(fs.readFileSync(path.resolve(caseBDir, 'satellite_detection.json'), 'utf-8')),
  forcing: JSON.parse(fs.readFileSync(path.resolve(caseBDir, 'environmental_forcing.json'), 'utf-8')),
  forward: JSON.parse(fs.readFileSync(path.resolve(caseBDir, 'trajectory.json'), 'utf-8')),
  backward: JSON.parse(fs.readFileSync(path.resolve(caseBDir, 'backward_trajectory.json'), 'utf-8')),
  origin: JSON.parse(fs.readFileSync(path.resolve(caseBDir, 'origin.json'), 'utf-8')),
  ais: JSON.parse(fs.readFileSync(path.resolve(caseBDir, 'ais_web.json'), 'utf-8')),
};

// Inject Base64 data URI into satellite metadata overlay
if (sarBase64Uri) {
  caseA.satellite.sar_image_overlay = {
    url: sarBase64Uri,
    bounds: [[16.35, 82.60], [16.65, 83.00]],
  };
  caseB.satellite.sar_image_overlay = {
    url: sarBase64Uri,
    bounds: [[18.35, 69.80], [18.65, 70.20]],
  };
}

console.log('Embedded Case A (Bay of Bengal) & Case B (Arabian Sea) datasets.');

// 4. Construct self-contained HTML
const standaloneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Marine Trace — Satellite Oil Spill Detection & Vessel Attribution</title>
  
  <!-- Preconnected Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet">

  <style>
/* Leaflet & Application Inlined Styles */
${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- Inlined Prototype Data & Offline Interceptor for Both Demonstration Cases -->
  <script>
    window.__EMBEDDED_SAR_IMAGE__ = ${JSON.stringify(sarBase64Uri)};
    window.__EMBEDDED_DATA__ = {
      CASE_A: ${JSON.stringify(caseA)},
      CASE_B: ${JSON.stringify(caseB)},
      // Fallback aliases for root requests
      satellite: ${JSON.stringify(caseA.satellite)},
      forcing: ${JSON.stringify(caseA.forcing)},
      forward: ${JSON.stringify(caseA.forward)},
      backward: ${JSON.stringify(caseA.backward)},
      origin: ${JSON.stringify(caseA.origin)},
      ais: ${JSON.stringify(caseA.ais)}
    };

    // Offline Fetch Interceptor (handles any fetch calls seamlessly in file:// mode)
    (function() {
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (typeof url === 'string') {
          const isCaseB = url.includes('case_b');
          const caseData = isCaseB ? window.__EMBEDDED_DATA__.CASE_B : window.__EMBEDDED_DATA__.CASE_A;

          if (url.includes('satellite_detection.json')) {
            return Promise.resolve(new Response(JSON.stringify(caseData.satellite), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          if (url.includes('environmental_forcing.json')) {
            return Promise.resolve(new Response(JSON.stringify(caseData.forcing), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          if (url.includes('trajectory.json') && !url.includes('backward')) {
            return Promise.resolve(new Response(JSON.stringify(caseData.forward), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          if (url.includes('backward_trajectory.json')) {
            return Promise.resolve(new Response(JSON.stringify(caseData.backward), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          if (url.includes('origin.json')) {
            return Promise.resolve(new Response(JSON.stringify(caseData.origin), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          if (url.includes('ais_web.json')) {
            return Promise.resolve(new Response(JSON.stringify(caseData.ais), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          if (url.includes('sentinel1_sar_scene.png')) {
            return Promise.resolve(new Response(window.__EMBEDDED_SAR_IMAGE__, { status: 200 }));
          }
        }
        if (originalFetch) {
          return originalFetch.apply(this, arguments);
        }
        return Promise.reject(new Error('Fetch not supported in local offline mode'));
      };
    })();
  </script>

  <!-- Inlined React Application Bundle -->
  <script>
${jsCode}
  </script>
</body>
</html>
`;

// 5. Write MarineTrace_Demo.html to project root & website/
const outputFilePath = path.resolve(rootDir, 'MarineTrace_Demo.html');
fs.writeFileSync(outputFilePath, standaloneHtml, 'utf-8');

const websiteOutputPath = path.resolve(websiteDir, 'MarineTrace_Demo.html');
fs.writeFileSync(websiteOutputPath, standaloneHtml, 'utf-8');

const fileSizeMb = (fs.statSync(outputFilePath).size / (1024 * 1024)).toFixed(2);
console.log(`SUCCESS! Created ${outputFilePath} (${fileSizeMb} MB) with both Demonstration Cases`);
