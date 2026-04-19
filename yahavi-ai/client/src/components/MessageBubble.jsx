import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CopyBtn({ text, size = 13 }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };
  return (
    <button
      onClick={handle}
      title="Copy"
      className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
    >
      {copied
        ? <Check size={size} className="text-green-400" />
        : <Copy size={size} className="text-gray-500 hover:text-gray-300" />
      }
    </button>
  );
}

function Section({ label, icon, content, accent, delay }) {
  return (
    <div className={`animate-fadeInUp section-delay-${delay}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${accent}`}>
          {icon} {label}
        </span>
        <CopyBtn text={content} />
      </div>
      <p className="text-sm text-gray-200 leading-relaxed bg-black/25 rounded-xl px-3.5 py-2.5 border border-white/5">
        {content}
      </p>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex gap-1">
        {[0, 150, 300].map(d => (
          <span
            key={d}
            className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">Generating content…</span>
    </div>
  );
}

function AIContent({ content }) {
  if (content === null) return <TypingDots />;

  if (content?.error) {
    return (
      <div className="flex items-start gap-2 text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded-xl px-3.5 py-3">
        <span className="mt-0.5">⚠</span>
        <span>{content.error}</span>
      </div>
    );
  }

  const fullText = [
    content.hook     ? `Hook:\n${content.hook}`     : '',
    content.caption  ? `Caption:\n${content.caption}` : '',
    content.cta      ? `CTA:\n${content.cta}`        : '',
    content.hashtags?.length ? `Hashtags:\n${content.hashtags.join(' ')}` : '',
    content.variations?.length
      ? `Variations:\n${content.variations.map((v, i) => `${i + 1}. ${v}`).join('\n')}`
      : '',
  ].filter(Boolean).join('\n\n');

  return (
    <div className="space-y-3">
      {/* Copy all */}
      <div className="flex justify-end -mb-1">
        <span className="text-xs text-gray-600 mr-1">Copy all</span>
        <CopyBtn text={fullText} />
      </div>

      {content.hook && (
        <Section label="Hook" icon="🪝" content={content.hook} accent="text-yellow-400" delay={1} />
      )}
      {content.caption && (
        <Section label="Caption" icon="✍️" content={content.caption} accent="text-sky-400" delay={2} />
      )}
      {content.cta && (
        <Section label="Call to Action" icon="📣" content={content.cta} accent="text-emerald-400" delay={3} />
      )}

      {content.hashtags?.length > 0 && (
        <div className={`animate-fadeInUp section-delay-4`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-purple-400"># Hashtags</span>
            <CopyBtn text={content.hashtags.join(' ')} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {content.hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/40 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {content.variations?.length > 0 && (
        <div className={`animate-fadeInUp section-delay-5`}>
          <div className="mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-pink-400">🔄 Variations</span>
          </div>
          <div className="space-y-2">
            {content.variations.map((v, i) => (
              <div key={i} className="flex items-start gap-2 bg-black/25 border border-white/5 rounded-xl px-3.5 py-2.5">
                <span className="text-xs font-bold text-pink-400 shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-sm text-gray-200 leading-relaxed flex-1">{v}</p>
                <CopyBtn text={v} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-5">
        <div className="max-w-xl">
          <div className="bg-violet-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-lg shadow-violet-900/30">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1.5 px-1">
            {message.platform && (
              <span className="text-[11px] text-gray-600">
                {message.platform} · {message.tone}
              </span>
            )}
            <span className="text-[11px] text-gray-600">{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-5">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow shrink-0">
            <span className="text-[11px] font-bold text-white">Y</span>
          </div>
          <span className="text-xs font-semibold text-gray-400">Yahavi.AI</span>
          <span className="text-[11px] text-gray-600">{formatTime(message.timestamp)}</span>
        </div>
        <div className="bg-gray-900 border border-white/5 rounded-2xl rounded-tl-md px-4 py-4 shadow-lg">
          <AIContent content={message.content} />
        </div>
      </div>
    </div>
  );
}
