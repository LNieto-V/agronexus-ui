<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps<{
  content: string;
}>();

const renderedHtml = computed(() => {
  let text = props.content;
  
  // Transform GitHub alerts syntax to standard markdown/HTML for better display
  text = text.replace(/>\s*\[!WARNING\]/gi, '> **⚠️ ADVERTENCIA:**<br/>');
  text = text.replace(/>\s*\[!INFO\]/gi, '> **ℹ️ INFORMACIÓN:**<br/>');
  text = text.replace(/>\s*\[!NOTE\]/gi, '> **📝 NOTA:**<br/>');
  text = text.replace(/>\s*\[!TIP\]/gi, '> **💡 CONSEJO:**<br/>');
  
  const rawHtml = marked.parse(text) as string;
  return DOMPurify.sanitize(rawHtml);
});
</script>

<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<style scoped>
.markdown-body {
  color: var(--ag-text);
  line-height: 1.6;
  font-size: 1rem;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: #fff;
  font-weight: 800;
  margin-top: 2rem;
  margin-bottom: 1rem;
  letter-spacing: -0.025em;
}

.markdown-body :deep(h1) { font-size: 1.875rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
.markdown-body :deep(h2) { font-size: 1.5rem; color: var(--ag-primary); }
.markdown-body :deep(h3) { font-size: 1.25rem; }

.markdown-body :deep(p) { margin-bottom: 1.25rem; }

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.markdown-body :deep(li) { margin-bottom: 0.5rem; }

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.markdown-body :deep(th) {
  background: rgba(var(--ag-primary-rgb), 0.1);
  color: var(--ag-primary);
  font-weight: 700;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.markdown-body :deep(td) {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.875rem;
}

.markdown-body :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-left: 4px solid var(--ag-primary);
  border-radius: 0 8px 8px 0;
}

.markdown-body :deep(strong) { color: #fff; }

.markdown-body :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}
</style>
