import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TopAppBar from '../components/TopAppBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { api, API_URL } from '../api/client.js';

const SESSION_ID = 'demo-session';
const AGENT_AVATAR = `${API_URL}/uploads/products/agent.jpg`;

export default function Support() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const load = () => api.getMessages(SESSION_ID).then(setMessages).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setText('');
    setSending(true);
    // optimistisch anzeigen
    setMessages((m) => [...m, { id: 'tmp', sender: 'user', body }]);
    try {
      const res = await api.sendMessage(SESSION_ID, body);
      setMessages(res.messages);
    } catch {
      load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative overflow-hidden">
      <TopAppBar />

      {/* Agent-Status */}
      <div className="bg-surface-container-lowest px-container-margin py-stack-md flex items-center gap-stack-md border-b border-outline-variant/20 shadow-sm z-40 relative">
        <div className="relative">
          <img alt="Agent" className="w-12 h-12 rounded-full object-cover border-2 border-surface-container-low shadow-sm" src={AGENT_AVATAR} />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary border-2 border-surface-container-lowest rounded-full" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-body-lg text-body-lg font-semibold text-on-surface">{t('support.agent')}</h1>
          <p className="font-label-sm text-label-sm text-outline flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">support_agent</span>
            {t('support.online')}
          </p>
        </div>
      </div>

      {/* Chat-Verlauf */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto relative pb-[150px]">
        <div className="absolute inset-0 bg-heritage-pattern" />
        <div className="px-container-margin py-stack-lg flex flex-col gap-stack-md relative z-10">
          <div className="text-center font-label-sm text-label-sm text-outline-variant my-2">{t('support.today')}, 10:42</div>
          {messages.map((m, idx) => (
            <Bubble key={m.id ?? idx} m={m} />
          ))}
        </div>
      </main>

      {/* Eingabe */}
      <div className="fixed bottom-[80px] left-0 w-full bg-surface-container-lowest px-container-margin py-stack-md border-t border-outline-variant/20 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-40">
        <div className="flex items-center gap-stack-sm bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface transition-colors">
          <button className="text-outline hover:text-primary transition-colors flex-shrink-0 p-1">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant py-2"
            placeholder={t('support.inputPlaceholder')}
            type="text"
          />
          <button onClick={send} disabled={sending} className="bg-primary text-on-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors shadow-sm ml-1 disabled:opacity-50">
            <span className="material-symbols-outlined text-[16px] icon-fill">send</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Bubble({ m }) {
  const { t } = useTranslation();
  const isUser = m.sender === 'user';
  if (isUser) {
    return (
      <div className="flex gap-2 max-w-[85%] self-end items-end">
        <div className="bg-primary-container text-on-primary-container p-stack-md rounded-2xl rounded-br-none shadow-sm text-body-md leading-relaxed">
          {m.body}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2 max-w-[85%] items-end">
      <img alt="Agent" className="w-6 h-6 rounded-full object-cover flex-shrink-0" src={AGENT_AVATAR} />
      <div className="bg-surface-container-high text-on-surface p-stack-md rounded-2xl rounded-bl-none shadow-sm text-body-md leading-relaxed">
        {m.body}
      </div>
    </div>
  );
}
