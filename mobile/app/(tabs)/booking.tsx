import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

const villaImages = [
  require('../../assets/images/resort.jpg'),
  require('../../assets/images/react-logo.png'),
  require('../../assets/images/splash-icon.png'),
];
const prestigeImages = [
  require('../../assets/images/resort.jpg'),
  require('../../assets/images/partial-react-logo.png'),
  require('../../assets/images/icon.png'),
];

const { width } = Dimensions.get('window');
const API_BASE = 'http://localhost:5000/api';

function validateForm(form, startDate, endDate) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.address.trim()) errors.address = 'Address is required.';
  if (!form.numPersons || form.numPersons < 1) errors.numPersons = 'At least 1 person required.';
  form.persons.forEach((p, i) => {
    if (!p.name.trim()) errors[`person${i}_name`] = 'Name required.';
    if (!p.age || isNaN(Number(p.age))) errors[`person${i}_age`] = 'Valid age required.';
    if (!p.gender.trim()) errors[`person${i}_gender`] = 'Gender required.';
  });
  if (!startDate || !endDate || endDate <= startDate) errors.dates = 'Select valid dates.';
  return errors;
}

export default function BookingScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [roomType, setRoomType] = useState('');
  const [form, setForm] = useState({
    name: '',
    address: '',
    numPersons: 1,
    persons: [{ name: '', age: '', gender: '' }],
  });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [resultStatus, setResultStatus] = useState('');
  const [errors, setErrors] = useState({});

  const openBooking = (type) => {
    setRoomType(type);
    setModalVisible(true);
  };
  const closeBooking = () => {
    setModalVisible(false);
    setRoomType('');
    setForm({ name: '', address: '', numPersons: 1, persons: [{ name: '', age: '', gender: '' }] });
    setStartDate(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEndDate(tomorrow);
    setResultMsg('');
    setResultStatus('');
    setLoading(false);
    setErrors({});
  };
  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };
  const handleNumPersonsChange = (value) => {
    const num = parseInt(value, 10) || 1;
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

  const handleBooking = async () => {
    const validationErrors = validateForm(form, startDate, endDate);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    setResultMsg('');
    setResultStatus('');
    try {
      // Check availability
      const params = new URLSearchParams({
        type: roomType,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10),
      });
      const availRes = await fetch(`${API_BASE}/rooms/available?${params}`);
      const availData = await availRes.json();
      if (!availData.available || availData.available < 1) {
        setResultMsg('Sorry, no rooms of this type are available for the selected dates.');
        setResultStatus('fail');
        setLoading(false);
        return;
      }
      // Book room
      const bookRes = await fetch(`${API_BASE}/bookings/by-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          persons: form.persons,
          type: roomType,
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
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
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Book a Villa</Text>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {villaImages.map((img, idx) => (
          <ImageBackground key={idx} source={img} style={styles.imageBg} imageStyle={styles.imageBgImg}>
            <TouchableOpacity style={styles.bookBtn} onPress={() => openBooking('villa')}>
              <Text style={styles.bookBtnText}>Book Villa</Text>
            </TouchableOpacity>
          </ImageBackground>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>Book a Prestige Room</Text>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {prestigeImages.map((img, idx) => (
          <ImageBackground key={idx} source={img} style={styles.imageBg} imageStyle={styles.imageBgImg}>
            <TouchableOpacity style={styles.bookBtn} onPress={() => openBooking('prestige')}>
              <Text style={styles.bookBtnText}>Book Prestige Room</Text>
            </TouchableOpacity>
          </ImageBackground>
        ))}
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeBooking}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Book a {roomType === 'villa' ? 'Villa' : 'Prestige Room'}</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Your Name"
            value={form.name}
            onChangeText={v => handleFormChange('name', v)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Address"
            value={form.address}
            onChangeText={v => handleFormChange('address', v)}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          <TextInput
            style={[styles.input, errors.numPersons && styles.inputError]}
            placeholder="Number of Persons"
            keyboardType="numeric"
            value={form.numPersons.toString()}
            onChangeText={handleNumPersonsChange}
          />
          {errors.numPersons && <Text style={styles.errorText}>{errors.numPersons}</Text>}
          {form.persons.map((person, idx) => (
            <View key={idx} style={styles.personBlock}>
              <Text style={styles.personLabel}>Person {idx + 1}</Text>
              <TextInput
                style={[styles.input, errors[`person${idx}_name`] && styles.inputError]}
                placeholder="Name"
                value={person.name}
                onChangeText={v => handlePersonChange(idx, 'name', v)}
              />
              {errors[`person${idx}_name`] && <Text style={styles.errorText}>{errors[`person${idx}_name`]}</Text>}
              <TextInput
                style={[styles.input, errors[`person${idx}_age`] && styles.inputError]}
                placeholder="Age"
                keyboardType="numeric"
                value={person.age}
                onChangeText={v => handlePersonChange(idx, 'age', v)}
              />
              {errors[`person${idx}_age`] && <Text style={styles.errorText}>{errors[`person${idx}_age`]}</Text>}
              <TextInput
                style={[styles.input, errors[`person${idx}_gender`] && styles.inputError]}
                placeholder="Gender"
                value={person.gender}
                onChangeText={v => handlePersonChange(idx, 'gender', v)}
              />
              {errors[`person${idx}_gender`] && <Text style={styles.errorText}>{errors[`person${idx}_gender`]}</Text>}
            </View>
          ))}
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Start Date:</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateBtn}>
              <Text>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
                minimumDate={new Date()}
              />
            )}
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>End Date:</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateBtn}>
              <Text>{endDate.toDateString()}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
                minimumDate={startDate}
              />
            )}
          </View>
          {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}
          {resultMsg ? (
            resultStatus === 'success' ? (
              <View style={styles.successBox}>
                <Text style={styles.successCheck}>✓</Text>
                <Text style={{ color: 'green', fontWeight: 'bold', textAlign: 'center', marginVertical: 8 }}>{resultMsg}</Text>
              </View>
            ) : (
              <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center', marginVertical: 12 }}>{resultMsg}</Text>
            )
          ) : null}
          {loading ? (
            <ActivityIndicator size="large" color="#0a7ea4" style={{ marginVertical: 12 }} />
          ) : (
            <View style={styles.modalBtnRow}>
              <Button title="Cancel" onPress={closeBooking} color="#888" />
              <Button title="Book Now" onPress={handleBooking} color="#0a7ea4" disabled={Object.keys(errors).length > 0} />
            </View>
          )}
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
    textAlign: 'center',
    color: '#0a7ea4',
  },
  carousel: {
    marginBottom: 24,
  },
  imageBg: {
    width: width - 40,
    height: 220,
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageBgImg: {
    resizeMode: 'cover',
  },
  bookBtn: {
    backgroundColor: '#0a7ea4cc',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 24,
    backgroundColor: '#f5f7fa',
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#0a7ea4',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b0c4d6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  personBlock: {
    backgroundColor: '#eaf6fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  personLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  dateBtn: {
    backgroundColor: '#eaf6fa',
    borderRadius: 8,
    padding: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
  successBox: {
    alignItems: 'center',
    marginVertical: 12,
  },
  successCheck: {
    fontSize: 36,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 2,
  },
}); 