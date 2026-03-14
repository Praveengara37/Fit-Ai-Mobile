import { ChatbotIcon } from '@/components/ui/ChatbotIcon';
import { Conversation, deleteConversation, getConversations } from '@/lib/chat';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

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
                                <Swipeable
                                    key={conv.id}
                                    renderRightActions={() => (
                                        <Pressable
                                            style={styles.deleteAction}
                                            onPress={() => handleDeleteConversation(conv.id)}
                                        >
                                            <Text style={styles.deleteText}>Delete</Text>
                                        </Pressable>
                                    )}
                                >
                                    <Pressable
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
                                </Swipeable>
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
    deleteAction: {
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 8,
        borderRadius: 12,
        marginLeft: 8,
    },
    deleteText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
