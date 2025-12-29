const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually parse env files
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
    return env;
}

const envLocal = loadEnv('.env.local');
const env = loadEnv('.env');
// Merge, preferring .env.local, then .env, then process.env
const config = { ...process.env, ...env, ...envLocal };

const LOGIN = config.DATAFORSEO_LOGIN;
const PASS = config.DATAFORSEO_PASSWORD;

console.log('--- DataForSEO Diagnostic Script ---');
console.log(`DATAFORSEO_LOGIN: ${LOGIN ? 'Found (' + LOGIN.substring(0, 3) + '***)' : 'MISSING'}`);
console.log(`DATAFORSEO_PASSWORD: ${PASS ? 'Found (' + PASS.substring(0, 3) + '***)' : 'MISSING'}`);

if (!LOGIN || !PASS) {
    console.error('\nERROR: Missing credentials. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env or .env.local');
    process.exit(1);
}

const credentials = Buffer.from(`${LOGIN}:${PASS}`).toString('base64');
const authHeader = `Basic ${credentials}`;

const options = {
    hostname: 'api.dataforseo.com',
    path: '/v3/serp/google/organic/live/advanced',
    method: 'POST',
    headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
    }
};

const postData = JSON.stringify([{
    keyword: "seo check",
    location_code: 2840,
    language_code: "en",
    device: "desktop",
    os: "windows",
    depth: 10
}]);

console.log('\nSending request to DataForSEO (POST /v3/serp/google/organic/live/advanced)...');

const req = https.request(options, (res) => {
    console.log(`Response Status: ${res.statusCode} ${res.statusMessage}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
                if (json.tasks?.[0]?.status_message === 'Ok') {
                    console.log('SUCCESS: API returned results.');
                    console.log('Task ID:', json.tasks[0].id);
                    console.log('Cost:', json.tasks[0].cost);
                } else {
                    console.error('FAILURE: API returned 200 but task failed.');
                    console.error('Task Message:', json.tasks?.[0]?.status_message);
                }
            } else {
                console.error('FAILURE: API returned error.');
                console.error('Message:', json.status_message || data);
            }
        } catch (e) {
            console.error('Failed to parse response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Network Error: ${e.message}`);
});

req.write(postData);
req.end();
