export const camps = ['ค่าย 1', 'ค่าย 2', 'ค่าย TPhO', 'อื่น ๆ'];
export const topics = ['กลศาสตร์', 'คลื่นและเสียง', 'แสง', 'ไฟฟ้าและแม่เหล็ก', 'ความร้อน', 'ฟิสิกส์ยุคใหม่', 'อื่น ๆ'];
export function parseProblem(source, file = '') {
  const metadata = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^%\s*(id|title|camp|topic|year|tags|origin|review|diagram|scan):\s*(.*)$/);
    if (match) metadata[match[1]] = match[2].trim();
  }
  for (const key of ['id', 'title', 'camp', 'topic']) if (!metadata[key]) throw new Error(`${file}: ต้องระบุ % ${key}:`);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(metadata.id)) throw new Error('รหัสต้องเป็นตัวอักษรอังกฤษ ตัวเลข - หรือ _ ไม่เกิน 80 ตัว');
  return { ...metadata, year: metadata.year || '', tags: (metadata.tags || '').split(',').map(s => s.trim()).filter(Boolean), source, file };
}
export function bodyOf(source) {
  return (source.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/)?.[1] ?? source).replace(/^%.*$/gm, '').trim();
}
