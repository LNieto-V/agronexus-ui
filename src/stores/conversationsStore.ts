import { defineStore } from 'pinia';
import { ref } from 'vue';
import { conversationService, chatService } from '@/services/api';
import type { Conversation, ChatMessage, ChatHistoryItem } from '@/types';

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref<Conversation[]>([]);
  const activeSessionId = ref<string | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  // --- Actions ---

  async function fetchConversations() {
    try {
      const response = await conversationService.getConversations();
      conversations.value = response.data;
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }

  async function createConversation(title = 'Nueva conversación') {
    try {
      const response = await conversationService.createConversation(title);
      const newConv = response.data;
      conversations.value.unshift(newConv);
      await selectConversation(newConv.id);
      return newConv;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  }

  async function selectConversation(sessionId: string) {
    // Only guard if we already have the messages loaded for this session
    if (activeSessionId.value === sessionId && messages.value.length > 0) return;
    
    activeSessionId.value = sessionId;
    messages.value = [];
    isLoading.value = true;
    error.value = null;

    try {
      const response = await chatService.getHistory(sessionId);
      
      // Robust parsing: check for a 'history' key or a direct array
      const historyItems = 
        (response.data as any).history || 
        (Array.isArray(response.data) ? response.data : []);

      messages.value = historyItems.map((msg: ChatHistoryItem) => {
        // SQL schema confirmation: 'user' or 'ai'
        // But we add fallbacks for 'bot' and 'assistant' just in case
        let mappedRole: 'user' | 'ai' = 'user';
        const role = msg.role.toLowerCase();
        if (role === 'ai' || role === 'bot' || role === 'assistant') {
          mappedRole = 'ai';
        }

        return {
          id: msg.id,
          role: mappedRole,
          message: msg.message,
          created_at: msg.created_at,
          session_id: sessionId,
        };
      });
    } catch (err) {
      console.error('Error loading conversation history:', err);
      error.value = 'Error al cargar el historial. Reintenta pronto.';
    } finally {
      isLoading.value = false;
    }
  }

  async function renameConversation(sessionId: string, title: string) {
    try {
      await conversationService.renameConversation(sessionId, title);
      const conv = conversations.value.find(c => c.id === sessionId);
      if (conv) conv.title = title;
    } catch (err) {
      console.error('Error renaming conversation:', err);
    }
  }

  async function deleteConversation(sessionId: string) {
    try {
      await conversationService.deleteConversation(sessionId);
      conversations.value = conversations.value.filter(c => c.id !== sessionId);
      if (activeSessionId.value === sessionId) {
        activeSessionId.value = null;
        messages.value = [];
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  }

  function clearActiveSession() {
    activeSessionId.value = null;
    messages.value = [];
    error.value = null;
  }

  async function sendMessage(text: string) {
    // Auto-create session with smart title if none exists
    if (!activeSessionId.value) {
      try {
        const autoTitle = text.slice(0, 30).trim() + (text.length > 30 ? '...' : '');
        await createConversation(autoTitle);
      } catch (err) {
        console.error('Failed to auto-create conversation:', err);
      }
    }

    // Optimistic UI — add user message immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      message: text,
      created_at: new Date().toISOString(),
      session_id: activeSessionId.value,
    };
    messages.value = [...messages.value, userMsg];
    isSending.value = true;
    error.value = null;

    try {
      const response = await chatService.sendMessage(text, activeSessionId.value);

      // If backend returned a session_id and we didn't have one, adopt it
      if (response.data.session_id && !activeSessionId.value) {
        activeSessionId.value = response.data.session_id;
        await fetchConversations();
      }

      // Add AI response
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        message: response.data.response,
        created_at: new Date().toISOString(),
        session_id: activeSessionId.value,
      };
      messages.value = [...messages.value, aiMsg];

      // Update sidebar timestamp so the active session bubbles to the top
      if (activeSessionId.value) {
        const conv = conversations.value.find(c => c.id === activeSessionId.value);
        if (conv) {
          conv.updated_at = new Date().toISOString();
          conversations.value.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        }
      }

      return response.data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error al enviar el mensaje';
      error.value = errMsg;

      // Show error as AI bubble so the user gets visual feedback
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'ai',
        message: `> **Error**: ${errMsg}. Revisa tu conexión o intenta de nuevo.`,
        created_at: new Date().toISOString(),
        session_id: activeSessionId.value,
      };
      messages.value = [...messages.value, errorMessage];
    } finally {
      isSending.value = false;
    }
  }

  return {
    conversations,
    activeSessionId,
    messages,
    isLoading,
    isSending,
    error,
    fetchConversations,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearActiveSession,
    sendMessage,
  };
});
