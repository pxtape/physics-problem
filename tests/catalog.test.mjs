import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProblem, bodyOf } from '../lib/catalog.mjs';
import { previewHTML } from '../lib/preview.mjs';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = '% id: C1-001\n% title: ทดสอบ\n% camp: ค่าย 1\n% topic: กลศาสตร์\n% tags: แรง, มวล\n\\begin{document}หา $F=ma$\\end{document}';
test('reads Thai metadata and keeps original source', () => {
  const problem = parseProblem(source, 'content/camp-1/C1-001.tex');
  assert.equal(problem.title, 'ทดสอบ'); assert.deepEqual(problem.tags, ['แรง', 'มวล']); assert.equal(problem.source, source);
  assert.equal(bodyOf(source), 'หา $F=ma$');
});
test('rejects missing metadata and unsafe identifiers', () => {
  assert.throws(() => parseProblem('text'), /id/);
  assert.throws(() => parseProblem(source.replace('C1-001', '../outside')), /รหัส/);
});
test('preview escapes arbitrary HTML and catches invalid math', () => {
  const result = previewHTML('<img src=x onerror=alert(1)> $\\badcommand$', { renderToString() { throw new Error('unknown command'); } });
  assert.ok(!result.html.includes('<img')); assert.ok(result.html.includes('&lt;img')); assert.equal(result.warnings.length, 1);
});
test('preview sends inline and display math separately with trust disabled', () => {
  const calls = [];
  const result = previewHTML('แรง $F=ma$ และ \\[a=F/m\\]', { renderToString(tex, options) { calls.push({tex, options}); return '<span>math</span>'; } });
  assert.equal(calls.length, 2); assert.equal(calls[0].tex, 'F=ma'); assert.equal(calls[0].options.displayMode, false); assert.equal(calls[1].options.displayMode, true); assert.equal(calls[0].options.trust, false); assert.deepEqual(result.warnings, []);
});
test('unsupported figures are reported', () => {
  assert.ok(previewHTML('\\begin{tikzpicture}\\end{tikzpicture}', null).warnings.some(w=>w.includes('TikZ')));
});
test('bundled KaTeX renders supported equation environments', () => {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../web/vendor/katex.min.js', import.meta.url), 'utf8'), context);
  for (const env of ['equation', 'equation*', 'align', 'align*', 'gather']) {
    const result = previewHTML(`\\begin{${env}}a=\\frac{F}{m}\\end{${env}}`, context.katex);
    assert.deepEqual(result.warnings, [], env);
    assert.ok(result.html.includes('katex-display'), env);
  }
});
