// Graph coordinates are shared between SVG preview and TikZ source.
// Run from any directory to regenerate this transcribed batch.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const choices = String.raw`
1. $\dfrac{T}{2}$

2. $T\left(1+\dfrac{1}{\sqrt{2}}\right)$

3. $\dfrac{3T}{2}$

4. $T\left(2-\dfrac{1}{\sqrt{2}}\right)$`;
const vertical = { points:[[0,3],[2,0],[3.6,-2.4]], xmax:5, ymin:-2.8,ymax:4.8, xticks:[[2,'T']], yticks:[], xlabel:'เวลา',ylabel:'ความเร็ว',grid:false };
const problems = [
{n:34,title:'การกระจัดและระยะทางจากกราฟตำแหน่ง–เวลา',origin:'สอวน. ม.4 2549',year:'2549',tags:'สอวน., ม.4, การกระจัด, ระยะทาง, กราฟตำแหน่ง–เวลา',
body:String.raw`อนุภาคหนึ่งกำลังเคลื่อนที่ในแนวเส้นตรง รูปข้างล่างแสดงให้เห็นกราฟตำแหน่งของอนุภาคเทียบกับจุดอ้างอิงที่เวลาต่าง ๆ โดยที่ได้เลือกเครื่องหมายบวกให้แทนทิศขวามือของจุดอ้างอิง

34.1 จงหาการกระจัดของอนุภาคนี้ตั้งแต่เวลา $t=0\ \mathrm{s}$ ไปจนถึงเวลา $t=7\ \mathrm{s}$

34.2 จงหาระยะทางที่อนุภาคเคลื่อนที่ในช่วงเวลานี้ด้วย`,
graph:{points:[[0,1],[3,5],[4,2],[5,2],[7,3],[8,3]],xmax:8.7,ymin:-.6,ymax:6.6,xticks:[1,2,3,4,5,6,7,8].map(n=>[n,String(n)]),yticks:[1,2,3,4,5,6].map(n=>[n,String(n)]),xlabel:'t (s)',ylabel:'x (m)',grid:true}},
{n:35,title:'ขนาดการกระจัดจากกราฟความเร็ว–เวลา',origin:'IJSO รอบที่ 1 2557',year:'2557',tags:'IJSO, รอบที่ 1, การกระจัด, กราฟความเร็ว–เวลา',
body:String.raw`วัตถุชิ้นหนึ่งเคลื่อนที่ในหนึ่งมิติ ด้วยความเร็วที่เวลาต่าง ๆ ดังกราฟ โดยตอนแรกวัตถุมีความเร็ว $12\ \mathrm{m/s}$ และเมื่อเวลาผ่านไป $10\ \mathrm{s}$ วัตถุมีความเร็ว $18\ \mathrm{m/s}$ จงหาขนาดของการกระจัดของวัตถุในช่วงเวลา $10\ \mathrm{s}$ นี้`,
after:String.raw`1. $24\ \mathrm{m}$

2. $36\ \mathrm{m}$

3. $48\ \mathrm{m}$

