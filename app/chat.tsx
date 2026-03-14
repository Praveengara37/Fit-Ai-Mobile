import { ChatbotIcon } from '@/components/ui/ChatbotIcon';
import { getConversation, Message, sendChatMessage } from '@/lib/chat';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
