<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps<{
  content: string;
  metadata: {
    zoneName: string;
    focusLabel: string;
    hours: number;
    date: string;
    reportId: string;
  }
}>();

const renderedContent = computed(() => {
  try {
    return DOMPurify.sanitize(marked.parse(props.content) as string);
  } catch (e) {
    return props.content;
  }
});
</script>

<template>
  <div class="pdf-container">
    <!-- Header -->
    <header class="pdf-header">
      <div class="header-main">
        <div class="logo-section">
          <img src="/assets/img/logo_report.png" alt="AgroNexus Logo" class="report-logo" />
          <div class="company-name">
            <h1>AGRONEXUS <span>AI</span></h1>
            <p>Intelligence | Technology | Innovation</p>
          </div>
        </div>
        <div class="report-meta-box">
          <div class="meta-item">
            <span class="label">REPORTE ID:</span>
            <span class="value">{{ props.metadata.reportId }}</span>
          </div>
          <div class="meta-item">
            <span class="label">FECHA:</span>
            <span class="value">{{ props.metadata.date }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Project Identity -->
    <div class="diagnostic-banner">
      <h2>DIAGNÓSTICO AGRONÓMICO DIGITAL</h2>
      <div class="focus-badge">{{ props.metadata.focusLabel }}</div>
    </div>

    <!-- Details Grid -->
    <div class="details-grid">
      <div class="detail-card">
        <div class="detail-label">ZONA DE MONITOREO</div>
        <div class="detail-value">{{ props.metadata.zoneName }}</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">RANGO DE ANÁLISIS</div>
        <div class="detail-value">Últimas {{ props.metadata.hours }} Horas</div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="pdf-body">
      <div class="markdown-content" v-html="renderedContent"></div>
    </main>

    <!-- Footer -->
    <footer class="pdf-footer">
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <p>&copy; 2026 AgroNexus AI Systems. Todos los derechos reservados.</p>
        <p>Generado automáticamente mediante Análisis de IA Avanzado.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.pdf-container {
  padding: 40px;
  background: white;
  color: #1a1a1a;
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
  width: 210mm; /* A4 Width */
  margin: 0 auto;
}

.pdf-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #10b981;
  padding-bottom: 20px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.report-logo {
  height: 60px;
  width: auto;
}

.company-name h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.company-name h1 span {
  color: #10b981;
}

.company-name p {
  margin: 0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748b;
}

.report-meta-box {
  text-align: right;
  background: #f8fafc;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.meta-item {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  font-size: 11px;
}

.meta-item .label {
  font-weight: 700;
  color: #64748b;
}

.diagnostic-banner {
  background: #0f172a;
  color: white;
  padding: 15px 25px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.diagnostic-banner h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.focus-badge {
  background: #10b981;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.detail-card {
  border: 1px solid #e2e8f0;
  padding: 12px 15px;
  border-radius: 8px;
}

.detail-label {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.pdf-body {
  min-height: 500px;
}

.markdown-content {
  font-size: 13px;
  color: #334155;
  line-height: 1.6;
}

:deep(.markdown-content h2) {
  color: #0f172a;
  font-size: 18px;
  margin-top: 25px;
  border-left: 4px solid #10b981;
  padding-left: 12px;
}

:deep(.markdown-content h3) {
  color: #0f172a;
  font-size: 15px;
  margin-top: 20px;
}

:deep(.markdown-content table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

:deep(.markdown-content th) {
  background: #f1f5f9;
  text-align: left;
  padding: 10px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
}

:deep(.markdown-content td) {
  padding: 10px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
}

.pdf-footer {
  margin-top: 50px;
}

.footer-divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 15px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94a3b8;
}

.footer-bottom p {
  margin: 0;
}
</style>