4. $60\ \mathrm{m}$`,
note:'ต้นฉบับวงตัวเลือก 1 ไว้ แต่ไม่ได้บันทึกเป็นเฉลยที่ตรวจสอบแล้ว จุดต่ำสุดในกราฟไม่มีตัวเลขกำกับ จึงไม่เพิ่มป้ายค่าที่จุดนั้น',
graph:{points:[[0,12],[7,-9],[10,18]],xmax:13,ymin:-12,ymax:23,xticks:[[4,'4'],[8,'8'],[10,'10']],yticks:[[12,'12'],[18,'18']],xlabel:'t (s)',ylabel:'v (m/s)',guides:[[[0,18],[10,18]],[[10,0],[10,18]]],grid:false}},
{n:36,title:'เวลาเมื่ออัตราเร็วขาลงเป็นครึ่งหนึ่งของอัตราเร็วต้น',origin:'IJSO รอบที่ 1 2553',year:'2553',tags:'IJSO, รอบที่ 1, การโยนในแนวดิ่ง, กราฟความเร็ว–เวลา',
body:String.raw`อนุภาคหนึ่งถูกโยนขึ้นในแนวดิ่งภายใต้สนามโน้มถ่วง $g$ กราฟความเร็ว–เวลาเป็นดังรูป (ทิศขึ้นแทนด้วยเครื่องหมายบวก) ตอนขาลง เมื่ออนุภาคมีอัตราเร็วครึ่งหนึ่งของอัตราเร็วต้น เวลาผ่านไปเท่าใดนับจากเริ่มโยน`,after:choices,graph:vertical},
{n:37,title:'เวลาเมื่ออนุภาคขาลงอยู่ที่ครึ่งหนึ่งของความสูงสูงสุด',origin:'IJSO รอบที่ 1 2552',year:'2552',tags:'IJSO, รอบที่ 1, การโยนในแนวดิ่ง, ความสูงสูงสุด, กราฟความเร็ว–เวลา',
body:String.raw`อนุภาคหนึ่งถูกโยนขึ้นในแนวดิ่งให้เคลื่อนที่ภายใต้สนามโน้มถ่วง $g$ กราฟความเร็ว–เวลาของอนุภาค เป็นดังรูปข้างล่าง (ทิศขึ้นเป็นทิศที่แทนด้วยเครื่องหมายบวก) ตอนขาลง เมื่ออนุภาคอยู่ที่ตำแหน่งครึ่งหนึ่งของความสูงสูงสุด เวลาผ่านไปเท่าใดนับจากเริ่มโยน`,after:choices,graph:vertical},
{n:38,title:'การกระจัดมากที่สุดและกราฟความเร่งจากกราฟความเร็ว',origin:'IJSO รอบที่ 2 2552',year:'2552',tags:'IJSO, รอบที่ 2, การกระจัด, ความเร่ง, กราฟความเร็ว–เวลา',
body:String.raw`ข้างล่างเป็นกราฟของความเร็วเทียบกับเวลาของวัตถุหนึ่งซึ่งกำลังเคลื่อนที่ในแนวเส้นตรง

ก. การกระจัดของวัตถุจากตำแหน่งตั้งต้นมีขนาดมากที่สุดเท่าใด

