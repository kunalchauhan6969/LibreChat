import { useState, useRef } from 'react';
import { Send, Key, ChevronDown, AlertCircle } from 'lucide-react';

const PLATFORMS = ['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube'];
const TONES     = ['Professional', 'Funny', 'Viral', 'Motivational', 'Casual', 'Educational', 'Inspirational'];
const PROVIDERS = ['OpenAI', 'Gemini', 'Grok'];

function Dropdown({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="
          appearance-none bg-white/5 border border-white/10 text-gray-300
          text-xs rounded-lg pl-3 pr-7 py-2
          hover:bg-white/10 hover:border-white/20
          focus:outline-none focus:border-violet-500/60
          transition-colors cursor-pointer
        "
      >
        {options.map(o => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>
  );
}

export default function InputBar({
  onSend, isLoading,
  platform, tone, provider, apiKey,
  onPlatformChange, onToneChange, onProviderChange, onApiKeyChange,
}) {
  const [input, setInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (isLoading) return;
    if (!input.trim()) return;
    if (!apiKey.trim()) {
      setShowKey(true);
      setKeyError('Please enter your API key to continue.');
      return;
    }
    setKeyError('');
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = e => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  };

  const handleApiKeyChange = val => {
    onApiKeyChange(val);
    if (val.trim()) setKeyError('');
  };

  const providerPlaceholders = {
    OpenAI: 'sk-...',
    Gemini: 'AIza...',
    Grok:   'xai-...',
  };

  return (
    <div className="shrink-0 border-t border-white/5 bg-[#1a1a1a] px-4 sm:px-8 pt-3 pb-4">
      {/* Controls */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <Dropdown value={platform} onChange={onPlatformChange} options={PLATFORMS} />
        <Dropdown value={tone}     onChange={onToneChange}     options={TONES}     />
        <Dropdown value={provider} onChange={onProviderChange} options={PROVIDERS} />

        <button
          onClick={() => { setShowKey(v => !v); setKeyError(''); }}
          className={`
            flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs border transition-colors
            ${apiKey.trim()
              ? 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'}
          `}
        >
          <Key size={11} />
          {apiKey.trim() ? 'API Key ✓' : 'Set API Key'}
        </button>
      </div>

      {/* API Key field */}
      {showKey && (
        <div className="mb-2.5 animate-fadeInUp">
          <input
            type="password"
            value={apiKey}
            onChange={e => handleApiKeyChange(e.target.value)}
            placeholder={`${provider} API key (${providerPlaceholders[provider] || '...'})`}
            className={`
              w-full bg-white/5 border rounded-xl px-3.5 py-2.5
              text-sm text-gray-200 placeholder-gray-600
              focus:outline-none transition-colors
              ${keyError ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-violet-500/60'}
            `}
          />
          {keyError ? (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
              <AlertCircle size={11} /> {keyError}
            </p>
          ) : (
            <p className="text-[11px] text-gray-600 mt-1.5">
              ⚠ Key used per-request only — never stored or logged.
            </p>
          )}
        </div>
      )}

      {/* Text input row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-violet-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Enter a topic… e.g. 'AI tools for freelancers in 2025'"
            rows={1}
            className="
              w-full bg-transparent text-sm text-gray-200 placeholder-gray-600
              px-4 py-3 resize-none focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{ minHeight: '48px', maxHeight: '128px' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className={`
            p-3.5 rounded-2xl transition-all duration-200 shrink-0
            ${!isLoading && input.trim()
              ? 'bg-violet-600 hover:bg-violet-500 active:scale-95 text-white shadow-lg shadow-violet-900/40'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'}
          `}
          aria-label="Send"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-600 border-t-violet-400 rounded-full animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-700 mt-2.5">
        Yahavi.AI — Powered by OpenAI · Gemini · Grok
      </p>
    </div>
  );
}
