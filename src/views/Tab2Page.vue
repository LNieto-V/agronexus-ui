<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="ag-neon-glow font-bold text-xl ion-hide-md-up">AI Expert</ion-title>
        <ion-title class="font-bold text-lg ion-hide-md-down">Expert Analysis</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearChat">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding chat-content" ref="contentRef">
      <div class="messages-container">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="welcome-box ag-glass-card p-8 text-center tech-cut-corner relative overflow-hidden">
          <div class="tech-grid-bg absolute inset-0 opacity-10"></div>
          <div class="relative z-10 flex flex-col items-center">
            <div class="icon-glow-container mb-6">
              <ion-icon :icon="sparklesOutline" class="text-5xl text-neon-green" />
            </div>
            <h3 class="text-2xl font-black tracking-tight mb-2">AgroNexus Assistant</h3>
            <div class="h-0.5 w-12 bg-neon-green mb-4"></div>
            <p class="text-xs opacity-50 leading-relaxed max-w-xs mx-auto font-medium uppercase tracking-wider">
              AI-Core initialized. Ready to optimize your hydroponic parameters.
            </p>
          </div>
        </div>

        <!-- Chat History -->
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          :class="['message-bubble', msg.role]"
        >
          <div class="bubble-content ag-glass-card relative overflow-hidden" :class="msg.role === 'assistant' ? 'tech-cut-corner' : 'user-cut'">
            <div v-if="msg.role === 'assistant'" class="tech-grid-bg absolute inset-0 opacity-5"></div>
            
            <div class="relative z-10">
              <!-- Markdown Rendered Content -->
              <div class="text-sm markdown-body" v-html="renderMarkdown(msg.content)"></div>
              
              <div class="text-[9px] font-black opacity-30 mt-3 flex justify-end tracking-widest uppercase">
                {{ msg.role === 'user' ? 'AUTH_USER' : 'AI_NODE' }} • {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Neural Loading Indicator -->
        <div v-if="loading" class="message-bubble assistant">
          <div class="bubble-content ag-glass-card p-0 tech-cut-corner border-neon-green/30 relative overflow-hidden w-full max-w-[300px]">
             <div class="neural-scan-line"></div>
             <div class="p-4 flex flex-col gap-2">
               <div class="flex items-center gap-3">
                 <div class="w-1.5 h-1.5 bg-neon-green rounded-full shadow-neon animate-pulse"></div>
                 <span class="text-[10px] font-black uppercase tracking-[0.2em] text-neon-green">Neural_Processing_In_Progress</span>
               </div>
               <div class="flex flex-col gap-1.5 px-2">
                 <div class="h-1 bg-white/5 rounded-full overflow-hidden w-full relative">
                    <div class="h-full bg-neon-green/40 neural-progress-anim"></div>
                 </div>
                 <div class="h-1 bg-white/5 rounded-full overflow-hidden w-3/4 relative">
                    <div class="h-full bg-neon-green/20 neural-progress-anim [animation-delay:0.5s]"></div>
                 </div>
               </div>
               <p class="text-[8px] opacity-30 font-mono mt-1 uppercase tracking-tighter">Syncing with Telemetry_Cluster_01...</p>
             </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border bg-transparent">
      <div class="input-container p-6">
        <div class="ag-glass-card flex items-center p-2 gap-2 shadow-2xl tech-cut-corner border border-white/5 relative overflow-hidden">
          <div class="tech-grid-bg absolute inset-0 opacity-5"></div>
          <ion-input
            v-model="input"
            placeholder="TYPE_QUERY_HERE..."
            @keyup.enter="handleSend"
            class="chat-input relative z-10 font-bold text-sm tracking-tight"
            :disabled="loading"
          ></ion-input>
          <ion-button @click="handleSend" class="send-btn relative z-10" fill="clear" :disabled="loading">
            <div class="bg-neon-green/10 p-2 rounded-lg border border-neon-green/20 group hover:bg-neon-green/20 transition-all">
              <ion-icon :icon="send" :class="loading ? 'opacity-20' : 'text-neon-green'" />
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
  toastController, IonMenuButton 
} from '@ionic/vue';
import { 
  sparklesOutline, trashOutline, send, alertCircleOutline 
} from 'ionicons/icons';
import { ref, computed, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { marked } from 'marked';

const chatStore = useChatStore();
const messages = computed(() => chatStore.messages);
const loading = computed(() => chatStore.loading);
const input = ref('');
const contentRef = ref<any>(null);

const renderMarkdown = (text: string) => {
  try {
    return marked.parse(text);
  } catch (e) {
    console.error('MARKDOWN_PARSE_ERROR:', e);
    return text;
  }
};

const scrollToBottom = async (duration = 300) => {
  await nextTick();
  if (contentRef.value?.$el) {
    contentRef.value.$el.scrollToBottom(duration);
  }
};

// Auto-scroll when messages change or loading state changes
watch([messages, loading], () => {
  scrollToBottom(500);
}, { deep: true });

const showErrorToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'top',
    color: 'danger',
    icon: alertCircleOutline,
    cssClass: 'premium-toast'
  });
  await toast.present();
};

