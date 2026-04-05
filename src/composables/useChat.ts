import { computed, shallowRef } from 'vue';
import { useChatStore } from '@/stores/chat';

export function useChat() {
  const chatStore = useChatStore();
  
  const messages = computed(() => chatStore.messages);
  const loading = computed(() => chatStore.loading);
  const input = shallowRef('');

  async function send() {
    if (!input.value.trim() || loading.value) return;
    const text = input.value;
    input.value = '';
    await chatStore.sendMessage(text);
  }

  function clear() { chatStore.clearChat(); }

  return { messages, loading, input, send, clear };
}
