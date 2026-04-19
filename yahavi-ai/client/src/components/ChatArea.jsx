import { useRef, useEffect } from 'react';
import { PanelLeft, Trash2, RefreshCw, Sparkles, Instagram, Twitter, Linkedin } from 'lucide-react';
import MessageBubble from './MessageBubble';

const SUGGESTIONS = [
  'AI productivity tools for remote teams',
  'Morning routine for peak performance',
  'Sustainable living tips for beginners',
  'The future of electric vehicles',
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-900/50">
          <Sparkles size={28} className="text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Yahavi.AI</h1>
      <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
        Your AI-powered social media content generator.
        Enter a topic and get a ready-to-post viral package.
      </p>

      {/* Platform badges */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { Icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
          { Icon: Twitter,   label: 'Twitter/X', color: 'text-sky-400'  },
          { Icon: Linkedin,  label: 'LinkedIn',  color: 'text-blue-400' },
        ].map(({ Icon, label, color }) => (
          <div key={label} className={`flex items-center gap-1.5 text-xs ${color} bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-full`}>
            <Icon size={12} />
            {label}
          </div>
        ))}
      </div>

      {/* Suggestion chips */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {SUGGESTIONS.map(s => (
          <div
            key={s}
            className="text-xs text-gray-500 bg-white/3 border border-white/8 rounded-xl px-3 py-2.5 text-left leading-snug"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatArea({
  messages, isLoading,
  onClear, onRegenerate,
  sidebarOpen, onToggleSidebar,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#1a1a1a]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Open sidebar"
            >
              <PanelLeft size={16} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Social Content Generator</span>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
