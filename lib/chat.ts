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
    const response = await api.get('/api/chat/conversations');
    return response.data.data.conversations;
}

// Get specific conversation
export async function getConversation(id: string): Promise<FullConversation> {
    const response = await api.get(`/api/chat/conversations/${id}`);
    return response.data.data.conversation;
}

// Delete conversation
export async function deleteConversation(id: string): Promise<void> {
    await api.delete(`/api/chat/conversations/${id}`);
}

// Create new conversation
export async function createNewConversation(): Promise<{ conversationId: string }> {
    const response = await api.post('/api/chat/conversations/new');
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
