import { ChatbotIcon } from '@/components/ui/ChatbotIcon';
import { Colors } from '@/constants/Colors';
import { Message, sendChatMessage } from '@/lib/chat';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

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
                        placeholderTextColor={Colors.gray[400]}
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
                            <ActivityIndicator color={Colors.purple} size="small" />
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
                    placeholderTextColor={Colors.gray[400]}
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
        backgroundColor: Colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.background,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.foreground,
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.gray[400],
        marginTop: 8,
        textAlign: 'center',
    },
    suggestionsContainer: {
        marginTop: 40,
        width: '100%',
    },
    suggestionsTitle: {
        fontSize: 14,
        color: Colors.gray[400],
        marginBottom: 12,
    },
    suggestionButton: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    suggestionText: {
        color: Colors.purple,
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
        backgroundColor: Colors.purple,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: Colors.foreground,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: Colors.card,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: Colors.foreground,
        fontSize: 15,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.purple,
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