const handleSend = async () => {
  if (!input.value.trim() || loading.value) return;
  
  const text = input.value;
  input.value = '';
  
  // Trigger Haptic Feedback on Send
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) { /* Haptics not available */ }
  
  try {
    await chatStore.sendMessage(text);
  } catch (error) {
    showErrorToast('DATA_SYNC_FAILURE: AI Proxy Unreachable');
  }
};

const clearChat = () => {
  chatStore.clearChat();
};
</script>

<style scoped>
.chat-content {
  --background: transparent;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0 4rem 0;
  max-width: 800px;
  margin: 0 auto;
}

.message-bubble {
  display: flex;
  max-width: 85%;
  animation: techSlideIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes techSlideIn {
  from { opacity: 0; transform: translateX(-20px); filter: blur(10px); }
  to { opacity: 1; transform: translateX(0); filter: blur(0); }
}

.message-bubble.user {
  align-self: flex-end;
  animation-name: userSlideIn;
}

@keyframes userSlideIn {
  from { opacity: 0; transform: translateX(20px); filter: blur(10px); }
  to { opacity: 1; transform: translateX(0); filter: blur(0); }
}

.bubble-content {
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-cut {
  clip-path: polygon(
    0% 15px, 
    15px 0%, 
    100% 0%, 
    100% calc(100% - 15px), 
    calc(100% - 15px) 100%, 
    0% 100%
  );
}

.user .bubble-content {
  background: linear-gradient(135deg, rgba(var(--ag-neon-green-rgb), 0.2) 0%, rgba(var(--ag-neon-green-rgb), 0.05) 100%);
  border-color: rgba(var(--ag-neon-green-rgb), 0.3);
  color: #fff;
}

.assistant .bubble-content {
  border-color: rgba(255, 255, 255, 0.1);
}

.input-container {
  background: linear-gradient(0deg, var(--ion-background-color) 40%, transparent 100%);
  max-width: 800px;
  margin: 0 auto;
}

.chat-input {
  --padding-start: 16px;
  --placeholder-opacity: 0.3;
  --placeholder-font-weight: 900;
  --color: #fff;
}

.send-btn {
  --padding-start: 0;
  --padding-end: 0;
}

.icon-glow-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-glow-container::after {
  content: '';
  position: absolute;
  width: 60px; height: 60px;
  background: var(--ag-neon-green);
  filter: blur(40px);
  opacity: 0.3;
  z-index: -1;
}

/* Neural Load Effects */
.neural-scan-line {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--ag-neon-green), transparent);
  animation: neuralScan 1.5s infinite ease-in-out;
  z-index: 20;
  box-shadow: 0 0 15px var(--ag-neon-green);
}

.neural-progress-anim {
  position: absolute;
  top: 0; left: -100%;
  width: 100%;
  height: 100%;
  animation: neuralProgress 2s infinite ease-in-out;
}

@keyframes neuralProgress {
  0% { transform: translateX(0); }
  100% { transform: translateX(200%); }
}

.shadow-neon {
  box-shadow: 0 0 10px var(--ag-neon-green);
}

/* Markdown Style Overrides */
:deep(.markdown-body) {
  line-height: 1.6;
  font-family: inherit;
}
:deep(.markdown-body p) {
  margin-bottom: 0.75rem;
}
:deep(.markdown-body code) {
  background: rgba(var(--ag-neon-green-rgb), 0.1);
  color: var(--ag-neon-green);
  font-size: 0.85em;
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

.text-neon-green { color: var(--ag-neon-green); }
.text-5xl { font-size: 3rem; }
.p-8 { padding: 2rem; }
.max-w-xs { max-width: 20rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
</style>

