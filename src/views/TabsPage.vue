<template>
  <ion-page>
    <ion-split-pane content-id="main-content" when="md">
      <!-- Premium Sidebar (Visible on MD+) -->
      <ion-menu content-id="main-content" type="overlay" class="ag-sidebar hide-mobile">
        <ion-content class="sidebar-content">
          <div class="sidebar-header p-6 flex flex-col gap-1 border-b border-white/5">
            <h1 class="ag-neon-glow text-2xl font-black tracking-tight">AgroNexus <span class="text-[10px] bg-neon-green/10 text-neon-green px-2 py-0.5 rounded ml-1">AI</span></h1>
            <p class="text-[8px] opacity-40 font-bold tracking-[0.3em] uppercase mt-1">Advanced Hydroponics</p>
          </div>
          
          <ion-list lines="none" class="bg-transparent mt-6 px-3">
            <ion-menu-toggle :auto-hide="false">
              <!-- New Home Item -->
              <ion-item 
                button 
                router-link="/tabs/home" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/home' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="homeOutline" />
                <ion-label>System Home</ion-label>
              </ion-item>

              <ion-item 
                button 
                router-link="/tabs/tab1" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/tab1' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="thermometerOutline" />
                <ion-label>Dashboard</ion-label>
              </ion-item>

              <ion-item 
                button 
                router-link="/tabs/tab2" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/tab2' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="chatbubbleEllipsesOutline" />
                <ion-label>AgExpert AI</ion-label>
              </ion-item>

              <ion-item 
                button 
                router-link="/tabs/tab3" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/tab3' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="pulseOutline" />
                <ion-label>System Control</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
          
          <div class="absolute bottom-8 left-4 right-4 p-5 ag-glass-card border border-white/5 tech-cut-corner overflow-hidden">
            <div class="tech-grid-bg absolute inset-0 opacity-20"></div>
            <div class="relative z-10">
              <p class="text-[9px] opacity-40 uppercase tracking-[0.2em] font-black mb-2">Core Status</p>
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="w-2.5 h-2.5 rounded-full bg-neon-green heartbeat shadow-[0_0_10px_var(--ag-neon-green)]"></div>
                  <div class="w-full h-full rounded-full bg-neon-green/30 absolute inset-0 animate-ping"></div>
                </div>
                <span class="text-xs font-bold tracking-tight text-white/90">Mainframe Active</span>
              </div>
            </div>
          </div>
        </ion-content>
      </ion-menu>

      <!-- Main Content with Mobile Tabs -->
      <ion-tabs id="main-content">
        <ion-router-outlet />
        
        <!-- Mobile Bottom Tab Bar (Visible only on small screens) -->
        <ion-tab-bar slot="bottom" class="hide-desktop premium-tab-bar">
          <ion-tab-button tab="home" href="/tabs/home">
            <ion-icon :icon="homeOutline" />
            <ion-label>Home</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab1" href="/tabs/tab1">
            <ion-icon :icon="thermometerOutline" />
            <ion-label>Dashboard</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab2" href="/tabs/tab2">
            <ion-icon :icon="chatbubbleEllipsesOutline" />
            <ion-label>AI Assistant</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab3" href="/tabs/tab3">
            <ion-icon :icon="pulseOutline" />
            <ion-label>Control</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-split-pane>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonIcon, IonPage, IonRouterOutlet, IonSplitPane, IonMenu, 
  IonContent, IonList, IonItem, IonMenuToggle, IonLabel,
  IonTabs, IonTabBar, IonTabButton
} from '@ionic/vue';
import { 
  homeOutline,
  thermometerOutline, 
  chatbubbleEllipsesOutline, 
  pulseOutline 
} from 'ionicons/icons';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped>
/* Mobile Tab Bar Styling */
.premium-tab-bar {
  --background: var(--ag-card);
  --border-top: 1px solid var(--ag-border);
  height: 65px;
  padding-bottom: 5px;
  backdrop-filter: blur(20px);
}

ion-tab-button {
  --color: var(--ag-text-muted);
  --color-selected: var(--ag-primary);
  transition: all 0.2s ease;
}

ion-tab-button ion-icon {
  font-size: 1.4rem;
}

ion-tab-button ion-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Sidebar Item Styling */
.sidebar-item {
  --padding-start: 12px;
  --inner-padding-end: 12px;
  --border-radius: 12px;
  --background: transparent;
  margin-bottom: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.active-indicator {
  position: absolute;
  left: 0;
  width: 3px;
  height: 0;
  background: var(--ag-neon-green);
  border-radius: 0 4px 4px 0;
  transition: height 0.3s ease;
  box-shadow: 0 0 10px var(--ag-neon-green);
}

.item-active .active-indicator {
  height: 20px;
}

.sidebar-item ion-icon {
  font-size: 1.25rem;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.item-active ion-icon {
  opacity: 1;
  color: var(--ag-neon-green);
  filter: drop-shadow(0 0 5px rgba(var(--ag-neon-green-rgb), 0.5));
}

.item-active ion-label {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0% { transform: scale(1); opacity: 1; }
  15% { transform: scale(1.2); opacity: 0.8; }
  30% { transform: scale(1); opacity: 1; }
  45% { transform: scale(1.1); opacity: 0.9; }
  60% { transform: scale(1); opacity: 1; }
}

/* Visibility Helpers (Sync with variables.css) */
@media (max-width: 767px) {
  .hide-mobile { display: none !important; }
}
@media (min-width: 768px) {
  .hide-desktop { display: none !important; }
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-6 { margin-top: 1.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
</style>

