import { readdir, readFile, mkdir, cp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseProblem } from '../lib/catalog.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const records = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith('.tex')) records.push(parseProblem(await readFile(file, 'utf8'), path.relative(root, file).split(path.sep).join('/')));
  }
}
await walk(path.join(root, 'content'));
for (const record of records) {
  if (record.diagram) {
    if (!/^[a-zA-Z0-9_-]+\.svg$/.test(record.diagram)) throw new Error(`${record.id}: ชื่อไฟล์รูปไม่ถูกต้อง`);
    await readFile(path.join(root, path.dirname(record.file), record.diagram));
  }
  if (record.scan) {
    if (!/^sources\/[a-zA-Z0-9_-]+\.png$/.test(record.scan)) throw new Error(`${record.id}: พาธภาพต้นฉบับไม่ถูกต้อง`);
    await readFile(path.join(root, record.scan));
  }
}
if (new Set(records.map(p => p.id)).size !== records.length) throw new Error('รหัสโจทย์ซ้ำกัน');
records.sort((a, b) => a.id.localeCompare(b.id));
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'web'), path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'lib'), path.join(root, 'dist/lib'), { recursive: true });
await cp(path.join(root, 'content'), path.join(root, 'dist/content'), { recursive: true });
await cp(path.join(root, 'sources'), path.join(root, 'dist/sources'), { recursive: true });
await writeFile(path.join(root, 'dist/catalog.json'), JSON.stringify(records, null, 2));
await writeFile(path.join(root, 'dist/.nojekyll'), '');
console.log(`Built ${records.length} problems → dist/`);
