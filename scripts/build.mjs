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
if (new Set(records.map(p => p.id)).size !== records.length) throw new Error('รหัสโจทย์ซ้ำกัน');
records.sort((a, b) => a.id.localeCompare(b.id));
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'web'), path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'lib'), path.join(root, 'dist/lib'), { recursive: true });
await cp(path.join(root, 'content'), path.join(root, 'dist/content'), { recursive: true });
await writeFile(path.join(root, 'dist/catalog.json'), JSON.stringify(records, null, 2));
await writeFile(path.join(root, 'dist/.nojekyll'), '');
console.log(`Built ${records.length} problems → dist/`);
