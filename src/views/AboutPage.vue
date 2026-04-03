<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">AgroNexus System</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ag-container py-8">
        
        <!-- Hero Section -->
        <div class="hero-section mb-12 p-8 md:p-12 rounded-[32px] overflow-hidden relative">
          <div class="hero-gradient absolute inset-0"></div>
          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <ion-icon :icon="leafOutline" class="text-4xl text-primary" />
            </div>
            <h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              AgroNexus <span class="text-primary">AI</span>
            </h1>
            <p class="text-lg text-muted max-w-xl leading-relaxed">
              The next generation of autonomous hydroponics. Powered by AI, designed for the future of sustainable agriculture.
            </p>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="ag-grid md:ag-grid-3 gap-6 mb-12">
          <div class="ag-card p-6 flex flex-col gap-4">
            <div class="ag-icon-box bg-blue-soft text-blue">
              <ion-icon :icon="pulseOutline" />
            </div>
            <h3 class="text-xl font-bold">Real-time Pulse</h3>
            <p class="text-sm text-muted">Advanced sensors monitoring EC, pH, humidity, and temperature every 5 seconds.</p>
          </div>
          
          <div class="ag-card p-6 flex flex-col gap-4">
            <div class="ag-icon-box bg-primary-soft text-primary">
              <ion-icon :icon="sparklesOutline" />
            </div>
            <h3 class="text-xl font-bold">AI Core</h3>
            <p class="text-sm text-muted">Intelligent automation adjusting nutrient delivery and growth lighting schedules.</p>
          </div>

          <div class="ag-card p-6 flex flex-col gap-4">
            <div class="ag-icon-box bg-purple-soft text-purple">
              <ion-icon :icon="shieldCheckmarkOutline" />
            </div>
            <h3 class="text-xl font-bold">Secure Access</h3>
            <p class="text-sm text-muted">Enterprise-grade API gateway for external AgTech integration and protocols.</p>
          </div>
        </div>

        <!-- About Content -->
        <div class="ag-grid md:ag-grid-2 gap-8 items-start">
          <div class="p-4">
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
              <ion-icon :icon="informationCircleOutline" class="text-primary" />
              Vision & Mission
            </h2>
            <div class="space-y-4 text-muted leading-relaxed">
              <p>
                AgroNexus AI was born from the need to bridge the gap between advanced technology and small-scale urban agriculture. Our system leverages cutting-edge LLMs and IoT protocols to make professional hydroponics accessible to everyone.
              </p>
              <p>
                From automated nutrient dosing to predictive pest management, AgroNexus provides a full-stack solution for modern farmers who demand precision and reliability.
              </p>
            </div>
          </div>

          <div class="ag-card p-8 bg-zinc-900/50">
            <h2 class="text-xl font-bold mb-6">System Architecture</h2>
            <div class="space-y-6">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">01</div>
                <div>
                  <p class="font-bold text-sm">Edge Computing</p>
                  <p class="text-xs text-muted">ESP32 & Raspberry Pi IoT Node</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">02</div>
                <div>
                  <p class="font-bold text-sm">Cloud Infrastructure</p>
                  <p class="text-xs text-muted">FastAPI & Supabase High-Latency Store</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">03</div>
                <div>
                  <p class="font-bold text-sm">AI Integration</p>
                  <p class="text-xs text-muted">Gemini 1.5 Flash Reasoning Engine</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center p-8 border-t border-white/5">
          <p class="text-xs text-muted uppercase tracking-[0.3em]">AgroNexus AI &bull; Version 2.5 &bull; Global Operations</p>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonIcon, IonButtons, IonMenuButton 
} from '@ionic/vue';
import { 
  leafOutline, sparklesOutline, pulseOutline, shieldCheckmarkOutline,
  informationCircleOutline
} from 'ionicons/icons';
</script>

<style scoped>
.hero-section {
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
}
.hero-gradient {
  background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 40%),
              radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent 40%);
}
.hero-section h1 {
  background: linear-gradient(to right, #fff, #a1a1aa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
