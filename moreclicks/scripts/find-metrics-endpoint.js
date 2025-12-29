const https = require('https');
const fs = require('fs');

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

const headers = { 'Authorization': authHeader, 'Content-Type': 'application/json' };

// Test Case 1: dataforseo_labs search_volume (if exists)
const options1 = {
    hostname: 'api.dataforseo.com',
    path: '/v3/dataforseo_labs/google/search_volume/live',
    method: 'POST',
    headers
};
const data1 = JSON.stringify([{ keywords: ["cosmetics"], location_code: 2840, language_code: "en" }]);

// Test Case 2: keywords_data search_volume (User suggestion)
const options2 = {
    hostname: 'api.dataforseo.com',
    path: '/v3/keywords_data/google_ads/search_volume/live',
    method: 'POST',
    headers
};
const data2 = JSON.stringify([{ keywords: ["cosmetics"], location_code: 2840, language_code: "en" }]);

function runTest(name, options, postData) {
    console.log(`\nTesting ${name}...`);
    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            console.log(`${name} Status:`, res.statusCode);
            if (res.statusCode === 200) {
                try {
                    const json = JSON.parse(body);
                    if (json.tasks?.[0]?.result) {
                        const item = json.tasks[0].result[0];
                        console.log(`${name} Result Sample:`, JSON.stringify(item, null, 2).substring(0, 300) + "...");
                        // check if it has search_volume
                        if (JSON.stringify(item).includes("search_volume")) console.log(">> CONTAINS SEARCH VOLUME");
                    } else {
                        console.log(`${name} Response:`, body.substring(0, 200));
                    }
                } catch (e) { console.error(e); }
            } else {
                console.log(`${name} Error:`, body);
            }
        });
    });
    req.write(postData);
    req.end();
}

runTest('Labs Search Volume', options1, data1);
// Test Case 3: Labs Keyword Ideas (might have both)
const options3 = {
    hostname: 'api.dataforseo.com',
    path: '/v3/dataforseo_labs/google/keyword_ideas/live',
    method: 'POST',
    headers
};
const data3 = JSON.stringify([{
    keywords: ["cosmetics"],
    location_code: 2840,
    language_code: "en",
    include_serp_info: true,
    include_clickstream_data: true
}]);
// Note: keyword_ideas might not accept 'keywords' list directly as target, usually 'keys' array for suggestions.
// DataForSEO API is complex.
// Let's also test 'historical_search_volume' which is the standard "Stats" endpoint.
const options4 = {
    hostname: 'api.dataforseo.com',
    path: '/v3/dataforseo_labs/google/historical_search_volume/live',
    method: 'POST',
    headers
};
const data4 = JSON.stringify([{ keywords: ["cosmetics"], location_code: 2840, language_code: "en" }]);


runTest('Labs Keyword Ideas', options3, data3);
runTest('Labs Historical Volume', options4, data4);
