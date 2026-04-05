<script setup lang="ts">
import { 
  IonIcon, IonPage, IonRouterOutlet, IonSplitPane, IonMenu, 
  IonContent, IonList, IonItem, IonMenuToggle, IonLabel
} from '@ionic/vue';
import { 
  homeOutline,
  thermometerOutline, 
  chatbubbleEllipsesOutline, 
  pulseOutline,
  logOutOutline
} from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  try {
    await authStore.signOut();
    router.replace('/login');
  } catch (err) {
    console.error('Logout error', err);
  }
}
</script>

<template>
  <ion-page>
    <ion-split-pane content-id="main-content" when="xl">
      <!-- Premium Sidebar -->
      <ion-menu content-id="main-content" class="ag-sidebar">
        <ion-content class="sidebar-content">
          <div class="sidebar-header">
            <h1 class="ag-neon-glow text-2xl font-black tracking-tight">AgroNexus <span class="ag-badge">AI</span></h1>
            <p class="sidebar-tagline">Advanced Hydroponics</p>
          </div>
          
          <ion-list lines="none" class="sidebar-nav">
            <ion-menu-toggle :auto-hide="false">
              <ion-item 
                button 
                router-link="/tabs/home" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/home' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="homeOutline" />
                <ion-label>Overview</ion-label>
              </ion-item>

              <ion-item 
                button 
                router-link="/tabs/dashboard" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/dashboard' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="thermometerOutline" />
                <ion-label>Telemetry</ion-label>
              </ion-item>

              <ion-item 
                button 
                router-link="/tabs/assistant" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/assistant' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="chatbubbleEllipsesOutline" />
                <ion-label>AI Assistant</ion-label>
              </ion-item>

              <ion-item 
                button 
                router-link="/tabs/control" 
                :detail="false" 
                class="sidebar-item"
                :class="{ 'item-active': route.path === '/tabs/control' }"
              >
                <div class="active-indicator"></div>
                <ion-icon slot="start" :icon="pulseOutline" />
                <ion-label>Systems</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>

          <div class="sidebar-footer-nav">
             <ion-item button @click="handleLogout" :detail="false" class="sidebar-item logout-item">
                <ion-icon slot="start" :icon="logOutOutline" />
                <ion-label>Cerrar Sesión</ion-label>
             </ion-item>
          </div>

          
          <div class="status-card">
            <p class="status-label">Core Status</p>
            <div class="status-row">
              <div class="status-indicator">
                <div class="status-dot-inner"></div>
                <div class="status-dot-ping"></div>
              </div>
              <span class="status-text">Mainframe Active</span>
            </div>
          </div>
        </ion-content>
      </ion-menu>

      <!-- Main Content Area -->
      <div id="main-content" class="ion-page">
        <ion-router-outlet />
      </div>

    </ion-split-pane>
  </ion-page>
</template>

<style scoped>
/* Sidebar */
.sidebar-header {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sidebar-tagline {
  font-size: 8px;
  opacity: 0.4;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

.ag-badge {
  font-size: 10px;
  background: rgba(var(--ag-primary-rgb), 0.1);
  color: var(--ag-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.25rem;
}

.sidebar-nav {
  background: transparent;
  margin-top: 1.5rem;
  padding: 0 0.75rem;
}

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
  background: var(--ag-primary);
  border-radius: 0 4px 4px 0;
  transition: height 0.3s ease;
}

.item-active .active-indicator { height: 20px; }

.sidebar-item ion-icon {
  font-size: 1.25rem;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.item-active ion-icon {
  opacity: 1;
  color: var(--ag-primary);
}

.item-active ion-label {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.sidebar-footer-nav {
  margin-top: auto;
  padding: 0 0.75rem 1rem;
}

.logout-item {
  --color: var(--ag-danger);
  opacity: 0.8;
}

.logout-item ion-icon {
  color: var(--ag-danger);
  opacity: 1;
}


/* Status Card */
.status-card {
  position: absolute;
  bottom: 2rem;
  left: 1rem;
  right: 1rem;
  padding: 1.25rem;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
}

.status-label {
  font-size: 9px;
  opacity: 0.4;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator { position: relative; }

.status-dot-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ag-primary);
  animation: heartbeat 1.5s ease-in-out infinite;
}

.status-dot-ping {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(var(--ag-primary-rgb), 0.3);
  position: absolute;
  inset: 0;
  animation: ping 1.5s ease-in-out infinite;
}

.status-text {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  color: rgba(255,255,255,0.9);
}

@keyframes heartbeat {
  0% { transform: scale(1); opacity: 1; }
  15% { transform: scale(1.2); opacity: 0.8; }
  30% { transform: scale(1); opacity: 1; }
  45% { transform: scale(1.1); opacity: 0.9; }
  60% { transform: scale(1); opacity: 1; }
}

@keyframes ping {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.8); opacity: 0; }
}

@media (max-width: 767px) { .hide-on-mobile { display: none !important; } }
@media (min-width: 768px) { .hide-on-desktop { display: none !important; } }

/* Hide Sidebar Scrollbar Globally */
.sidebar-content::v-deep(main.inner-scroll) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidebar-content::v-deep(main.inner-scroll::-webkit-scrollbar) {
  display: none;
}
</style>
