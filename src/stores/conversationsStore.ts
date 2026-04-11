import { defineStore } from 'pinia';
import { ref } from 'vue';
import { conversationService, chatService } from '@/services/api';
import { useSystemStore } from '@/stores/system';
import { useIotStore } from '@/stores/iotStore';
import { useActuatorBus } from '@/composables/useActuatorBus';
import { useToast } from '@/composables/useToast';
import type { Conversation, ChatMessage, ChatHistoryItem } from '@/types';

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref<Conversation[]>([]);
  const activeSessionId = ref<string | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  const chatPage = ref(0);
  const chatHasMore = ref(true);
  const CHAT_PAGE_SIZE = 50;

  const { emitActuatorActions } = useActuatorBus();
  const { showToast } = useToast();

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

      if (historyItems.length < CHAT_PAGE_SIZE) chatHasMore.value = false;
      const mapped = historyItems.map((msg: ChatHistoryItem) => mapHistoryItem(msg, sessionId));
      messages.value = mapped.reverse();
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
      if (items.length < CHAT_PAGE_SIZE) chatHasMore.value = false;
      const mapped = items.map((msg: ChatHistoryItem) => mapHistoryItem(msg, activeSessionId.value!));
      messages.value = [...mapped.reverse(), ...messages.value];
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
      console.error('Error renaming:', err);
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
      console.error('Error deleting:', err);
    }
  }

  function clearActiveSession() {
    activeSessionId.value = null;
    messages.value = [];
    error.value = null;
  }

  async function sendMessage(text: string) {
    if (!activeSessionId.value) {
      try {
        const autoTitle = text.slice(0, 30).trim() + (text.length > 30 ? '...' : '');
        await createConversation(autoTitle);
      } catch (err) {
        console.error('Failed to auto-create conversation:', err);
      }
    }

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

      if (chatResp.session_id && !activeSessionId.value) {
        activeSessionId.value = chatResp.session_id;
        await fetchConversations();
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        message: chatResp.response,
        created_at: new Date().toISOString(),
        session_id: activeSessionId.value,
      };
      messages.value = [...messages.value, aiMsg];

      if (chatResp.actions && chatResp.actions.length > 0) {
        const systemStore = useSystemStore();
        const iotStore = useIotStore();
        chatResp.actions.forEach((action: any) => {
          systemStore.addLog('AI', `CMD: ${action.device} → ${action.action} | ${action.reason}`);
          iotStore.addOptimisticLog({ device: action.device, action: action.action, reason: action.reason });
        });
        emitActuatorActions(chatResp.actions);
      }

      if (chatResp.alerts && chatResp.alerts.length > 0) {
        const systemStore = useSystemStore();
        chatResp.alerts.forEach((alert: string) => {
          showToast(`⚠️ ${alert}`, 'warning', 4000);
          systemStore.addLog('ALERT', alert);
        });
      }

      if (activeSessionId.value) {
        const conv = conversations.value.find(c => c.id === activeSessionId.value);
        if (conv) {
          conv.updated_at = new Date().toISOString();
          conversations.value.sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        }
      }

      return response.data;
    } catch (err: any) {
      const is429 = err.response?.status === 429;
      const errMsg = is429
        ? 'El servicio de IA está al máximo de capacidad. Reintenta en unos segundos.'
        : (err instanceof Error ? err.message : 'Error al enviar el mensaje');

      error.value = errMsg;
      if (is429) showToast(errMsg, 'warning', 5000);

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
    conversations, activeSessionId, messages, isLoading, isSending, error,
    fetchConversations, createConversation, selectConversation,
    renameConversation, deleteConversation, clearActiveSession,
    sendMessage, loadMoreMessages, chatHasMore,
  };
});
