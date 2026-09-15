// Tiny, deliberately limited markdown renderer for the practice question bank.
// Handles: code fences, inline code, bold, italic, unordered lists, paragraphs.
// Anything fancier should be added explicitly — keep the surface small.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(s: string): string {
  // Escape first; then re-introduce inline formatting as HTML.
  let out = escapeHtml(s);
  // Inline code (must run before bold/italic so backtick contents aren't formatted)
  out = out.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);
  // Bold: **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* (avoid matching ** which is already replaced)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return out;
}

export function renderMarkdown(input: string): string {
  if (!input) return '';
  const lines = input.split('\n');
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence
      const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : '';
      blocks.push(`<pre${langAttr}><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    // Bullet list
    if (/^\s*-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*-\s+/, '');
        items.push(`<li>${renderInline(item)}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Blank line — paragraph break
    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Paragraph: gather consecutive non-blank, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !/^\s*-\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push(`<p>${renderInline(paraLines.join(' '))}</p>`);
  }

  return blocks.join('\n');
}
