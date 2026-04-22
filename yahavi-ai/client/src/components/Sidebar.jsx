import { PenSquare, MessageSquare, ChevronLeft, Sun, Moon, Sparkles, Trash2 } from 'lucide-react';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Sidebar({
  open, chats, activeChatId,
  onNewChat, onSelectChat, onDeleteChat,
  onToggle, darkMode, onToggleDark,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col w-64 shrink-0
          bg-gray-950 border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full'}
          ${!open ? 'lg:w-0 lg:overflow-hidden lg:border-0' : ''}
        `}
      >
        {/* Logo + collapse */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">Yahavi.AI</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* New Content button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
              bg-violet-600 hover:bg-violet-500 active:bg-violet-700
              text-white text-sm font-medium
              transition-colors shadow-lg shadow-violet-900/40"
          >
            <PenSquare size={14} />
            New Content
          </button>
        </div>

        {/* History list */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Sparkles size={22} className="text-gray-700 mb-2" />
              <p className="text-xs text-gray-600">No content yet.</p>
              <p className="text-xs text-gray-600">Hit "New Content" to start!</p>
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                className={`
                  group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-colors text-sm
                  ${chat.id === activeChatId
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                `}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare size={13} className="mt-0.5 shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium leading-snug">{chat.title || 'New Content'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{timeAgo(chat.createdAt)}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-all mt-0.5"
                  aria-label="Delete chat"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={onToggleDark}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
              text-gray-400 hover:text-white hover:bg-white/5
              transition-colors text-sm"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>
    </>
  );
}
