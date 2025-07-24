import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

const LLM_API_URL = 'https://api.openai.com/v1/chat/completions'; // Replace with your endpoint if needed
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // <-- Replace this with your real key later

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your resort assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollViewRef = useRef(null);

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
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <ScrollView
          style={styles.messages}
          contentContainerStyle={{ padding: 16 }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, idx) => (
            <View key={idx} style={[styles.msgBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.msgText}>{msg.content}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.msgBubble, styles.aiBubble]}>
              <ActivityIndicator color="#0a7ea4" />
            </View>
          )}
        </ScrollView>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
            editable={!loading}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  messages: {
    flex: 1,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#0a7ea4',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#eaf6fa',
    alignSelf: 'flex-start',
  },
  msgText: {
    color: '#222',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b0c4d6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 6,
  },
}); 