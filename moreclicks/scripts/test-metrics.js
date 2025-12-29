const https = require('https');
const fs = require('fs');

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
const config = { ...process.env, ...env, ...envLocal };

const LOGIN = config.DATAFORSEO_LOGIN;
const PASS = config.DATAFORSEO_PASSWORD;

if (!LOGIN || !PASS) {
    console.error('Missing credentials');
    process.exit(1);
}

const authHeader = `Basic ${Buffer.from(`${LOGIN}:${PASS}`).toString('base64')}`;

const options = {
    hostname: 'api.dataforseo.com',
    path: '/v3/dataforseo_labs/google/bulk_keyword_difficulty/live',
    method: 'POST',
    headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
    }
};

const postData = JSON.stringify([{
    keywords: ["seo check", "marketing"],
    location_code: 2840,
    language_code: "en"
}]);

console.log('Sending request to bulk_keyword_difficulty...');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            // Print keys of task[0] to see if it has 'data' or 'result'
            if (json.tasks && json.tasks[0]) {
                console.log('Task Keys:', Object.keys(json.tasks[0]));
                console.log('DATA Content:', JSON.stringify(json.tasks[0].data, null, 2));
                console.log('RESULT Content:', JSON.stringify(json.tasks[0].result, null, 2));
            } else {
                console.log('Full Response:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('Parse Error', e);
            console.log('Raw Data:', data);
        }
    });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
