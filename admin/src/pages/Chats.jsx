import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

export default function Chats({ onChange }) {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  const loadSessions = () => api.chats().then(setSessions);
  const loadMessages = (sid) => api.chatMessages(sid).then(setMessages);

  useEffect(() => {
    loadSessions();
    const t = setInterval(() => {
      loadSessions();
      if (active) loadMessages(active);
    }, 5000);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const openChat = (sid) => { setActive(sid); loadMessages(sid); };

  const send = async () => {
    const body = text.trim();
    if (!body || !active) return;
    setBusy(true);
    try {
      await api.reply(active, body);
      setText('');
      await loadMessages(active);
      loadSessions(); onChange?.();
    } finally { setBusy(false); }
  };

  const fmt = (d) => new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

  return (
    <div className="h-[70vh] md:h-[calc(100vh-12rem)] flex gap-gutter">
      {/* Danh sách hội thoại — trên mobile ẩn khi đang mở 1 chat */}
      <div className={'w-full md:w-72 shrink-0 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex-col ' +
        (active ? 'hidden md:flex' : 'flex')}>
        <div className="px-4 py-3 border-b border-outline-variant/20 font-headline-md text-headline-md">
          Hội thoại <span className="text-on-surface-variant">({sessions.length})</span>
        </div>
        <div className="flex-1 overflow-auto no-scrollbar">
          {sessions.length === 0 && (
            <p className="p-4 font-body-md text-body-md text-on-surface-variant">Chưa có tin nhắn nào từ khách.</p>
          )}
          {sessions.map((s) => (
            <button key={s.sessionId} onClick={() => openChat(s.sessionId)}
              className={'w-full text-left px-4 py-3 border-b border-outline-variant/10 hover:bg-surface-container-low/70 transition-colors ' +
                (active === s.sessionId ? 'bg-primary-container/15' : '')}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-label-lg text-label-lg font-bold truncate">Khách {s.sessionId.slice(0, 8)}</span>
                {s.needReply && <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-error" title="Cần trả lời" />}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant truncate mt-0.5">
                {s.last.sender === 'user' ? '' : 'Bạn: '}{s.last.body}
              </p>
              <p className="font-label-sm text-label-sm text-outline mt-0.5">{fmt(s.last.createdAt)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Khung chat */}
      <div className={'flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm flex-col min-w-0 ' +
        (active ? 'flex' : 'hidden md:flex')}>
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[44px] mb-2 text-outline">forum</span>
            <p className="font-body-md text-body-md">Chọn một hội thoại để trả lời khách.</p>
          </div>
        ) : (
          <>
            <div className="px-3 md:px-4 py-2.5 border-b border-outline-variant/20 flex items-center gap-2">
              <button onClick={() => setActive(null)} className="md:hidden p-1.5 -ml-1 rounded-full text-on-surface-variant hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] icon-fill">person</span>
              </div>
              <span className="font-body-md text-body-md font-bold">Khách {active.slice(0, 8)}</span>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2.5 bg-surface-container-low/40">
              {messages.map((m) => (
                <div key={m.id} className={'flex ' + (m.sender === 'user' ? 'justify-start' : 'justify-end')}>
                  <div className={'max-w-[78%] md:max-w-[65%] rounded-2xl px-3.5 py-2 font-body-md text-body-md whitespace-pre-wrap ' +
                    (m.sender === 'user'
                      ? 'bg-surface-container-lowest border border-outline-variant/40 rounded-bl-sm'
                      : 'bg-primary text-on-primary rounded-br-sm')}>
                    {m.body}
                    <div className={'font-label-sm text-label-sm mt-1 ' + (m.sender === 'user' ? 'text-outline' : 'text-on-primary/70')}>
                      {fmt(m.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-outline-variant/20 flex gap-2 items-end">
              <textarea
                value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Nhập trả lời… (Enter gửi, Shift+Enter xuống dòng)"
                rows={1}
                className="flex-1 resize-none rounded-2xl border-outline-variant bg-surface px-4 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-primary"
              />
              <button onClick={send} disabled={busy || !text.trim()}
                className="w-11 h-11 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px] icon-fill">send</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