ข. จงเขียนกราฟของความเร่งของวัตถุเทียบเท่ากับเวลา`,
graph:{points:[[0,2],[1,4],[1.5,4],[3,-2]],xmax:3.55,ymin:-2.8,ymax:5,xticks:[[1,'1'],[2,'2'],[3,'3']],yticks:[[-2,'−2'],[0,'0'],[2,'2'],[4,'4']],minorX:[.5,1.5,2.5],minorY:[-1,1,3],xlabel:'เวลา (s)',ylabel:'ความเร็ว (m/s)',grid:false}}
];
const escape = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function drawGraph(g) {
  const W=660,H=400,L=83,R=110,TOP=48,B=53;
  const sx=(W-L-R)/g.xmax,sy=(H-TOP-B)/(g.ymax-g.ymin);
  const xy=([x,y])=>[L+x*sx,TOP+(g.ymax-y)*sy];
  const point=p=>xy(p).map(v=>v.toFixed(2)).join(',');
  const number=v=>Number(v.toFixed(4));
  const lines=[],tex=[];
  const line=(points,dashed=false,arrow=false)=>{
    lines.push(`<polyline points="${points.map(point).join(' ')}" fill="none" stroke="#293b34" stroke-width="${dashed?1.3:2}"${dashed?' stroke-dasharray="6 6"':''}${arrow?' marker-end="url(#arrow)"':''}/>`);
    tex.push(`\\draw[${dashed?'dashed,':''}${arrow?'->,':''}line width=${dashed?'.4':'.7'}pt] ${points.map(p=>`(${p.map(number).join(',')})`).join(' -- ')};`);
  };
  const label=(x,y,text,anchor='middle',latex=text)=>{
    const [px,py]=xy([x,y]);
    lines.push(`<text x="${px.toFixed(2)}" y="${py.toFixed(2)}" text-anchor="${anchor}" dominant-baseline="middle">${escape(text)}</text>`);
    tex.push(`\\node[anchor=${anchor==='end'?'east':anchor==='start'?'west':'center'}] at (${number(x)},${number(y)}) {${latex}};`);
  };
  if(g.grid){for(const [x] of g.xticks)line([[x,0],[x,6.5]],true);for(const [y] of g.yticks)line([[0,y],[8.4,y]],true);}
  for(const guide of g.guides||[])line(guide,true);
  line([[-.18,0],[g.xmax,0]],false,true);line([[0,g.ymin],[0,g.ymax]],false,true);
  // Tick lengths and label offsets are expressed in plot units.
  const dx=5/sx,dy=5/sy;
  for(const [x,text] of g.xticks){line([[x,-dy],[x,dy]]);label(x,-20/sy,text,'middle',text==='T'?'$T$':text);}
  for(const [y,text] of g.yticks){line([[-dx,y],[0,y]]);label(-12/sx,y,text,'end',text==='−2'?'$-2$':text);}
  for(const x of g.minorX||[])line([[x,-dy],[x,0]]);
  for(const y of g.minorY||[])line([[-dx,y],[0,y]]);
  if(!g.yticks.some(([y])=>y===0))label(-8/sx,-16/sy,'0','end','0');
  label(g.xmax+8/sx,-2/sy,g.xlabel,'start',g.xlabel==='t (s)'?'$t$ (s)':g.xlabel);
  label(-8/sx,g.ymax+16/sy,g.ylabel,'start',g.ylabel==='x (m)'?'$x$ (m)':g.ylabel==='v (m/s)'?'$v$ (m/s)':g.ylabel);
  line(g.points);
  return {
    svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟ${escape(g.ylabel)}เทียบกับ${escape(g.xlabel)}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#293b34"/></marker></defs><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" font-size="17" fill="#293b34">${lines.join('\n')}</g></svg>\n`,
    tikz:`\\begin{tikzpicture}[x=${(sx/75).toFixed(5)}cm,y=${(sy/75).toFixed(5)}cm,>=Stealth]\n${tex.join('\n')}\n\\end{tikzpicture}`
  };
}
const dir=new URL('content/unspecified/kinematics/',root); await mkdir(dir,{recursive:true});
for(const p of problems){
  const id=`PHY-${String(p.n).padStart(4,'0')}`, graph=drawGraph(p.graph);
  const source=`% id: ${id}\n% title: ${p.title}\n% camp: อื่น ๆ\n% topic: การเคลื่อนที่แนวตรง\n% year: ${p.year}\n% tags: ${p.tags}\n% origin: ${p.origin} · ข้อ ${p.n} ในภาพที่ผู้ใช้ส่ง\n% review: ถอดจากภาพแล้ว · รอตรวจทาน\n% diagram: ${id}.svg\n% scan: sources/${id}-original.png\n${p.note?'% transcription-note: '+p.note+'\n':''}\\documentclass[12pt]{article}\n\\usepackage{amsmath,amssymb,fontspec,polyglossia,tikz}\n\\setdefaultlanguage{thai}\n\\setmainfont{Noto Serif Thai}\n\\usetikzlibrary{arrows.meta}\n\\begin{document}\n\\textbf{ข้อ ${p.n}.} (${p.origin})\n${p.body}\n\n${graph.tikz}\n${p.after?'\n'+p.after+'\n':''}\\end{document}\n`;
  await writeFile(new URL(`${id}.tex`,dir),source);await writeFile(new URL(`${id}.svg`,dir),graph.svg);
}
console.log(`Generated ${problems.length} problems in ${fileURLToPath(dir)}`);
