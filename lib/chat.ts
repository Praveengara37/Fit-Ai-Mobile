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
    const response = await api.get(`/api/conversations/${id}`);
    return response.data.data.conversation;
}

export async function deleteConversation(id: string): Promise<void> {
    await api.delete(`/api/conversations/${id}`);
}
