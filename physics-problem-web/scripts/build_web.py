"""Convert the repository's known LaTeX formats into a static, searchable bank.
No PDF viewer is used. Math is typeset by MathJax; TikZ is exported as SVG.
"""
from pathlib import Path
import re, json, html, argparse, subprocess, tempfile, shutil
ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
TIKZ = re.compile(r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}', re.S)

def group(s, i):
    while i < len(s) and s[i].isspace(): i += 1
    if i >= len(s) or s[i] != '{': raise ValueError(f'Expected group: {s[i:i+50]}')
    start, depth = i+1, 1
    i += 1
    while i < len(s):
        if s[i] == '{' and (i == 0 or s[i-1] != '\\'): depth += 1
        if s[i] == '}' and (i == 0 or s[i-1] != '\\'): depth -= 1
        if not depth: return s[start:i], i+1
        i += 1
    raise ValueError('Unbalanced LaTeX group')

def body(s, n):
    s = re.sub(r'(?m)(?<!\\)%.*$', '', s).strip()
    if s.startswith('\\problem'):
        first, i = group(s, len('\\problem'))
        second, j = group(s, i)
        s = (s[j:] if first.startswith('MEC-') else second+s[j:])
    s = re.sub(r'^\\section\*\{[^\n]+\}\s*', '', s)
    s = re.sub(r'^\\par\\noindent\\textbf\{\d+\.\}\\quad\s*', '', s)
    return s.strip()

def plain_render(s):
    """Parse only text-mode commands. Keep math untouched for MathJax."""
    out, i = [], 0
    while i < len(s):
        if s.startswith('\\[', i):
            j = s.index('\\]', i+2)+2
            out.append(html.escape(s[i:j])); i=j; continue
        if s[i] == '$':
            j=i+1
            while j < len(s) and (s[j] != '$' or s[j-1] == '\\'): j+=1
            if j == len(s): raise ValueError('Unclosed math delimiter')
            out.append('\\('+html.escape(s[i+1:j])+'\\)'); i=j+1; continue
        found=False
        for cmd, tag in [('thtxt', ''), ('textbf','strong')]:
            if s.startswith('\\'+cmd+'{', i):
                v,j=group(s,i+len(cmd)+1)
                out.append((f'<{tag}>' if tag else '')+plain_render(v)+(f'</{tag}>' if tag else '')); i=j; found=True; break
        if found: continue
        if s.startswith('\\choices', i):
            i += len('\\choices'); items=[]
            for _ in range(4):
                v,i=group(s,i); items.append('<li>'+plain_render(v)+'</li>')
            out.append('<ol class="choices">'+''.join(items)+'</ol>'); continue
        if s.startswith('\\begin{tabular}',i):
            _,j=group(s,i+len('\\begin{tabular}'))
            end=s.index('\\end{tabular}',j)
            cells=re.split(r'\\\\|&',s[j:end])
            out.append('<div class="choices-grid">'+''.join('<div>'+plain_render(c.strip())+'</div>' for c in cells if c.strip())+'</div>')
            i=end+len('\\end{tabular}'); continue
        m=re.match(r'\\begin\{enumerate\}(?:\[[^\]]*\])?',s[i:])
        if m: out.append('<ol>'); i+=len(m[0]); continue
        m=re.match(r'\\end\{enumerate\}',s[i:])
        if m: out.append('</li></ol>'); i+=len(m[0]); continue
        if s.startswith('\\item',i):
            out.append('</li><li>' if '<li>' in ''.join(out).split('<ol>')[-1] else '<li>'); i+=5; continue
        m=re.match(r'\\(?:begin|end)\{center\}|\\(?:par|medskip|smallskip|noindent|clearpage|small|quad|hfill)\b',s[i:])
        if m: out.append('<br>' if m[0] in ['\\par','\\clearpage'] else ' '); i+=len(m[0]); continue
        if s.startswith('\\\\',i): out.append('<br>'); i+=2; continue
        if s.startswith('\\,',i): out.append(' '); i+=2; continue
        if s.startswith('\\fcolorbox',i):
            _,j=group(s,i+len('\\fcolorbox')); _,j=group(s,j); v,i=group(s,j)
            v=re.sub(r'\\begin\{minipage\}\{[^}]*\}|\\end\{minipage\}', '',v)
            out.append('<aside class="hint">'+plain_render(v)+'</aside>'); continue
        if s.startswith('@@FIG',i):
            j=s.index('@@',i+2)+2; out.append(s[i:j]); i=j; continue
        if s.startswith('\n\n',i): out.append('<br><br>'); i+=2; continue
        out.append(html.escape(s[i])); i+=1
    return ''.join(out)

