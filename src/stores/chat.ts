import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { chatService } from '../services/api';
import type { ChatMessage, ChatHistoryItem } from '@/types';

export const useChatStore = defineStore('chat', () => {
  const messages = shallowRef<ChatMessage[]>([]);
  const loading = shallowRef(false);
  const error = shallowRef<string | null>(null);

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    // Spread array to trigger shallowRef update
    messages.value = [...messages.value, userMessage];
    loading.value = true;
    error.value = null;

    try {
      const response = await chatService.sendMessage(content);

      if (!response?.data?.response) {
        throw new Error('MALFORMED_AI_RESPONSE');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };
      messages.value = [...messages.value, assistantMessage];
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error sending message';
      error.value = errMsg;
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `> **CRITICAL_ERROR**: ${errMsg}. Please check connectivity or refresh AI Node.`,
        timestamp: new Date().toISOString(),
      };
      messages.value = [...messages.value, errorMessage];
    } finally {
      loading.value = false;
    }
  }

  function clearChat() {
    messages.value = [];
  }

  async function fetchHistory() {
    loading.value = true;
    error.value = null;
    try {
      const response = await chatService.getHistory();
      if (response?.data?.history) {
        messages.value = response.data.history.map((msg: ChatHistoryItem) => ({
          id: msg.id,
          role: msg.role === 'ai' ? 'assistant' : msg.role as 'user' | 'assistant',
          content: msg.message,
          timestamp: msg.created_at,
        }));
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error fetching history';
    } finally {
      loading.value = false;
    }
  }

  return { messages, loading, error, sendMessage, clearChat, fetchHistory };
});
