const Anthropic = require('@anthropic-ai/sdk');
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

const anthropic = new Anthropic({
    apiKey: config.ANTHROPIC_API_KEY,
});

const modelsToTry = [
    'claude-3-haiku-20240307',
    'claude-3-opus-20240229',
    'claude-3-5-sonnet-latest'
];

async function run() {
    console.log('Testing Claude API with "white black shoes" prompt...');
    const keyword = "white black shoes";
    const metrics = { searchVolume: 3600, keywordDifficulty: 0, cpc: 0.47, competition: 100 };

    // Mock SERP data (shortened for testing)
    const serpData = {
        topResults: [{ title: "Test", description: "Desc", url: "url" }],
        paa: [],
        featuredSnippet: undefined
    };

    for (const model of modelsToTry) {
        console.log(`\nTrying model: ${model}...`);
        try {
            const message = await anthropic.messages.create({
                model: model,
                max_tokens: 2000,
                system: `You are an expert SEO content strategist. Your task is to generate a content brief based on the provided keyword, search metrics, and SERP data. IMPORTANT: Return the response as raw JSON only.`,
                messages: [
                    {
                        role: 'user',
                        content: `Create a brief for "${keyword}".
Search Metrics: ${JSON.stringify(metrics)}
SERP Data: ${JSON.stringify(serpData)}
Provide a structured JSON response with the following format:
{
  "title": "Suggested title for the content",
  "outline": [
    { "heading": "H2 heading 1", "subheadings": ["H3 subheading 1", "H3 subheading 2"] },
    { "heading": "H2 heading 2", "subheadings": [] }
  ],
  "targetAudience": "Description of the target audience",
  "keyTakeaways": ["Key takeaway 1", "Key takeaway 2"],
  "tone": "Suggested tone (e.g., informative, casual, authoritative)",
  "keywordsToInclude": ["keyword1", "keyword2"]
}`
                    },
                ],
            });
            console.log(`SUCCESS with ${model}!`);
            const text = message.content[0].text;
            console.log('Raw Text:', text.substring(0, 100) + '...');

            // Test parsing
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : text;
            const parsed = JSON.parse(jsonString);
            console.log('Parsed JSON Title:', parsed.title);
            console.log('Parsed JSON Outline Items:', parsed.outline?.length);

            return;
        } catch (error) {
            console.error(`FAILED ${model}: ${error.message}`);
        }
    }
    console.log('\nAll models failed.');
}

run();
