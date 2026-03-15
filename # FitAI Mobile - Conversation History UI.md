# FitAI Mobile - Conversation History UI

## PROBLEM STATEMENT

**Current Issue:**
- Chat opens with empty screen every time
- Previous conversations not visible
- Can't continue past conversations
- No way to start new chat

**Required:**
- Show list of past conversations
- Load and display message history
- "New Chat" button to start fresh
- Swipe to delete conversations

---

## UI LAYOUT

### Chat List Screen (New)

```
┌─────────────────────────┐
│  ← Chats          [+]   │
├─────────────────────────┤
│                         │
│  Today                  │
│  ┌───────────────────┐ │
│  │ Am I eating...    │ │
│  │ You're averaging..│ │
│  │ 8 messages • 2:30pm│ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ How many calor... │ │
│  │ Based on your...  │ │
│  │ 4 messages • 1:15pm│ │
│  └───────────────────┘ │
│                         │
│  Yesterday              │
│  ┌───────────────────┐ │
│  │ Workout advice    │ │
│  │ Try combining...  │ │
│  │ 6 messages        │ │
│  └───────────────────┘ │
│                         │
└─────────────────────────┘
```

### Chat Screen (Updated)

```
┌─────────────────────────┐
│  ← AI Fitness Coach     │
├─────────────────────────┤
│                         │
│  ┌─────────────────┐   │
│  │ Am I eating...  │   │
│  │ enough protein? │   │
│  └─────────────────┘   │
│                         │
│ ┌───────────────────┐  │
│ │ Looking at your   │  │
│ │ last 7 days...    │  │
│ └───────────────────┘  │
│                         │
├─────────────────────────┤
│ Ask me anything...  [→]│
└─────────────────────────┘
```

---

## FILE STRUCTURE

```
app/(tabs)/
├── chat.tsx                    # Main chat screen
├── chat-list.tsx               # NEW: Conversation list
components/chat/
├── ConversationList.tsx        # List component
├── ConversationItem.tsx        # Single conversation item
├── ChatMessages.tsx            # Message display
└── ChatInput.tsx               # Input component
lib/
└── chat.ts                     # API functions
```

---

## IMPLEMENTATION

### 1. API Client Functions

**File:** `lib/chat.ts`

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
  messageCount: number;
  lastMessage: {
    role: string;
    content: string;
    createdAt: string;
  } | null;
}

export interface FullConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

// Get all conversations
export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get('/api/conversations');
  return response.data.data.conversations;
}

// Get specific conversation
export async function getConversation(id: string): Promise<FullConversation> {
  const response = await api.get(`/api/conversations/${id}`);
  return response.data.data.conversation;
}

// Delete conversation
export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/api/conversations/${id}`);
}

// Create new conversation
export async function createNewConversation(): Promise<{ conversationId: string }> {
  const response = await api.post('/api/conversations/new');
  return response.data.data;
}

// Send message (existing - update this)
export async function sendChatMessage(
  message: string,
  conversationId?: string
): Promise<{ message: string; conversationId: string }> {
  const response = await api.post('/api/chat', {
    message,
    conversationId
  });
  return response.data.data;
}
```

---

### 2. Navigation Setup

**Update:** `app/(tabs)/_layout.tsx`

**Change chat tab to point to conversation list:**

```typescript
import { Tabs } from 'expo-router';
import { ChatbotIcon } from '@/components/ui/ChatbotIcon';

export default function TabLayout() {
  return (
    <Tabs>
      {/* Other tabs... */}
      
      <Tabs.Screen
        name="chat-list"  // Changed from "chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ focused }) => (
            <ChatbotIcon width={28} height={25} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

### 3. Conversation List Screen

**File:** `app/(tabs)/chat-list.tsx`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { getConversations, deleteConversation, Conversation } from '@/lib/chat';
import { ChatbotIcon } from '@/components/ui/ChatbotIcon';

export default function ChatListScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }

  function handleNewChat() {
    router.push('/chat?new=true');
  }

  function handleOpenChat(conversationId: string) {
    router.push(`/chat?id=${conversationId}`);
  }

  async function handleDeleteConversation(id: string) {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(id);
              setConversations(prev => prev.filter(c => c.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function groupByDate(conversations: Conversation[]) {
    const groups: { [key: string]: Conversation[] } = {};
    
    conversations.forEach(conv => {
      const dateLabel = formatDate(conv.updatedAt);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(conv);
    });
    
    return groups;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  const groupedConversations = groupByDate(conversations);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <Pressable onPress={handleNewChat} style={styles.newChatButton}>
          <Text style={styles.newChatButtonText}>+</Text>
        </Pressable>
      </View>

      {/* Empty State */}
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ChatbotIcon width={100} height={90} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Start chatting to see history here</Text>
          <Pressable style={styles.startChatButton} onPress={handleNewChat}>
            <Text style={styles.startChatButtonText}>Start New Chat</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={Object.keys(groupedConversations)}
          keyExtractor={(item) => item}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#a855f7" />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item: dateLabel }) => (
            <View>
              {/* Date Header */}
              <Text style={styles.dateHeader}>{dateLabel}</Text>
              
              {/* Conversations for this date */}
              {groupedConversations[dateLabel].map((conv) => (
                <Pressable
                  key={conv.id}
                  style={styles.conversationItem}
                  onPress={() => handleOpenChat(conv.id)}
                  onLongPress={() => handleDeleteConversation(conv.id)}
                >
                  <View style={styles.conversationContent}>
                    <Text style={styles.conversationTitle} numberOfLines={1}>
                      {conv.title}
                    </Text>
                    {conv.lastMessage && (
                      <Text style={styles.conversationPreview} numberOfLines={2}>
                        {conv.lastMessage.content}
                      </Text>
                    )}
                    <View style={styles.conversationMeta}>
                      <Text style={styles.messageCount}>
                        {conv.messageCount} messages
                      </Text>
                      <Text style={styles.timestamp}>
                        {formatTime(conv.updatedAt)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Chevron */}
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 85, 247, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e5e5e5',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1625',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e5e5e5',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  startChatButton: {
    marginTop: 24,
    backgroundColor: '#a855f7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  conversationItem: {
    backgroundColor: '#2a2235',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  chevron: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 8,
  },
});
```

