<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon, IonFooter, IonInput, 
  actionSheetController, alertController,
  IonMenuButton, IonModal
} from '@ionic/vue';
import { 
  sparklesOutline, 
  trashOutline, 
  send as sendIcon,
  addOutline,
  ellipsisVerticalOutline,
  pencilOutline,
  chatbubbleEllipsesOutline,
  timeOutline
} from 'ionicons/icons';
import { ref, nextTick, onMounted, computed, watch } from 'vue';
import { useConversationsStore } from '@/stores/conversationsStore';
import type { Conversation } from '@/types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const store = useConversationsStore();
const input = ref('');
const bottomRef = ref<HTMLDivElement | null>(null);

const messages = computed(() => store.messages);
const loading = computed(() => store.isLoading);
const sending = computed(() => store.isSending);
const conversations = computed(() => store.conversations);
const activeSessionId = computed(() => store.activeSessionId);
const isHistoryModalOpen = ref(false);

const renderMarkdown = (text: string) => { 
  try { 
    return DOMPurify.sanitize(marked.parse(text) as string); 
  } catch (e) { 
    return DOMPurify.sanitize(text); 
  } 
};

const scrollToBottom = async (behavior: ScrollBehavior = 'smooth') => {
  await nextTick();
  if (bottomRef.value) {
    bottomRef.value.scrollIntoView({ behavior });
  }
};

// Auto-scroll when messages change or typing indicator appears
watch([messages, loading, sending], () => {
  scrollToBottom();
}, { deep: true });

onMounted(async () => {
  await store.fetchConversations();
  if (!store.activeSessionId && store.conversations.length > 0) {
    await store.selectConversation(store.conversations[0].id);
  }
  await nextTick();
  setTimeout(() => scrollToBottom('auto'), 100);
});

async function handleSend() {
  if (!input.value.trim() || sending.value) return;
  
  const text = input.value;
  input.value = '';

  if (!store.activeSessionId) {
    // If no active session, sendMessage will handle auto-creation
    // but we can give it a title hint if we wanted.
  }
  
  await store.sendMessage(text);
}

async function createNew() {
  await store.createConversation('Nueva conversación');
  input.value = '';
  isHistoryModalOpen.value = false;
}

async function toggleHistory() {
  isHistoryModalOpen.value = !isHistoryModalOpen.value;
}

async function selectSession(id: string) {
  await store.selectConversation(id);
  isHistoryModalOpen.value = false;
}

async function showOptions(conv: Conversation) {
  const actionSheet = await actionSheetController.create({
    header: conv.title,
    cssClass: 'premium-action-sheet',
    buttons: [
      {
        text: 'Renombrar',
        icon: pencilOutline,
        handler: () => promptRename(conv),
      },
      {
        text: 'Eliminar',
        icon: trashOutline,
        role: 'destructive',
        handler: () => confirmDelete(conv),
      },
      { text: 'Cancelar', role: 'cancel' },
    ],
  });
  await actionSheet.present();
}

async function promptRename(conv: Conversation) {
  const alert = await alertController.create({
    header: 'Renombrar conversación',
    cssClass: 'premium-alert',
    inputs: [{ name: 'title', type: 'text', value: conv.title, placeholder: 'Nuevo nombre' }],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Guardar',
        handler: (data) => {
          if (data.title) store.renameConversation(conv.id, data.title);
        },
      },
    ],
  });
  await alert.present();
}

