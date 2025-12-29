const https = require('https');
const fs = require('fs');

// Load Env
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });
    return env;
}
const config = { ...process.env, ...loadEnv('.env'), ...loadEnv('.env.local') };
const authHeader = `Basic ${Buffer.from(`${config.DATAFORSEO_LOGIN}:${config.DATAFORSEO_PASSWORD}`).toString('base64')}`;

// Helper for requests
function makeRequest(path, payload) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.dataforseo.com',
            path: path,
            method: 'POST',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
    });
}

async function run() {
    const keywords = ["Bangalore"]; // The keyword causing issues
    const payload = [{
        keywords: keywords,
        location_code: 2840,
        language_code: "en"
    }];

    console.log(`Testing keyword: ${keywords[0]}...`);

    try {
        const [diffRes, volRes] = await Promise.all([
            makeRequest('/v3/dataforseo_labs/google/bulk_keyword_difficulty/live', payload),
            makeRequest('/v3/dataforseo_labs/google/historical_search_volume/live', payload)
        ]);

        console.log('Difficulty API Status:', diffRes.status);
        console.log('Volume API Status:', volRes.status);

        const difficultyItems = diffRes.data.tasks?.[0]?.result?.[0]?.items || [];
        const volumeItems = volRes.data.tasks?.[0]?.result?.[0]?.items || [];

        console.log('Difficulty Items Found:', difficultyItems.length);
        console.log('Volume Items Found:', volumeItems.length);

        const diffItem = difficultyItems.find(i => i.keyword === keywords[0]);
        const volItem = volumeItems.find(i => i.keyword === keywords[0]);

        console.log('Difficulty Data:', diffItem ? diffItem.keyword_difficulty : 'MISSING');
        console.log('Volume Data:', volItem ? volItem.keyword_info.search_volume : 'MISSING');
        console.log('Full Volume Info:', volItem ? JSON.stringify(volItem.keyword_info, null, 2) : 'MISSING');

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

run();
