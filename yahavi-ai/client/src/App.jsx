import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputBar from './components/InputBar';
import useChat from './hooks/useChat';

export default function App() {
  const [darkMode,     setDarkMode]     = useState(true);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [platform,     setPlatform]     = useState('Instagram');
  const [tone,         setTone]         = useState('Professional');
  const [provider,     setProvider]     = useState('OpenAI');
  const [apiKey,       setApiKey]       = useState('');

  const {
    chats, activeChatId, messages, isLoading,
    sendMessage, newChat, selectChat, clearChat, deleteChat, regenerateLast,
  } = useChat();

  const handleSend = topic => {
    sendMessage(topic, platform, tone, provider, apiKey);
  };

  const handleRegenerate = () => {
    regenerateLast(platform, tone, provider, apiKey);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-[#1a1a1a] text-gray-100">
        <Sidebar
          open={sidebarOpen}
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={newChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          onToggle={() => setSidebarOpen(v => !v)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(v => !v)}
        />

        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            onClear={clearChat}
            onRegenerate={handleRegenerate}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(v => !v)}
          />
          <InputBar
            onSend={handleSend}
            isLoading={isLoading}
            platform={platform}
            tone={tone}
            provider={provider}
            apiKey={apiKey}
            onPlatformChange={setPlatform}
            onToneChange={setTone}
            onProviderChange={setProvider}
            onApiKeyChange={setApiKey}
          />
        </div>
      </div>
    </div>
  );
}