async function confirmDelete(conv: Conversation) {
  const alert = await alertController.create({
    header: '¿Eliminar conversación?',
    message: `Esta acción no se puede deshacer. Se borrará "${conv.title}".`,
    cssClass: 'premium-alert',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => store.deleteConversation(conv.id),
      },
    ],
  });
  await alert.present();
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <ion-page>
    <!-- GLOBAL APP SIDEBAR (Main Hamburger) - Handled in TabsPage -->

    <!-- HISTORY MODAL: Access past chats in a clean UI -->
    <ion-modal 
      :is-open="isHistoryModalOpen" 
      @did-dismiss="isHistoryModalOpen = false"
      class="history-modal"
      :initial-breakpoint="0.75"
      :breakpoints="[0, 0.75, 1]"
    >
      <ion-header class="ion-no-border">
        <ion-toolbar class="modal-toolbar px-2">
          <ion-title>Historial de Chat</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="isHistoryModalOpen = false" color="medium">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="modal-content">
        <div class="sidebar-header-actions p-4">
          <ion-button expand="block" @click="createNew" class="new-chat-btn">
            <ion-icon slot="start" :icon="addOutline" />
            Nueva conversación
          </ion-button>
        </div>

        <div class="sidebar-scrollable px-4 pb-8">
          <div v-if="conversations.length === 0" class="empty-sessions py-12">
             <ion-icon :icon="chatbubbleEllipsesOutline" class="empty-icon text-muted" />
             <p class="text-muted">No hay chats previos</p>
          </div>
          
          <div class="sessions-list">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              class="session-item"
              :class="{ 'active-session': conv.id === activeSessionId }"
              @click="selectSession(conv.id)"
            >
              <div class="session-info">
                <span class="session-title">{{ conv.title }}</span>
                <span class="session-date">{{ formatDate(conv.updated_at) }}</span>
              </div>
              <ion-button fill="clear" color="medium" size="small" class="session-opts-btn" @click.stop="showOptions(conv)">
                <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
              </ion-button>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <div class="chat-main">
      <ion-header class="ion-no-border">
        <ion-toolbar class="premium-toolbar">
          <ion-buttons slot="start">
            <!-- Botón del menú principal (App Sidebar) -->
            <ion-menu-button></ion-menu-button>
            <!-- Botón del historial (Clock Icon) -->
            <ion-button @click="toggleHistory" class="history-toggle-btn" color="primary">
              <ion-icon slot="icon-only" :icon="timeOutline" />
            </ion-button>
          </ion-buttons>
          
          <ion-title>
            <div class="toolbar-title-content">
              <span v-if="activeSessionId" class="session-name">
                {{ conversations.find(c => c.id === activeSessionId)?.title || 'Chat' }}
              </span>
              <span v-else class="app-name">AgroNexus AI</span>
            </div>
          </ion-title>
          
          <ion-buttons slot="end">
            <ion-button @click="createNew" class="hide-on-mobile" color="primary">
              <ion-icon slot="start" :icon="addOutline" />
              Nuevo
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content :fullscreen="true" class="chat-content-bg">
        <div class="chat-container">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0 && !loading" class="welcome-container">
            <div class="welcome-icon-box">
              <ion-icon :icon="sparklesOutline" />
            </div>
            <h1>Hi, I'm AgroNexus</h1>
            <p>
              Your personal agricultural assistant. Ask me about your telemetry data, system health, or recommendations for crop optimization.
            </p>
          </div>

          <!-- Chat History -->
          <div class="messages-list" :key="activeSessionId || 'empty'">
            <div v-for="msg in messages" :key="msg.id" :class="['message-wrapper', msg.role]">
              <div class="message-bubble">
                <div class="markdown-body" v-html="renderMarkdown(msg.message)"></div>
              </div>
              <div class="message-meta">
                {{ msg.role === 'user' ? 'You' : 'AgroNexus' }} &bull; {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </div>
            </div>

            <!-- Loading / Typing Indicator -->
            <div v-if="loading || sending" class="message-wrapper ai">
              <div class="message-bubble typing-bubble">
                 <div class="typing-indicator">
                   <span></span><span></span><span></span>
                 </div>
              </div>
            </div>
            
            <div ref="bottomRef" class="scroll-anchor"></div>
          </div>
        </div>
      </ion-content>

      <ion-footer class="ion-no-border chat-footer">
        <div class="input-container">
          <div class="input-card">
            <ion-input 
              v-model="input" 
              placeholder="Ask AgroNexus..." 
              @keyup.enter="handleSend" 
              class="premium-input" 
              :disabled="sending"
            ></ion-input>
            <ion-button @click="handleSend" fill="clear" :disabled="sending || !input.trim()" class="send-btn">
               <div class="send-icon-box" :class="{ 'active': input.trim() && !sending }">
                 <ion-icon :icon="sendIcon" />
               </div>
            </ion-button>
          </div>
        </div>
      </ion-footer>
    </div>
  </ion-page>
</template>

<style scoped>

.history-modal {
  --background: var(--ag-card-soft);
  --border-radius: 24px;
}

.modal-toolbar {
  --background: var(--ag-card-soft);
  --padding-top: 1rem;
}

.sidebar-toolbar ion-title {
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sidebar-header-actions {
  padding: 0 1rem 1rem;
}

.new-chat-btn {
  --border-radius: 12px;
  --background: var(--ag-card);
  --color: var(--ag-text);
  --border-color: var(--ag-border);
  --border-style: solid;
  --border-width: 1px;
  font-weight: 600;
  margin: 0;
}

.sidebar-scrollable {
  padding: 0 0.75rem 1.5rem;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.session-item {
  padding: 0.75rem 0.75rem 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  transition: all 0.2s ease;
  background: transparent;
  border-left: 3px solid transparent; /* Placeholder for active indicator */
}

.session-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.active-session {
  background: rgba(var(--ag-primary-rgb), 0.08);
  border-left-color: var(--ag-primary) !important;
  box-shadow: -10px 0 20px -10px rgba(var(--ag-primary-rgb), 0.3);
}

.session-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.session-title {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ag-text-muted);
}

.active-session .session-title {
  color: var(--ag-primary);
}

.session-date {
  font-size: 0.7rem;
  opacity: 0.4;
}

.session-opts-btn {
  --color: var(--ag-text-muted);
  --padding-start: 0;
  --padding-end: 0;
  margin: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.session-item:hover .session-opts-btn,
.active-session .session-opts-btn {
  opacity: 1;
}

/* Chat Content Styling */
.chat-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
  background: var(--ag-bg);
}

.premium-toolbar {
  --background: var(--ag-bg);
  --border-style: none;
  border-bottom: 1px solid var(--ag-border);
  --padding-start: 0.5rem;
  --padding-end: 1rem;
}

.history-toggle-btn {
  --color: var(--ag-text-muted);
}

.toolbar-title-content {
  display: flex;
  flex-direction: column;
}

.session-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ag-text);
}

