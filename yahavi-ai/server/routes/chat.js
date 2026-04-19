import { Router } from 'express';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

function buildPrompt(message, platform, tone) {
  return `You are an expert social media content creator. Generate a high-converting ${platform} post in a ${tone} tone about: "${message}".

Your response MUST use EXACTLY this format with these exact labels (no markdown bold, no extra symbols):

Hook: [one powerful attention-grabbing opening line]

Caption: [full post body, 2-4 sentences, platform-optimized]

CTA: [one clear and compelling call to action]

Hashtags: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8 #hashtag9 #hashtag10

Variations:
1. [alternative version with a different angle or style]
2. [alternative version with a different angle or style]
3. [alternative version with a different angle or style]

Keep it authentic, engaging, and ready to post immediately.`;
}

function parseResponse(rawText) {
  // Normalize: strip markdown bold wrappers like **Hook:**
  const text = rawText
    .replace(/\*\*(Hook|Caption|CTA|Hashtags|Variations):\*\*/gi, '$1:')
    .replace(/__(Hook|Caption|CTA|Hashtags|Variations):__/gi, '$1:');

  const grab = (regex) => {
    const m = text.match(regex);
    return m ? m[1].trim() : '';
  };

  const hook = grab(/Hook:\s*(.+?)(?=\n\s*\n|\nCaption:|\nCTA:|\nHashtags:|\nVariations:|$)/si);
  const caption = grab(/Caption:\s*(.+?)(?=\n\s*\nCTA:|\nCTA:|\nHashtags:|\nVariations:|$)/si);
  const cta = grab(/CTA:\s*(.+?)(?=\n\s*\nHashtags:|\nHashtags:|\nVariations:|$)/si);

  const hashtagText = grab(/Hashtags:\s*(.+?)(?=\n\s*\nVariations:|\nVariations:|$)/si);
  const hashtags = hashtagText
    .split(/[\s,]+/)
    .map(t => t.trim().replace(/[^\w#]/g, ''))
    .filter(t => t.startsWith('#'))
    .slice(0, 10);

  const varText = grab(/Variations:\s*([\s\S]+?)$/i);
  const variations = varText
    ? varText
        .split(/\n(?=\d+[\.\)]\s)/)
        .map(v => v.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(v => v.length > 5)
        .slice(0, 3)
    : [];

  return { hook, caption, cta, hashtags, variations };
}

async function generateWithOpenAI(apiKey, prompt) {
  const client = new OpenAI({ apiKey });
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 1200,
  });
  return res.choices[0].message.content;
}

async function generateWithGemini(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithGrok(apiKey, prompt) {
  const client = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
  const res = await client.chat.completions.create({
    model: 'grok-beta',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 1200,
  });
  return res.choices[0].message.content;
}

async function generateResponse(provider, apiKey, prompt) {
  switch (provider.toLowerCase()) {
    case 'openai':  return generateWithOpenAI(apiKey, prompt);
    case 'gemini':  return generateWithGemini(apiKey, prompt);
    case 'grok':    return generateWithGrok(apiKey, prompt);
    default: throw new Error(`Unsupported provider: ${provider}`);
  }
}

router.post('/chat', async (req, res) => {
  const { message, platform, tone, provider, apiKey } = req.body;

  if (!message?.trim())  return res.status(400).json({ error: 'message is required' });
  if (!provider?.trim()) return res.status(400).json({ error: 'provider is required' });
  if (!apiKey?.trim())   return res.status(400).json({ error: 'apiKey is required' });

  const prompt = buildPrompt(message, platform || 'Instagram', tone || 'Professional');

  try {
    const rawText = await generateResponse(provider, apiKey, prompt);
    const data = parseResponse(rawText);
    res.json({ success: true, data });
  } catch (err) {
    console.error(`[${provider}] Error:`, err.message);
    const status = err.status || err.response?.status || 500;
    if (status === 401) return res.status(401).json({ error: 'Invalid API key. Please check your credentials.' });
    if (status === 429) return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    res.status(500).json({ error: err.message || 'Failed to generate content. Please try again.' });
  }
});

export default router;
