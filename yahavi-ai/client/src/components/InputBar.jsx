import { useState, useRef } from 'react';
import { Send, Key, ChevronDown, AlertCircle, ExternalLink } from 'lucide-react';
import { PROVIDERS, PROVIDER_NAMES } from '../data/providers.js';

const PLATFORMS = ['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube'];
const TONES     = ['Professional', 'Funny', 'Viral', 'Motivational', 'Casual', 'Educational', 'Inspirational'];

function Dropdown({ value, onChange, options, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="
          w-full appearance-none bg-white/5 border border-white/10 text-gray-300
          text-xs rounded-lg pl-3 pr-7 py-2
          hover:bg-white/10 hover:border-white/20
          focus:outline-none focus:border-violet-500/60
          transition-colors cursor-pointer truncate
        "
      >
        {options.map(o => <option key={o} value={o} className="bg-gray-900 text-gray-200">{o}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>
  );
}

export default function InputBar({
  onSend, isLoading,
  platform, tone, provider, model,
  apiKey,
  onPlatformChange, onToneChange,
  onProviderChange, onModelChange,
  onApiKeyChange,
}) {
  const [input,    setInput]    = useState('');
  const [showKey,  setShowKey]  = useState(false);
  const [keyError, setKeyError] = useState('');
  const textareaRef = useRef(null);

  const currentProvider = PROVIDERS[provider] || PROVIDERS.OpenAI;

  const handleProviderChange = (val) => {
    onProviderChange(val);
    // Auto-select first model of the new provider
    const firstModel = PROVIDERS[val]?.models[0] || '';
    onModelChange(firstModel);
    setKeyError('');
  };

  const handleSend = () => {
    if (isLoading || !input.trim()) return;
    if (!apiKey.trim()) {
      setShowKey(true);
      setKeyError('Please enter your API key to continue.');
      return;
    }
    setKeyError('');
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
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

  return (
    <div className="shrink-0 border-t border-white/5 bg-[#1a1a1a] px-4 sm:px-8 pt-3 pb-4">

      {/* Row 1: Platform + Tone */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Platform</span>
          <Dropdown value={platform} onChange={onPlatformChange} options={PLATFORMS} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Tone</span>
          <Dropdown value={tone} onChange={onToneChange} options={TONES} />
        </div>
      </div>

      {/* Row 2: Provider + Model + API Key toggle */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        {/* Provider */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">AI</span>
          <Dropdown value={provider} onChange={handleProviderChange} options={PROVIDER_NAMES} />
        </div>

        {/* Model */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium shrink-0">Model</span>
          <Dropdown
            value={model}
            onChange={onModelChange}
            options={currentProvider.models}
            className="flex-1"
          />
        </div>

        {/* API Key button */}
        <button
          onClick={() => { setShowKey(v => !v); setKeyError(''); }}
          className={`
            flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs border transition-colors shrink-0
            ${apiKey.trim()
              ? 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'}
          `}
        >
          <Key size={11} />
          {apiKey.trim() ? 'Key ✓' : 'API Key'}
        </button>
      </div>

      {/* API Key panel */}
      {showKey && (
        <div className="mb-3 p-3 bg-white/3 border border-white/8 rounded-xl animate-fadeInUp">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-300">{provider} API Key</span>
            {currentProvider.docsUrl && (
              <a
                href={currentProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
              >
                Get key <ExternalLink size={10} />
              </a>
            )}
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={e => handleApiKeyChange(e.target.value)}
            placeholder={`${provider} key (${currentProvider.keyHint})`}
            className={`
              w-full bg-white/5 border rounded-lg px-3 py-2
              text-sm text-gray-200 placeholder-gray-600
              focus:outline-none transition-colors
              ${keyError
                ? 'border-red-500/60 focus:border-red-500'
                : 'border-white/10 focus:border-violet-500/60'}
            `}
          />
          {keyError ? (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
              <AlertCircle size={11} /> {keyError}
            </p>
          ) : (
            <p className="text-[11px] text-gray-600 mt-1.5">
              ⚠ Used per-request only — never stored or logged.
            </p>
          )}
        </div>
      )}

      {/* Text input + Send */}
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
          {isLoading
            ? <div className="w-4 h-4 border-2 border-gray-600 border-t-violet-400 rounded-full animate-spin" />
            : <Send size={15} />}
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-700 mt-2.5">
        Yahavi.AI — {PROVIDER_NAMES.length} providers · {Object.values(PROVIDERS).reduce((a, p) => a + p.models.length, 0)} models
      </p>
    </div>
  );
}
