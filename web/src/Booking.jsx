import './App.css';
import { useState } from 'react';
import resortImg from './assets/resort.jpg';
import reactLogo from './assets/react.svg';

const roomImages = [resortImg, reactLogo];

export default function Booking() {
  const [current, setCurrent] = useState(0);
  const [form, setForm] = useState({
    roomType: '',
    name: '',
    address: '',
    numPersons: 1,
    persons: [{ name: '', age: '', gender: '' }],
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [resultStatus, setResultStatus] = useState('');

  // Carousel auto-slide
  useState(() => {
    const interval = setInterval(() => setCurrent((prev) => (prev + 1) % roomImages.length), 3500);
    return () => clearInterval(interval);
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleNumPersonsChange = (e) => {
    const num = parseInt(e.target.value, 10) || 1;
    let persons = [...form.persons];
    if (num > persons.length) {
      for (let i = persons.length; i < num; i++) persons.push({ name: '', age: '', gender: '' });
    } else {
      persons = persons.slice(0, num);
    }
    setForm({ ...form, numPersons: num, persons });
  };
  const handlePersonChange = (idx, field, value) => {
    const persons = [...form.persons];
    persons[idx][field] = value;
    setForm({ ...form, persons });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg('');
    setResultStatus('');
    try {
      // 1. Check availability
      const params = new URLSearchParams({
        type: form.roomType,
        start_date: form.startDate,
        end_date: form.endDate,
      });
      const availRes = await fetch(`/api/rooms/available?${params}`);
      const availData = await availRes.json();
      if (!availData.available || availData.available < 1) {
        setResultMsg('Sorry, no rooms of this type are available for the selected dates.');
        setResultStatus('fail');
        setLoading(false);
        return;
      }
      // 2. Book room
      const bookRes = await fetch('/api/bookings/by-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          persons: form.persons,
          type: form.roomType,
          start_date: form.startDate,
          end_date: form.endDate,
        }),
      });
      if (bookRes.ok) {
        setResultMsg('Your booking is confirmed!');
        setResultStatus('success');
      } else {
        const data = await bookRes.json();
        setResultMsg(data.error || 'Booking failed.');
        setResultStatus('fail');
      }
    } catch (err) {
      setResultMsg('Booking failed. Please try again.');
      setResultStatus('fail');
    }
    setLoading(false);
  };

  return (
    <div className="booking-bg-carousel" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <img src={roomImages[current]} alt="Room" className="booking-bg-img" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
      <div className="booking-form-card" style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: 400,
        margin: '0 auto',
        marginTop: '7vh',
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 18,
        boxShadow: '0 8px 32px #0002',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ marginBottom: 18, color: '#0a7ea4', fontWeight: 700 }}>Book Your Stay</h2>
        <form className="booking-form" style={{ width: '100%' }} onSubmit={handleBooking}>
          <label>
            Room Type
            <select name="roomType" value={form.roomType} onChange={handleFormChange} required>
              <option value="">Select</option>
              <option value="villa">Villa</option>
              <option value="prestige">Prestige Room</option>
            </select>
          </label>
          <label>
            Start Date
            <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} required />
          </label>
          <label>
            End Date
            <input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} required />
          </label>
          <label>
            Your Name
            <input name="name" value={form.name} onChange={handleFormChange} required />
          </label>
          <label>
            Address
            <input name="address" value={form.address} onChange={handleFormChange} required />
          </label>
          <label>
            Number of Persons
            <input type="number" name="numPersons" min="1" max="10" value={form.numPersons} onChange={handleNumPersonsChange} required />
          </label>
          {form.persons.map((person, idx) => (
            <div className="person-details" key={idx}>
              <label>
                Person {idx+1} Name
                <input value={person.name} onChange={e => handlePersonChange(idx, 'name', e.target.value)} required />
              </label>
              <label>
                Age
                <input type="number" min="0" value={person.age} onChange={e => handlePersonChange(idx, 'age', e.target.value)} required />
              </label>
              <label>
                Gender
                <select value={person.gender} onChange={e => handlePersonChange(idx, 'gender', e.target.value)} required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
          ))}
          <button className="book-room-btn" type="submit" style={{marginTop: '1rem', width: '100%'}} disabled={loading}>
            {loading ? 'Booking...' : 'Book Now'}
          </button>
        </form>
        {resultMsg && (
          <div style={{ marginTop: 18, color: resultStatus === 'success' ? 'green' : 'red', fontWeight: 'bold', textAlign: 'center' }}>{resultMsg}</div>
        )}
      </div>
    </div>
  );
} 