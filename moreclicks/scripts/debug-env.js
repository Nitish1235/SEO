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

const env = { ...process.env, ...loadEnv('.env'), ...loadEnv('.env.local') };

console.log('DATAFORSEO_LOGIN:', env.DATAFORSEO_LOGIN ? 'Exists' : 'MISSING');
console.log('DATAFORSEO_PASSWORD:', env.DATAFORSEO_PASSWORD ? 'Exists' : 'MISSING');
console.log('ANTHROPIC_API_KEY:', env.ANTHROPIC_API_KEY ? 'Exists (' + env.ANTHROPIC_API_KEY.substring(0, 5) + '...)' : 'MISSING');
