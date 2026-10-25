import { camps, topics, parseProblem } from './lib/catalog.mjs';
import { previewHTML } from './lib/preview.mjs';
const $ = id => document.getElementById(id);
const KEY = 'physics-archive-drafts-v1';
let catalog = [], drafts = [], mode = 'all', active = null;
const template = `% id: CAMP1-MEC-001
% title: การเคลื่อนที่บนพื้นราบ
% camp: ค่าย 1
% topic: กลศาสตร์
% year: 2569
% tags: กฎของนิวตัน, แรง
\\documentclass{article}
\\usepackage{amsmath,amssymb,fontspec,polyglossia}
\\setdefaultlanguage{thai}
\\setmainfont{Noto Serif Thai}
\\begin{document}
วัตถุมวล $m$ ถูกแรงคงที่ $F$ กระทำบนพื้นราบลื่น จงหาความเร่งของวัตถุ

\\[
a = \\frac{F}{m}
\\]
\\end{document}
`;
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function toast(text) { $('toast').textContent = text; $('toast').style.display = 'block'; clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').style.display = 'none', 3500); }
function loadDrafts() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(saved)) throw new Error();
    drafts = saved.map(p => parseProblem(p.source));
  } catch { drafts = []; toast('อ่านแบบร่างไม่ได้ ข้อมูลเดิมยังอยู่ในพื้นที่จัดเก็บเบราว์เซอร์'); }
}
function persist(next) { try { localStorage.setItem(KEY, JSON.stringify(next)); drafts = next; return true; } catch { $('editor-message').textContent = 'บันทึกไม่ได้ พื้นที่จัดเก็บเต็มหรือถูกปิด กรุณาดาวน์โหลด .tex เพื่อเก็บไฟล์'; return false; } }
function options(id, values, label) {
  const select = $(id), value = select.value;
  select.replaceChildren(new Option(label, ''));
  for (const item of [...new Set(values)].filter(Boolean).sort((a,b) => a.localeCompare(b, 'th', {numeric:true}))) select.add(new Option(item, item));
  select.value = value;
}
function update() {
  $('total').textContent = catalog.length;
  $('side-total').textContent = catalog.length;
  $('draft-total').textContent = drafts.length;
  $('camp-count').textContent = new Set(catalog.map(p => p.camp)).size;
  $('topic-count').textContent = new Set(catalog.map(p => p.topic)).size;
  const records = mode === 'drafts' ? drafts : catalog;
  options('camp', [...camps, ...records.map(p => p.camp)], 'ทุกค่าย');
  options('topic', [...topics, ...records.map(p => p.topic)], 'ทุกเนื้อหา');
  options('year', records.map(p => p.year), 'ทุกปี');
  $('camp-nav').replaceChildren();
  for (const camp of [...new Set([...camps, ...catalog.map(p=>p.camp)])]) {
    const button = el('button', 'side-nav' + (mode === 'all' && $('camp').value === camp ? ' active' : ''));
    button.append(el('span', 'camp-dot'), document.createTextNode(camp), el('b', '', catalog.filter(p=>p.camp===camp).length));
    button.onclick = () => { mode = 'all'; $('camp').value = camp; update(); };
    $('camp-nav').append(button);
  }
  $('all-nav').classList.toggle('active', mode === 'all' && !$('camp').value);
  $('draft-nav').classList.toggle('active', mode === 'drafts');
  render();
}
function render() {
  $('list-title').textContent = mode === 'drafts' ? 'แบบร่างในเครื่อง' : $('camp').value || 'โจทย์ทั้งหมด';
  const query = $('search').value.trim().toLocaleLowerCase();
  const records = mode === 'drafts' ? drafts : catalog;
  const filtered = records.filter(p => (!$('camp').value || p.camp === $('camp').value) && (!$('topic').value || p.topic === $('topic').value) && (!$('year').value || p.year === $('year').value) && [p.id, p.title, p.camp, p.topic, p.year, ...p.tags, p.source].join(' ').toLocaleLowerCase().includes(query));
  $('result-count').textContent = `${filtered.length} / ${records.length} ข้อ`;
  const list = $('problem-list'); list.replaceChildren();
  if (!filtered.length) {
    const empty = el('div', 'empty');
    const initial = records.length === 0;
    empty.append(el('div', 'empty-icon', '▤'), el('h3', '', initial ? (mode === 'drafts' ? 'พื้นที่สำหรับโจทย์ที่กำลังเรียบเรียง' : 'พร้อมสำหรับโจทย์ข้อแรกของคุณ') : 'ไม่พบโจทย์ที่ตรงกับตัวกรอง'), el('p', '', initial ? 'เริ่มจากไฟล์ LaTeX หนึ่งไฟล์ จัดหมวดตามค่ายและเนื้อหา\nแล้วค่อย ๆ สร้างคลังโจทย์ในแบบของคุณ' : 'ลองค้นหาด้วยคำอื่น หรือเลือกค่ายและเนื้อหาใหม่'));
    const button = el('button', 'primary', initial ? '＋ เพิ่มโจทย์แรก' : 'ล้างตัวกรอง');
    button.onclick = initial ? () => openEditor() : reset; empty.append(button);
    if (initial) { const link = el('button', 'quiet', 'ดูวิธีเพิ่มไฟล์เข้า repository ↗'); link.onclick = () => $('guide').showModal(); empty.append(link); }
    list.append(empty); return;
  }
  for (const p of filtered) {
    const row = el('article', 'problem-row');
    const main = el('div', 'problem-main'); main.append(el('span', 'problem-code', p.id), el('h3', '', p.title));
    const meta = el('div', 'problem-meta');
    for (const text of [p.camp, p.topic, p.year, ...p.tags]) if (text) meta.append(el('span', '', text));
    if (mode === 'drafts') meta.append(el('span', '', 'แบบร่าง · เฉพาะเครื่องนี้'));
    main.append(meta); const button = el('button', 'secondary', 'เปิดโจทย์ ↗'); button.onclick = () => openEditor(p);
    row.append(el('div', 'file-symbol', '.tex'), main, button);
    if (mode === 'drafts') { const remove = el('button', 'quiet', 'ลบ'); remove.onclick = () => { if (confirm(`ลบแบบร่าง ${p.id} จากเบราว์เซอร์นี้?`) && persist(drafts.filter(d=>d.id!==p.id))) update(); }; row.append(remove); }
    list.append(row);
  }
}
function reset() { $('search').value = ''; for (const id of ['camp','topic','year']) $(id).value = ''; update(); }
let originalSource = '';
function openEditor(p = null) {
  active = p; $('editor-title').textContent = p ? p.title : 'เพิ่มโจทย์ LaTeX';
  $('file-origin').textContent = p?.file || (p ? 'แบบร่างในเครื่อง' : 'ไฟล์ใหม่ · ยังไม่บันทึก');
  $('source').value = p?.source || template; originalSource = $('source').value;
  $('editor-message').textContent = ''; preview(); $('editor').showModal();
}
function preview() {
  const target = $('preview'); target.replaceChildren();
  try {
    const p = parseProblem($('source').value);
    target.append(el('div', 'preview-meta', `${p.id} · ${p.camp} / ${p.topic}${p.year ? ' / ' + p.year : ''}`), el('h3', '', p.title));
  } catch (error) { target.append(el('div', 'unsupported', error.message)); }
  const rendered = previewHTML($('source').value, window.katex);
  const content = el('div'); content.innerHTML = rendered.html; target.append(content);
  for (const warning of rendered.warnings) target.append(el('div', 'unsupported', warning));
}
function closeEditor() {
  if ($('source').value !== originalSource && !confirm('มีการแก้ไขที่ยังไม่ได้บันทึกหรือดาวน์โหลด ต้องการปิดหรือไม่?')) return;
  $('editor').close();
}
$('new-problem').onclick = () => openEditor();
$('close-editor').onclick = closeEditor;
$('editor').addEventListener('cancel', e => { e.preventDefault(); closeEditor(); });
$('guide-button').onclick = () => $('guide').showModal(); $('close-guide').onclick = () => $('guide').close();
$('reset').onclick = reset;
$('all-nav').onclick = () => { mode = 'all'; reset(); };
$('draft-nav').onclick = () => { mode = 'drafts'; reset(); };
$('search').oninput = render; for (const id of ['camp','topic','year']) $(id).onchange = update;
$('source').oninput = () => { clearTimeout(preview.timer); preview.timer = setTimeout(preview, 200); };
$('template-button').onclick = () => { if ($('source').value !== template && !confirm('แทนที่ข้อความปัจจุบันด้วยแม่แบบ?')) return; $('source').value = template; preview(); };
$('import-file').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 1024 * 1024) { $('editor-message').textContent = 'รองรับไฟล์ข้อความขนาดไม่เกิน 1 MB'; e.target.value = ''; return; }
  if ($('source').value !== originalSource && !confirm('แทนที่ข้อความที่กำลังแก้ไขด้วยไฟล์นำเข้า?')) { e.target.value = ''; return; }
  try { $('source').value = await file.text(); $('file-origin').textContent = file.name; preview(); } catch { $('editor-message').textContent = 'อ่านไฟล์ไม่ได้ กรุณาลองอีกครั้ง'; }
  e.target.value = '';
};
$('editor-form').onsubmit = e => {
  e.preventDefault();
  try {
    const p = parseProblem($('source').value);
    if (drafts.some(d=>d.id===p.id && d.id!==active?.id) && !confirm(`มีแบบร่างรหัส ${p.id} แล้ว ต้องการแทนที่หรือไม่?`)) return;
    const next = drafts.filter(d=>d.id!==p.id && !(active && !active.file && d.id===active.id));
    if (!persist([...next, p])) return;
    active = p; originalSource = p.source; $('editor-message').textContent = 'บันทึกแบบร่างในเบราว์เซอร์นี้แล้ว ดาวน์โหลด .tex เพื่อเพิ่มเข้า repository'; update(); toast('บันทึกแบบร่างแล้ว');
  } catch (error) { $('editor-message').textContent = error.message; }
};
$('download').onclick = () => {
  try {
    const p = parseProblem($('source').value);
    const url = URL.createObjectURL(new Blob([p.source], { type:'text/plain;charset=utf-8' }));
    const link = el('a'); link.href = url; link.download = `${p.id}.tex`; link.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
    originalSource = p.source; toast('ดาวน์โหลดไฟล์แล้ว นำไปวางใน content/ เพื่อเพิ่มเข้าคลัง');
  } catch (error) { $('editor-message').textContent = error.message; }
};
window.addEventListener('beforeunload', e => { if ($('editor').open && $('source').value !== originalSource) { e.preventDefault(); e.returnValue = ''; } });
loadDrafts();
try {
  const response = await fetch('catalog.json'); if (!response.ok) throw new Error();
  const data = await response.json(); if (!Array.isArray(data)) throw new Error();
  catalog = data.map(p => parseProblem(p.source, p.file));
} catch { $('load-error').hidden = false; $('load-error').textContent = 'โหลดคลังจาก repository ไม่สำเร็จ กรุณารีเฟรชหน้า แบบร่างในเครื่องยังเปิดได้'; }
update();
const id = new URLSearchParams(location.search).get('id');
if (id) { const problem = catalog.find(p => p.id === id); if (problem) openEditor(problem); else toast('ไม่พบรหัสโจทย์นี้ในคลัง'); }

