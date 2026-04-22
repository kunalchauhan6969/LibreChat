import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// OpenAI-compatible providers — just need a different baseURL
const OPENAI_COMPAT = {
  openai:       { baseURL: undefined },
  groq:         { baseURL: 'https://api.groq.com/openai/v1' },
  mistral:      { baseURL: 'https://api.mistral.ai/v1' },
  deepseek:     { baseURL: 'https://api.deepseek.com' },
  cohere:       { baseURL: 'https://api.cohere.ai/compatibility/v1' },
  'grok (xai)': { baseURL: 'https://api.x.ai/v1' },
  grok:         { baseURL: 'https://api.x.ai/v1' },
  openrouter:   {
    baseURL: 'https://openrouter.ai/api/v1',
    headers: { 'HTTP-Referer': 'https://yahavi-ai.vercel.app', 'X-Title': 'Yahavi.AI' },
  },
};

function buildPrompt(message, platform, tone) {
  return `You are an expert social media content creator. Generate a high-converting ${platform} post in a ${tone} tone about: "${message}".

Your response MUST use EXACTLY this format (no markdown bold, no extra symbols):

Hook: [one powerful attention-grabbing opening line]

Caption: [full post body, 2-4 sentences, platform-optimized]

CTA: [one clear and compelling call to action]

Hashtags: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8 #hashtag9 #hashtag10

Variations:
1. [alternative version — different angle or style]
2. [alternative version — different angle or style]
3. [alternative version — different angle or style]

Keep it authentic, engaging, and ready to post immediately.`;
}

function parseResponse(rawText) {
  const text = rawText
    .replace(/\*\*(Hook|Caption|CTA|Hashtags|Variations):\*\*/gi, '$1:')
    .replace(/__(Hook|Caption|CTA|Hashtags|Variations):__/gi, '$1:');

  const grab = (regex) => { const m = text.match(regex); return m ? m[1].trim() : ''; };

  const hook    = grab(/Hook:\s*(.+?)(?=\n\s*\n|\nCaption:|\nCTA:|\nHashtags:|\nVariations:|$)/si);
  const caption = grab(/Caption:\s*(.+?)(?=\n\s*\nCTA:|\nCTA:|\nHashtags:|\nVariations:|$)/si);
  const cta     = grab(/CTA:\s*(.+?)(?=\n\s*\nHashtags:|\nHashtags:|\nVariations:|$)/si);

  const hashtagText = grab(/Hashtags:\s*(.+?)(?=\n\s*\nVariations:|\nVariations:|$)/si);
  const hashtags = hashtagText
    .split(/[\s,]+/)
    .map(t => t.trim().replace(/[^\w#]/g, ''))
    .filter(t => t.startsWith('#'))
    .slice(0, 10);

  const varText = grab(/Variations:\s*([\s\S]+?)$/i);
  const variations = varText
    ? varText.split(/\n(?=\d+[\.\)]\s)/)
        .map(v => v.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(v => v.length > 5)
        .slice(0, 3)
    : [];

  return { hook, caption, cta, hashtags, variations };
}

async function generateResponse(provider, apiKey, model, prompt) {
  const key = provider.toLowerCase().trim();

  // Gemini — uses Google's own SDK
  if (key === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const m = genAI.getGenerativeModel({ model });
    const result = await m.generateContent(prompt);
    return result.response.text();
  }

  // Anthropic — uses Anthropic SDK
  if (key === 'anthropic') {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });
    return msg.content[0].text;
  }

  // All other providers — OpenAI-compatible
  const config = OPENAI_COMPAT[key];
  if (!config) throw new Error(`Unsupported provider: "${provider}". Supported: OpenAI, Gemini, Groq, Anthropic, Mistral, DeepSeek, Cohere, Grok (xAI), OpenRouter.`);

  const client = new OpenAI({
    apiKey,
    ...(config.baseURL  ? { baseURL: config.baseURL }              : {}),
    ...(config.headers  ? { defaultHeaders: config.headers }       : {}),
  });

  const res = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 1200,
  });
  return res.choices[0].message.content;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { message, platform, tone, provider, model, apiKey } = req.body || {};

  if (!message?.trim())  return res.status(400).json({ error: 'message is required' });
  if (!provider?.trim()) return res.status(400).json({ error: 'provider is required' });
  if (!model?.trim())    return res.status(400).json({ error: 'model is required' });
  if (!apiKey?.trim())   return res.status(400).json({ error: 'apiKey is required' });

  const prompt = buildPrompt(message, platform || 'Instagram', tone || 'Professional');

  try {
    const rawText = await generateResponse(provider, apiKey, model, prompt);
    const data = parseResponse(rawText);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(`[${provider}/${model}] Error:`, err.message);
    const status = err.status || err.response?.status || 500;
    if (status === 401) return res.status(401).json({ error: 'Invalid API key. Please check your credentials.' });
    if (status === 429) return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    if (err.message?.toLowerCase().includes('model')) return res.status(400).json({ error: `Model error: ${err.message}` });
    return res.status(500).json({ error: err.message || 'Failed to generate content. Please try again.' });
  }
}