.app-name {
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--ag-primary) 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chat-content-bg {
  --background: var(--ag-bg);
}

.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  gap: 1.5rem;
}

.welcome-icon-box {
  width: 64px;
  height: 64px;
  background: rgba(var(--ag-primary-rgb), 0.1);
  color: var(--ag-primary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.welcome-container h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
}

.welcome-container p {
  font-size: 1.1rem;
  color: var(--ag-text-muted);
  max-width: 450px;
  line-height: 1.6;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
  animation: chatFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes chatFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-wrapper.user {
  align-self: flex-end;
}

.message-wrapper.ai {
  align-self: flex-start;
}

.message-bubble {
  padding: 1rem 1.25rem;
  border-radius: 18px;
  line-height: 1.5;
  font-size: 1rem;
}

.user .message-bubble {
  background: var(--ag-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai .message-bubble {
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  color: var(--ag-text);
  border-bottom-left-radius: 4px;
}

.message-meta {
  font-size: 0.7rem;
  color: var(--ag-text-muted);
  margin-top: 0.5rem;
  padding: 0 0.5rem;
}

.user .message-meta { text-align: right; }

/* Typing Indicator */
.typing-bubble {
  padding: 0.75rem 1.25rem;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--ag-text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.scroll-anchor { height: 1px; }

/* Footer & Input */
.chat-footer {
  background: transparent;
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

.input-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0.5rem 1rem 1rem;
}

.input-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid var(--ag-border);
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.25rem 0.25rem 1rem;
  gap: 0.5rem;
}

.premium-input {
  --color: var(--ag-text);
  --placeholder-color: var(--ag-text-muted);
  font-size: 1rem;
}

.send-btn {
  --padding-start: 0;
  --padding-end: 0;
  margin: 0;
}

.send-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ag-card);
  color: var(--ag-text-muted);
  transition: all 0.2s ease;
}

.send-icon-box.active {
  background: var(--ag-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--ag-primary-rgb), 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (min-width: 768px) {
}

.hide-on-mobile {
  display: none;
}
@media (min-width: 768px) {
  .hide-on-mobile { display: block; }
}

.hide-on-desktop {
  display: block;
}
@media (min-width: 768px) {
  .hide-on-desktop { display: none; }
}

/* Markdown Contextual Fixes */
:deep(.markdown-body) {
  font-size: 1rem;
  line-height: 1.6;
}

.user :deep(.markdown-body) {
  color: white;
}

.user :deep(.markdown-body code) {
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  opacity: 0.3;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>

