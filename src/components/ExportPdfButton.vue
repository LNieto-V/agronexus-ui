<script setup lang="ts">
import { Download } from 'lucide-vue-next';

const props = defineProps<{
  elementId?: string;
  htmlContent?: string;
  title?: string;
  iconSize?: number;
  showText?: boolean;
}>();

function exportPdf() {
  let content = props.htmlContent;
  if (!content && props.elementId) {
    const el = document.getElementById(props.elementId);
    if (el) content = el.innerHTML;
  }
  if (!content) return;

  const pw = window.open('', '_blank');
  if (!pw) return;
  
  // Utilizar table-layout: auto y word-wrap para que las columnas no se descudren
  pw.document.write(`
    <html>
      <head>
        <title>${props.title || 'AgroNexus AI Report'}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.5; }
          h1, h2, h3 { color: #10b981; margin-top: 1.5em; }
          /* Fix for table last column misalignment */
          table { width: 100%; border-collapse: collapse; margin: 20px 0; table-layout: auto; }
          th { background: #10b981; color: white; padding: 12px; text-align: left; }
          td { border: 1px solid #eee; padding: 12px; word-wrap: break-word; vertical-align: top; }
          ul, ol { margin-bottom: 20px; }
          li { margin-bottom: 8px; }
          .meta { font-size: 12px; color: #888; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            button, .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${content}
        <div class="meta">Exportado por AgroNexus AI el ${new Date().toLocaleString()}</div>
      </body>
    </html>
  `);
  pw.document.close();
  
  // Esperar un momento a que los estilos se apliquen antes de imprimir
  setTimeout(() => {
    pw.focus();
    pw.print();
    pw.close();
  }, 250);
}
</script>

<template>
  <button class="dl-btn no-print" @click.stop="exportPdf" title="Descargar como PDF">
    <Download :size="iconSize || 13" />
    <span v-if="showText" class="btn-text">Descargar PDF</span>
    <slot></slot>
  </button>
</template>

<style scoped>
.dl-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-family: inherit;
}

.dl-btn:hover { 
  opacity: 0.8;
  color: var(--ag-primary, #10b981); 
}

.btn-text {
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
