import { useState } from 'react';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';

const themes = { Messages: 'mock-chat--messages', WhatsApp: 'mock-chat--whatsapp', Instagram: 'mock-chat--instagram' };

export default function FakeChatGeneratorTool() {
  const [platform, setPlatform] = useState('Messages');
  const [contact, setContact] = useState('Alex');
  const [draft, setDraft] = useState('Hey! This is a sample conversation.');
  const [messages, setMessages] = useState([{ id: 1, side: 'them', text: 'Hi! This is a fictional chat mockup.' }, { id: 2, side: 'me', text: 'Looks good for a presentation!' }]);

  function addMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: Date.now(), side: 'me', text }]);
    setDraft('');
  }

  return <div className="tool-editor tool-form-stack">
    <div className="mockup-notice">Fictional mockup · Not a real conversation</div>
    <div className="tool-form-grid">
      <section className="tool-form-section"><div className="tool-editor-label"><label htmlFor="mock-platform">Chat style</label></div><select id="mock-platform" className="tool-value-input" value={platform} onChange={(event) => setPlatform(event.target.value)}>{Object.keys(themes).map((item) => <option key={item}>{item}</option>)}</select></section>
      <section className="tool-form-section"><div className="tool-editor-label"><label htmlFor="mock-contact">Display name</label></div><input id="mock-contact" className="tool-value-input" value={contact} maxLength={32} onChange={(event) => setContact(event.target.value)} /></section>
    </div>
    <div className={`mock-chat ${themes[platform]}`} aria-label={`${platform} fictional chat preview`}>
      <header><span className="mock-avatar" aria-hidden="true">{(contact.trim()[0] || '?').toUpperCase()}</span><strong>{contact || 'Contact'}</strong></header>
      <div className="mock-chat-messages">{messages.map((item) => <div className={`mock-message mock-message--${item.side}`} key={item.id}>{item.text}</div>)}</div>
      <div className="mock-watermark">FICTIONAL MOCKUP</div>
    </div>
    <form className="mock-chat-compose" onSubmit={addMessage}><label className="visually-hidden" htmlFor="mock-message">New mock message</label><input id="mock-message" className="tool-value-input" value={draft} maxLength={240} onChange={(event) => setDraft(event.target.value)} placeholder="Write a sample message" /><button className="case-action" type="submit" disabled={!draft.trim()}><Plus size={15} aria-hidden="true" /> Add message</button></form>
    <div className="tool-action-row"><p className="tool-inline-status">Use for clearly labeled demos and storyboards.</p><button className="case-action" type="button" onClick={() => setMessages([])}><Trash2 size={14} aria-hidden="true" /> Clear chat</button></div>
  </div>;
}
