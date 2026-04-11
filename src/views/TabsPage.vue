<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useIotStore } from '@/stores/iotStore';
import { useTelemetrySSE } from '@/composables/useTelemetrySSE';
import {
  Home, Thermometer, MessageCircle, Radio,
  LogOut, Menu, X, Leaf
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const iotStore = useIotStore();
const { connect: connectSSE } = useTelemetrySSE();

const sidebarOpen = ref(false);

const navItems = [
  { path: '/tabs/home', label: 'Overview', icon: Home },
  { path: '/tabs/dashboard', label: 'Telemetry', icon: Thermometer },
  { path: '/tabs/assistant', label: 'AI Assistant', icon: MessageCircle },
  { path: '/tabs/control', label: 'Systems', icon: Radio },
];

const isXl = ref(false);

function checkWidth() {
  isXl.value = window.innerWidth >= 1280;
  if (isXl.value) sidebarOpen.value = false;
}

onMounted(() => {
  connectSSE();
  iotStore.fetchZones();
  checkWidth();
  window.addEventListener('resize', checkWidth);
});

function navigate(path: string) {
  router.push(path);
  if (!isXl.value) sidebarOpen.value = false;
}

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
  <div class="app-shell">
    <!-- Overlay for mobile sidebar -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen && !isXl"
        class="sidebar-overlay"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="sidebar">
      <aside
        v-show="isXl || sidebarOpen"
        class="app-sidebar"
        :class="{ 'sidebar-mobile': !isXl }"
        id="nav-sidebar"
        aria-label="Main navigation"
      >
        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <Leaf :size="20" />
          </div>
          <div>
            <h1 class="brand-name">AgroNexus <span class="ag-badge">AI</span></h1>
            <p class="brand-tagline">Advanced Hydroponics</p>
          </div>
          <button
            v-if="!isXl"
            class="sidebar-close-btn"
            @click="sidebarOpen = false"
            aria-label="Close sidebar"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Nav -->
        <nav class="sidebar-nav" role="navigation">
          <button
            v-for="item in navItems"
            :key="item.path"
            class="sidebar-item"
            :class="{ 'item-active': route.path === item.path }"
            @click="navigate(item.path)"
            :aria-current="route.path === item.path ? 'page' : undefined"
          >
            <component :is="item.icon" :size="18" class="nav-icon" />
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
          <button class="sidebar-item logout-item" @click="handleLogout" id="logout-btn">
            <LogOut :size="18" class="nav-icon" />
            <span>Cerrar Sesión</span>
          </button>

          <div class="status-card">
            <p class="status-label">Core Status</p>
            <div class="status-row">
              <div class="status-indicator">
                <div class="status-dot-inner" />
                <div class="status-dot-ping" />
              </div>
              <span class="status-text">Mainframe Active</span>
            </div>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- Main content -->
    <div class="main-area" id="main-content">
      <!-- Mobile top bar -->
      <div v-if="!isXl" class="mobile-topbar">
        <button
          class="hamburger-btn"
          @click="sidebarOpen = true"
          aria-label="Open menu"
          aria-controls="nav-sidebar"
          aria-expanded="false"
          id="menu-toggle-btn"
        >
          <Menu :size="22" />
        </button>
        <span class="mobile-title ag-text-gradient">AgroNexus AI</span>
        <div style="width: 40px;" />
      </div>

      <!-- Routed view -->
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: var(--ag-bg);
}

/* ── Sidebar ── */
.app-sidebar {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--ag-bg);
  border-right: 1px solid var(--ag-border);
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-mobile {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 4px 0 24px rgba(0,0,0,0.5);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.sidebar-brand {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: rgba(var(--ag-primary-rgb), 0.12);
  color: var(--ag-primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-name {
  font-size: 1rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
  color: var(--ag-text);
}

.brand-tagline {
  font-size: 8px;
  opacity: 0.4;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin: 0.15rem 0 0;
}

.sidebar-close-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: color 0.2s;
}

.sidebar-close-btn:hover { color: var(--ag-text); }

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-icon {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.logout-item {
  color: var(--ag-danger) !important;
}

.logout-item .nav-icon { color: var(--ag-danger); opacity: 1; }

/* Status card */
.status-card {
  padding: 1rem;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}

.status-label {
  font-size: 9px;
  opacity: 0.4;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 900;
  margin: 0 0 0.5rem;
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
  color: rgba(255,255,255,0.9);
}

@keyframes heartbeat {
  0% { transform: scale(1); opacity: 1; }
  15% { transform: scale(1.2); opacity: 0.8; }
  30% { transform: scale(1); opacity: 1; }
}

@keyframes ping {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.8); opacity: 0; }
}

/* ── Main area ── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* ── Mobile topbar ── */
.mobile-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--ag-bg);
  border-bottom: 1px solid var(--ag-border);
  flex-shrink: 0;
}

.hamburger-btn {
  background: transparent;
  border: none;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.35rem;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.hamburger-btn:hover {
  background: var(--ag-card);
  color: var(--ag-text);
}

.mobile-title {
  font-size: 1rem;
  font-weight: 800;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.sidebar-enter-active, .sidebar-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sidebar-enter-from, .sidebar-leave-to { transform: translateX(-100%); }

.page-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-leave-active { transition: opacity 0.15s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; }
</style>
