export const PROVIDERS = {
  OpenAI: {
    keyHint: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ],
  },
  Gemini: {
    keyHint: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ],
  },
  Groq: {
    keyHint: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
      'gemma-7b-it',
    ],
  },
  Anthropic: {
    keyHint: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      'claude-opus-4-7',
      'claude-sonnet-4-6',
      'claude-haiku-4-5-20251001',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
  },
  Mistral: {
    keyHint: 'API key...',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    models: [
      'mistral-large-latest',
      'mistral-medium-latest',
      'mistral-small-latest',
      'codestral-latest',
      'open-mixtral-8x7b',
      'open-mistral-7b',
    ],
  },
  DeepSeek: {
    keyHint: 'API key...',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    models: [
      'deepseek-chat',
      'deepseek-reasoner',
    ],
  },
  Cohere: {
    keyHint: 'API key...',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    models: [
      'command-r-plus',
      'command-r',
      'command-light',
      'command',
    ],
  },
  'Grok (xAI)': {
    keyHint: 'xai-...',
    docsUrl: 'https://console.x.ai/',
    models: [
      'grok-beta',
      'grok-2-1212',
      'grok-2-mini',
    ],
  },
  OpenRouter: {
    keyHint: 'sk-or-...',
    docsUrl: 'https://openrouter.ai/keys',
    models: [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-opus',
      'google/gemini-pro-1.5',
      'google/gemini-flash-1.5',
      'meta-llama/llama-3.1-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
      'mistralai/mixtral-8x7b-instruct',
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct',
      'x-ai/grok-beta',
      'cohere/command-r-plus',
    ],
  },
};

export const PROVIDER_NAMES = Object.keys(PROVIDERS);