---

### 4. Updated Chat Screen

**File:** `app/chat.tsx` (move outside tabs folder)

**Location:** `app/chat.tsx`

```typescript
import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { sendChatMessage, getConversation, Message } from '@/lib/chat';
import { ChatbotIcon } from '@/components/ui/ChatbotIcon';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [initialLoading, setInitialLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const conversationIdParam = params.id as string;
      const isNewChat = params.new === 'true';

      if (conversationIdParam && !isNewChat) {
        // Load existing conversation
        const conversation = await getConversation(conversationIdParam);
        setMessages(conversation.messages);
        setConversationId(conversation.id);
      } else {
        // New chat - start empty
        setMessages([]);
        setConversationId(undefined);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
    } finally {
      setInitialLoading(false);
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
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

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>AI Fitness Coach</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <ChatbotIcon width={100} height={90} />
          <Text style={styles.emptyTitle}>AI Fitness Coach</Text>
          <Text style={styles.emptySubtitle}>Ask me anything about your fitness journey!</Text>
          
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Try asking:</Text>
            <Pressable 
              style={styles.suggestionButton}
              onPress={() => setInputText("Am I eating enough protein?")}
            >
              <Text style={styles.suggestionText}>Am I eating enough protein?</Text>
            </Pressable>
            <Pressable 
              style={styles.suggestionButton}
              onPress={() => setInputText("How am I doing this week?")}
            >
              <Text style={styles.suggestionText}>How am I doing this week?</Text>
            </Pressable>
            <Pressable 
              style={styles.suggestionButton}
              onPress={() => setInputText("Should I work out today?")}
            >
              <Text style={styles.suggestionText}>Should I work out today?</Text>
            </Pressable>
          </View>
        </View>

        {/* Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
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
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>AI Fitness Coach</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={[
              styles.messageText,
              item.role === 'user' ? styles.userText : styles.aiText
            ]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {/* Input */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1625',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 85, 247, 0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#a855f7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e5e5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    lineHeight: 20,
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

## SWIPE TO DELETE (OPTIONAL ENHANCEMENT)

**Install:** `react-native-gesture-handler`

```bash
npx expo install react-native-gesture-handler
```

**Add swipeable delete:**

```typescript
import Swipeable from 'react-native-gesture-handler/Swipeable';

<Swipeable
  renderRightActions={() => (
    <Pressable 
      style={styles.deleteAction}
      onPress={() => handleDeleteConversation(conv.id)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  )}
>
  <Pressable style={styles.conversationItem}>
    {/* Conversation content */}
  </Pressable>
</Swipeable>
```

---

## SUCCESS CRITERIA

✅ Tab shows conversation list (not empty chat)  
✅ Tapping conversation loads message history  
✅ "+" button starts new chat  
✅ Long press shows delete confirmation  
✅ Conversations grouped by date (Today, Yesterday, etc.)  
✅ Shows message count and timestamp  
✅ Pull to refresh updates list  
✅ Back button returns to conversation list  
✅ Empty state when no conversations  
✅ Loading states work properly  

---

## TESTING

1. **Open chat tab** → Should show conversation list
2. **Tap conversation** → Should load messages
3. **Tap "+" button** → Should open empty chat
4. **Send message** → Should save to conversation
5. **Go back** → Should show in conversation list
6. **Long press conversation** → Should show delete option
7. **Delete conversation** → Should remove from list
8. **Pull down** → Should refresh list

---

Implement this to show conversation history on mobile!