def export_diagram(code, dest):
    tex = r'''\documentclass[tikz,border=8pt]{standalone}
\usepackage{fontspec,amsmath,amssymb}
\setmainfont{Noto Serif Thai}
\usetikzlibrary{arrows.meta,calc,patterns,decorations.pathreplacing}
\begin{document}
''' + code + '\n\\end{document}\n'
    with tempfile.TemporaryDirectory() as td:
        p=Path(td); (p/'figure.tex').write_text(tex)
        result=subprocess.run(['xelatex','-interaction=nonstopmode','-halt-on-error','figure.tex'],cwd=p,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        if result.returncode: raise RuntimeError(result.stdout.decode(errors='replace')[-2000:])
        subprocess.run(['pdftocairo','-svg',str(p/'figure.pdf'),str(dest)],check=True)

def build(diagrams=False):
    raw=[]
    path=ROOT/'batches/01-10/main.tex'
    content=path.read_text()
    chunks=re.split(r'\\prob\{(MEC-\d+)\}\{[^}]*\}',content)[1:]
    for i in range(0,len(chunks),2):
        raw.append((int(chunks[i][-4:]),chunks[i+1].replace('\\end{document}','').strip(),path))
    for path in sorted((ROOT/'batches').glob('*/problems/*.tex')):
        n=int(path.stem[-4:]); raw.append((n,body(path.read_text(),n),path))
    problems=[]
    for n,s,path in sorted(raw):
        id=f'MEC-{n:04d}'; figures=[]
        def figure(m):
            name=f'{id}-{len(figures)+1}.svg'; dest=WEB/'assets'/name
            figures.append(name)
            if diagrams: export_diagram(m[0],dest)
            if not dest.exists(): raise RuntimeError(f'Missing diagram {name}; run --diagrams')
            return f'@@FIG{len(figures)-1}@@'
        text=TIKZ.sub(figure,s)
        rendered=plain_render(text)
        for i,name in enumerate(figures): rendered=rendered.replace(f'@@FIG{i}@@',f'<figure><img src="assets/{name}" alt="แผนภาพประกอบโจทย์ {id} รูปที่ {i+1}" loading="lazy"></figure>')
        source=re.search(r'\(([^()]*(?:สอวน|USO|IJSO)[^()]*)\)',s)
        topic='หน่วยและการวิเคราะห์มิติ' if 8<=n<=18 else 'การเคลื่อนที่แนวตรง' if n>=19 else 'พื้นฐานและคณิตศาสตร์ฟิสิกส์'
        problems.append(dict(id=id,number=n,topic=topic,source=source[1] if source else 'ไม่ระบุในต้นฉบับ',status='needs-review',html=rendered,latex=s,sourcePath=str(path.relative_to(ROOT)),hasDiagram=bool(figures),searchText=re.sub('<[^>]*>',' ',rendered)))
    assert len(problems)==60 and len({p['id'] for p in problems})==60
    (WEB/'problems.json').write_text(json.dumps(problems,ensure_ascii=False,indent=2)+'\n')
    print(f'Built {len(problems)} problems; {sum(p["hasDiagram"] for p in problems)} with diagrams')
if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--diagrams',action='store_true'); build(p.parse_args().diagrams)
