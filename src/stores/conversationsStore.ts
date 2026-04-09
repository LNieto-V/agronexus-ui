import { defineStore } from 'pinia';
import { ref } from 'vue';
import { conversationService, chatService } from '@/services/api';
import { useSystemStore } from '@/stores/system';
import { useIotStore } from '@/stores/iotStore';
import { useActuatorBus } from '@/composables/useActuatorBus';
import { toastController } from '@ionic/vue';
import type { Conversation, ChatMessage, ChatHistoryItem } from '@/types';

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref<Conversation[]>([]);
  const activeSessionId = ref<string | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  // --- Pagination ---
  const chatPage = ref(0);
  const chatHasMore = ref(true);
  const CHAT_PAGE_SIZE = 50;

  const { emitActuatorActions } = useActuatorBus();

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

  function mapHistoryItem(msg: ChatHistoryItem, sessionId: string): ChatMessage {
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
  }

  async function selectConversation(sessionId: string) {
    if (activeSessionId.value === sessionId && messages.value.length > 0) return;
    
    activeSessionId.value = sessionId;
    messages.value = [];
    isLoading.value = true;
    error.value = null;
    chatPage.value = 0;
    chatHasMore.value = true;

    try {
      const response = await chatService.getHistory(sessionId, CHAT_PAGE_SIZE, 0);
      
      const historyItems = 
        (response.data as any).history || 
        (Array.isArray(response.data) ? response.data : []);

      if (historyItems.length < CHAT_PAGE_SIZE) {
        chatHasMore.value = false;
      }

      messages.value = historyItems.map((msg: ChatHistoryItem) => mapHistoryItem(msg, sessionId));
      chatPage.value = 1;
    } catch (err) {
      console.error('Error loading conversation history:', err);
      error.value = 'Error al cargar el historial. Reintenta pronto.';
    } finally {
      isLoading.value = false;
    }
  }

  async function loadMoreMessages() {
    if (!chatHasMore.value || isLoading.value || !activeSessionId.value) return;
    
    isLoading.value = true;
    const offset = chatPage.value * CHAT_PAGE_SIZE;
    
    try {
      const response = await chatService.getHistory(activeSessionId.value, CHAT_PAGE_SIZE, offset);
      const items = (response.data as any).history || (Array.isArray(response.data) ? response.data : []);
      
      if (items.length < CHAT_PAGE_SIZE) {
        chatHasMore.value = false;
      }
      
      const mapped = items.map((msg: ChatHistoryItem) => mapHistoryItem(msg, activeSessionId.value!));
      messages.value = [...mapped, ...messages.value];
      chatPage.value++;
    } catch (err) {
      console.error('Error loading more messages:', err);
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
      const chatResp = response.data;

      // If backend returned a session_id and we didn't have one, adopt it
      if (chatResp.session_id && !activeSessionId.value) {
        activeSessionId.value = chatResp.session_id;
        await fetchConversations();
      }

      // Add AI response
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        message: chatResp.response,
        created_at: new Date().toISOString(),
        session_id: activeSessionId.value,
      };
      messages.value = [...messages.value, aiMsg];

      // Process actions
      if (chatResp.actions && chatResp.actions.length > 0) {
        const systemStore = useSystemStore();
        const iotStore = useIotStore();
        chatResp.actions.forEach((action) => {
          systemStore.addLog(
            'AI', 
            `CMD: ${action.device} → ${action.action} | ${action.reason}`
          );
          iotStore.addOptimisticLog({
            device: action.device,
            action: action.action,
            reason: action.reason
          });
        });
        emitActuatorActions(chatResp.actions);
      }

      // Process alerts
      if (chatResp.alerts && chatResp.alerts.length > 0) {
        const systemStore = useSystemStore();
        chatResp.alerts.forEach(async (alert) => {
          const toast = await toastController.create({
            message: `⚠️ ${alert}`,
            duration: 4000,
            color: 'warning',
            position: 'top',
          });
          await toast.present();
          systemStore.addLog('ALERT', alert);
        });
      }

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
    loadMoreMessages,
    chatHasMore
  };
});
