# FitAI AI Chatbot — Mobile PRD(React Native + Expo)

## Overview

Build the chat screen for the AI fitness coach in the FitAI mobile app.Connects to the backend `/api/chat` endpoint.Renders a conversational interface with suggestion prompts, message bubbles, keyboard - avoiding input, and loading states.

---

## Files to Create

### 1. `lib/chat.ts`

    ```typescript
import api from './api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

export async function sendChatMessage(
  message: string,
  conversationId?: string
): Promise<{ message: string; conversationId: string }> {
  const response = await api.post('/api/chat', { message, conversationId });
  return response.data.data;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get('/api/conversations');
  return response.data.data.conversations;
}

export async function getConversation(id: string): Promise<Conversation> {
  const response = await api.get(`/ api / conversations / ${ id } `);
  return response.data.data.conversation;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/ api / conversations / ${ id } `);
}
```

---

### 2. `app/(tabs)/chat.tsx`

    ```tsx
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { sendChatMessage, Message } from '@/lib/chat';
import { ChatbotIcon } from '@/components/ui/ChatbotIcon';

const SUGGESTIONS = [
  "Am I eating enough protein?",
  "How am I doing this week?",
  "Should I work out today?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const result = await sendChatMessage(inputText, conversationId);
      setConversationId(result.conversationId);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Chat error:', error);
      if (error.response?.status === 429) {
        Alert.alert('Limit Reached', error.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Empty / welcome state
  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ChatbotIcon width={100} height={90} />
        <Text style={styles.emptyTitle}>AI Fitness Coach</Text>
        <Text style={styles.emptySubtitle}>
          Ask me anything about your fitness journey!
        </Text>

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try asking:</Text>
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              style={styles.suggestionButton}
              onPress={() => setInputText(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>

        {/* Input bar always visible */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble,
          ]}>
            <Text style={[
              styles.messageText,
              item.role === 'user' ? styles.userText : styles.aiText,
            ]}>
              {item.content}
            </Text>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <ActivityIndicator color="#a855f7" size="small" />
            </View>
          ) : null
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
          editable={!loading}
        />
        <Pressable
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>→</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1625',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e5e5e5',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginTop: 40,
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  suggestionButton: {
    backgroundColor: '#2a2235',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  suggestionText: {
    color: '#a855f7',
    fontSize: 15,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#a855f7',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2235',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#e5e5e5',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#2a2235',
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1625',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#e5e5e5',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

---

## Tab Icon

Add the chat tab to your `app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen
  name="chat"
  options={{
    title: 'AI Coach',
    tabBarIcon: ({ color }) => <ChatbotIcon color={color} width={24} height={24} />,
  }}
/>
```

---

## Testing Checklist

    - [] Chat tab appears in bottom navigation
        - [] Empty state loads with icon and suggestions
            - [] Tapping a suggestion populates the input field
                - [] Sending a message shows user bubble immediately
                    - [] Loading spinner shows in AI bubble while waiting
                        - [] AI response appears correctly
                            - [] Keyboard does not cover the input bar(iOS + Android)
                                - [] Auto - scroll to latest message after AI response
                                    - [] Quota exceeded shows `Alert` with readable message
                                        - [] Network error shows generic`Alert`
                                            - [] Input is disabled while request is in -flight