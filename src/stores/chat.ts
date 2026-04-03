import { defineStore } from 'pinia';
import { chatService } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as ChatMessage[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async sendMessage(content: string) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      
      this.messages.push(userMessage);
      this.loading = true;
      this.error = null;

      try {
        // Use direct call without timeout as requested
        const response: any = await chatService.sendMessage(content);

        if (!response?.data?.response) {
          throw new Error('MALFORMED_AI_RESPONSE');
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
        };
        this.messages.push(assistantMessage);
      } catch (err: any) {
        this.error = err.message || 'Error sending message';
        
        // Add a system message instead of just an error state for better visibility
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `> **CRITICAL_ERROR**: ${this.error}. Please check connectivity or refresh AI Node.`,
          timestamp: new Date().toISOString(),
        };
        this.messages.push(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    clearChat() {
      this.messages = [];
    },

    async fetchHistory() {
      this.loading = true;
      this.error = null;
      try {
        const response: any = await chatService.getHistory();
        if (response?.data?.history) {
          this.messages = response.data.history.map((msg: any) => ({
            id: msg.id,
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.message,
            timestamp: msg.created_at,
          }));
        }
      } catch (err: any) {
        this.error = err.message || 'Error fetching history';
      } finally {
        this.loading = false;
      }
    }
  },
});
