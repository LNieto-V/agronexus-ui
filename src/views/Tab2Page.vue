<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">AI Assistant</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearChat" shape="round">
            <ion-icon :icon="trashOutline" class="text-muted" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="chat-bg" ref="contentRef">
      <div class="ag-container py-4 md:py-8 max-w-[800px]">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="ag-flex-col items-center justify-center p-8 mt-12 text-center">
          <div class="ag-icon-box bg-primary-soft text-primary mb-6 !w-16 !h-16 rounded-2xl">
            <ion-icon :icon="sparklesOutline" class="text-3xl" />
          </div>
          <h3 class="text-2xl font-bold mb-3">Hi, I'm AgroNexus</h3>
          <p class="text-base text-muted max-w-md">
            Your personal agricultural assistant. Ask me about your telemetry data, system health, or recommendations for crop optimization.
          </p>
        </div>

        <!-- Chat History -->
        <div class="ag-flex-col gap-6 mb-12">
          <div v-for="msg in messages" :key="msg.id" :class="['message-wrapper', msg.role]">
            <div class="message-bubble" :class="msg.role">
              <div class="text-base markdown-body" v-html="renderMarkdown(msg.content)"></div>
            </div>
            <div class="message-meta">
              {{ msg.role === 'user' ? 'You' : 'AgroNexus' }} &bull; {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </div>
        </div>

        <!-- Modern Loading Indicator -->
        <div v-if="loading" class="message-wrapper assistant">
          <div class="message-bubble assistant loading-bubble">
             <div class="typing-indicator">
               <span></span><span></span><span></span>
             </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border bg-transparent">
      <div class="ag-container max-w-[800px] p-2 md:p-4 pb-8 md:pb-4">
        <div class="ag-card ag-flex-row p-2 gap-3 !rounded-2xl">
          <ion-input 
            v-model="input" 
            placeholder="Ask AgroNexus..." 
            @keyup.enter="handleSend" 
            class="chat-input px-2" 
            :disabled="loading"
          ></ion-input>
          <ion-button @click="handleSend" fill="clear" :disabled="loading || !input.trim()" shape="round" class="send-button">
             <div class="ag-icon-box" :class="input.trim() && !loading ? 'bg-primary text-white' : 'bg-card text-muted border border-white/10'">
               <ion-icon :icon="send" />
             </div>
          </ion-button>
        </div>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon, IonFooter, IonInput, 
  IonMenuButton 
} from '@ionic/vue';
import { sparklesOutline, trashOutline, send } from 'ionicons/icons';
import { ref, computed, nextTick, watch, onMounted } from 'vue';
import { useChatStore } from '@/stores/chat';
import { marked } from 'marked';

const chatStore = useChatStore();
const messages = computed(() => chatStore.messages);
const loading = computed(() => chatStore.loading);
const input = ref('');
const contentRef = ref<any>(null);

const renderMarkdown = (text: string) => { try { return marked.parse(text); } catch (e) { return text; } };
const scrollToBottom = async (duration = 300) => { await nextTick(); if (contentRef.value?.$el) contentRef.value.$el.scrollToBottom(duration); };
watch([messages, loading], () => scrollToBottom(500), { deep: true });

const handleSend = async () => {
  if (!input.value.trim() || loading.value) return;
  const text = input.value;
  input.value = '';
  await chatStore.sendMessage(text);
};

const clearChat = () => chatStore.clearChat();

onMounted(() => {
  chatStore.fetchHistory();
});
</script>

<style scoped>
.chat-bg { --background: var(--ag-bg); }

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 92%;
  animation: fadeIn 0.3s ease-out;
}
@media (min-width: 768px) {
  .message-wrapper { max-width: 80%; }
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.message-wrapper.user {
  align-self: flex-end;
  align-items: flex-end;
}
.message-wrapper.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  padding: 1.25rem 1.5rem;
  border-radius: 20px;
  line-height: 1.5;
}

.message-bubble.user {
  background-color: var(--ag-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.assistant {
  background-color: var(--ag-card);
  border: 1px solid var(--ag-border);
  color: var(--ag-text);
  border-bottom-left-radius: 4px;
}

.message-meta {
  font-size: 0.75rem;
  color: var(--ag-text-muted);
  margin-top: 0.5rem;
  padding: 0 0.5rem;
}

.chat-input {
  --placeholder-color: var(--ag-text-muted);
  --color: var(--ag-text);
  font-size: 1rem;
}

.send-button {
  --padding-start: 0;
  --padding-end: 0;
  margin: 0;
}

/* Typing Indicator */
.loading-bubble {
  padding: 1rem 1.5rem;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
}

.typing-indicator span {
  display: block;
  width: 6px;
  height: 6px;
  background-color: var(--ag-text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

:deep(.message-bubble.user .markdown-body) {
  color: white;
}
:deep(.message-bubble.user .markdown-body code) {
  background: rgba(0,0,0,0.2);
  border-color: transparent;
  color: white;
}
</style>
