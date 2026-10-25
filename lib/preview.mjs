import { bodyOf } from './catalog.mjs';
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
export function previewHTML(source, katex) {
  const warnings = new Set();
  let body = bodyOf(source);
  if (/\\(?:begin\{(?:tikzpicture|figure|tabular)|includegraphics|input|include|newcommand)/.test(source)) warnings.add('พบรูปภาพ TikZ ตาราง หรือคำสั่งเพิ่มเติมที่ตัวอย่างนี้ไม่รองรับ ให้ compile ต้นฉบับด้วย XeLaTeX เพื่อดูผลครบถ้วน');
  body = body.replace(/(?<!\\)%[^\n]*/g, '');
  const math = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$(?:\\.|[^$])*?\$|\\begin\{(equation\*?|align\*?|gather\*?)\}[\s\S]*?\\end\{\2\})/g;
  let html = '', last = 0;
  function prose(text) {
    if (/\\[a-zA-Z]+/.test(text.replace(/\\(?:textbf|textit|emph|section|subsection|item|begin|end|noindent|par|newpage|vspace|hspace)\b/g, ''))) warnings.add('มีคำสั่ง LaTeX ที่แสดงเป็นข้อความต้นฉบับในตัวอย่าง');
    return escape(text)
      .replace(/\\(?:textbf|section|subsection)\{([^{}]*)\}/g, '<strong>$1</strong>')
      .replace(/\\(?:textit|emph)\{([^{}]*)\}/g, '<em>$1</em>')
      .replace(/\\begin\{(?:enumerate|itemize)\}/g, '<div class="items">')
      .replace(/\\end\{(?:enumerate|itemize)\}/g, '</div>')
      .replace(/\\item\s*/g, '<br>• ')
      .replace(/\\(?:noindent|newpage)\b/g, '')
      .replace(/\\par\b|\\\\/g, '<br>')
      .replace(/\\([%&_$#{}])/g, '$1')
      .replace(/\n\s*\n/g, '<br><br>');
  }
  for (const match of body.matchAll(math)) {
    html += prose(body.slice(last, match.index));
    const raw = match[0];
    const display = raw.startsWith('$$') || raw.startsWith('\\[') || raw.startsWith('\\begin');
    const expression = raw.startsWith('$$') ? raw.slice(2, -2) : raw.startsWith('$') ? raw.slice(1, -1) : raw.startsWith('\\begin') ? raw.replace(/\\(begin|end)\{(equation\*?|align\*?|gather\*?)\}/g, (_, command, env) => `\\${command}{${env.startsWith('align') ? 'aligned' : 'gathered'}}`) : raw.slice(2, -2);
    try {
      if (!katex) throw new Error('โหลดตัวแสดงสมการไม่สำเร็จ');
      html += katex.renderToString(expression, { displayMode: display, throwOnError: true, trust: false, strict: 'ignore', maxExpand: 500, maxSize: 20 });
    } catch (error) {
      warnings.add(`สมการแสดงไม่ได้: ${error.message.slice(0, 180)}`);
      html += `<code class="raw-command">${escape(raw)}</code>`;
    }
    last = match.index + raw.length;
  }
  html += prose(body.slice(last));
  return { html, warnings: [...warnings] };
}

