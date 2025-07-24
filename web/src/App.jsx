import resortImg from './assets/resort.jpg';
import './App.css';
import { useState, useRef } from 'react';
import Booking from './Booking.jsx';
import reactLogo from './assets/react.svg';

const roomImages = [resortImg, reactLogo];
const LLM_API_URL = 'https://api.openai.com/v1/chat/completions'; // Replace with your endpoint if needed
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // <-- Replace this with your real key later

function ChatModal({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your resort assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setError('');
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(LLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error('LLM API error');
      const data = await res.json();
      const aiMsg = data.choices?.[0]?.message?.content || 'Sorry, I could not understand.';
      setMessages([...newMessages, { role: 'assistant', content: aiMsg }]);
    } catch (err) {
      setError('Failed to get response from AI.');
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content chat-modal-content">
        <button className="close-modal" onClick={onClose}>&times;</button>
        <div className="chat-messages" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.role === 'user' ? 'chat-bubble user' : 'chat-bubble ai'}>
              {msg.content}
            </div>
          ))}
          {loading && <div className="chat-bubble ai"><span className="chat-loading">...</span></div>}
        </div>
        {error && <div className="chat-error">{error}</div>}
        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            disabled={loading}
          />
          <button className="chat-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showChat, setShowChat] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  useState(() => {
    const interval = setInterval(() => setCarouselIdx((prev) => (prev + 1) % roomImages.length), 3500);
    return () => clearInterval(interval);
  }, []);

  if (showBooking) return <Booking />;

  return (
    <div className="resort-app-home">
      <header className="hero-section">
        <img src={resortImg} alt="Resort" className="hero-image" />
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to Paradise Resort</h1>
          <p className="hero-subtitle">Experience luxury, comfort, and adventure by the sea</p>
        </div>
      </header>
      <section className="carousel-section">
        <img src={roomImages[carouselIdx]} alt="Room" className="carousel-bg-img" />
        <div className="carousel-btns-overlay">
          <button className="book-room-btn" onClick={() => setShowBooking(true)}>
            Book Room
          </button>
          <button className="chat-btn" onClick={() => setShowChat(true)}>
            Chat with us
          </button>
        </div>
      </section>
      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
    </div>
  );
}

export default App;
