'use strict';
const $ = id => document.getElementById(id);
let problems=[], visible=10, mode='bank', current=null, renderQueue=Promise.resolve();
let selected;
try { selected=new Set(JSON.parse(localStorage.getItem('physics-set-v1')||'[]')); } catch { selected=new Set(); }
function notify(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
function save(){try{localStorage.setItem('physics-set-v1',JSON.stringify([...selected]));}catch{notify('เบราว์เซอร์ไม่อนุญาตให้บันทึกชุดนี้');}$('set-count').textContent=selected.size;}
function toggle(id){selected.has(id)?selected.delete(id):selected.add(id);save();render();if(current)updateDetailButton();}
function filtered(){const q=$('search').value.trim().toLowerCase(),topic=$('topic').value,source=$('source').value;return problems.filter(p=>(mode!=='set'||selected.has(p.id))&&(!q||(p.id+' '+p.source+' '+p.topic+' '+p.searchText).toLowerCase().includes(q))&&(!topic||p.topic===topic)&&(!source||(source==='unknown'?p.source==='ไม่ระบุในต้นฉบับ':p.source.includes(source)))&&(!$('diagram-only').checked||p.hasDiagram));}
function typeset(node){renderQueue=renderQueue.catch(()=>{}).then(async()=>{if(window.MathJax?.startup?.promise){await MathJax.startup.promise;if(node.isConnected)await MathJax.typesetPromise([node]);}}).catch(()=>{$('math-notice').hidden=false;});}
function clearMath(node){window.MathJax?.typesetClear?.([node]);}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function card(p){const article=el('article','problem');article.id=p.id;
 const top=el('div','problem-top');top.append(el('span','problem-id',p.id),el('span','tag',p.topic),el('span','review','○ รอตรวจทาน'));
 const body=el('div','problem-body');body.innerHTML=p.html;
 const bottom=el('div','problem-bottom');bottom.append(el('span','problem-source',p.source));
 const detail=el('button','detail-btn','อ่านรายข้อ ↗');detail.addEventListener('click',()=>openDetail(p.id));
 const pick=el('button','select-btn',selected.has(p.id)?'✓ อยู่ในชุดแล้ว':'+ เพิ่มเข้าชุด');pick.setAttribute('aria-pressed',selected.has(p.id));pick.setAttribute('aria-label',`เพิ่มหรือนำ ${p.id} ออกจากชุด`);pick.addEventListener('click',()=>toggle(p.id));bottom.append(detail,pick);article.append(top,body,bottom);return article;}
function render(){const list=$('problems');clearMath(list);list.replaceChildren();const result=filtered();$('result-count').textContent=`พบ ${result.length} ข้อ · แสดง ${Math.min(visible,result.length)} ข้อ`;
 if(!result.length){const empty=el('div','empty');empty.append(el('h3','',mode==='set'?'ยังไม่มีโจทย์ในชุดที่ตรงกับตัวกรอง':'ไม่พบโจทย์ที่ค้นหา'),el('p','','ลองล้างตัวกรอง หรือเลือกโจทย์จากคลังเพิ่มเติม'));list.append(empty);}
 for(const p of result.slice(0,visible))list.append(card(p));$('load-more').hidden=visible>=result.length;typeset(list);
 $('section-title').textContent=mode==='set'?'ชุดของฉัน':'คลังโจทย์';$('section-kicker').textContent=mode==='set'?'YOUR PRACTICE SET':'EXPLORE THE BANK';$('set-tools').hidden=mode!=='set';$('bank-tab').classList.toggle('active',mode==='bank');$('set-tab').classList.toggle('active',mode==='set');}
function reset(){for(const id of ['search','topic','source'])$(id).value='';$('diagram-only').checked=false;visible=10;render();}
function updateDetailButton(){$('detail-select').textContent=selected.has(current)?'✓ นำออกจากชุด':'+ เพิ่มเข้าชุด';}
function openDetail(id,updateHash=true){const p=problems.find(p=>p.id===id);if(!p){notify('ไม่พบรหัสโจทย์นี้');return;}current=id;const content=$('detail-content');clearMath(content);content.replaceChildren();$('detail-id').textContent=id+' · '+p.topic;
 content.append(el('p','problem-source',p.source+' · รอตรวจทาน'));const b=el('div','problem-body');b.innerHTML=p.html;content.append(b);
 const details=el('details','latex-source'),summary=el('summary','','ดูต้นฉบับ LaTeX'),pre=el('pre'),code=el('code','',p.latex);pre.append(code);details.append(summary,pre);content.append(details);
 const link=el('a','source-link','เปิดไฟล์ต้นฉบับใน GitHub ↗');link.href='https://github.com/pxtape/physics-problem/blob/main/'+p.sourcePath;link.target='_blank';link.rel='noopener';content.append(link);updateDetailButton();if(!$('detail').open)$('detail').showModal();$('detail').scrollTop=0;typeset(content);if(updateHash)history.replaceState(null,'','#'+id);}
function random(){const pool=filtered();if(!pool.length){notify('ไม่มีโจทย์ที่ตรงกับตัวกรอง');return;}const seed=new Uint32Array(1);crypto.getRandomValues(seed);openDetail(pool[seed[0]%pool.length].id);}
for(const id of ['search','topic','source','diagram-only'])$(id).addEventListener(id==='search'?'input':'change',()=>{visible=10;render();});
$('reset').onclick=reset;$('load-more').onclick=()=>{visible+=10;render();};$('random').onclick=random;$('random-hero').onclick=random;
$('start').onclick=()=>$('library').scrollIntoView({behavior:'smooth'});
for(const [id,value] of [['bank-tab','bank'],['set-tab','set']])$(id).onclick=()=>{mode=value;reset();$('library').scrollIntoView({behavior:'smooth'});};
$('close-detail').onclick=()=>$('detail').close();$('detail').addEventListener('close',()=>{current=null;history.replaceState(null,'',location.pathname+location.search);});$('detail-select').onclick=()=>toggle(current);
$('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);notify('คัดลอกลิงก์แล้ว');}catch{notify('คัดลอก URL จากแถบที่อยู่ของเบราว์เซอร์ได้เลย');}};
$('clear-set').onclick=()=>{selected.clear();save();render();};
$('print-set').onclick=async()=>{const chosen=problems.filter(p=>selected.has(p.id));if(!chosen.length){notify('เลือกโจทย์เข้าชุดก่อนพิมพ์');return;}clearMath($('problems'));$('problems').replaceChildren(...chosen.map(card));typeset($('problems'));await renderQueue;window.print();render();};
$('export-set').onclick=()=>{const chosen=problems.filter(p=>selected.has(p.id));if(!chosen.length){notify('เลือกโจทย์เข้าชุดก่อนดาวน์โหลด');return;}const url=URL.createObjectURL(new Blob([JSON.stringify({title:'แบบฝึกหัดฟิสิกส์',problems:chosen.map(({id,latex,source,sourcePath})=>({id,latex,source,sourcePath}))},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='physics-practice.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id)openDetail(id,false);});
$('mathjax-script').addEventListener('error',()=>{$('math-notice').hidden=false;});$('mathjax-script').addEventListener('load',()=>typeset($('problems')));
fetch('problems.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{problems=data;selected=new Set([...selected].filter(id=>problems.some(p=>p.id===id)));for(const topic of new Set(problems.map(p=>p.topic))){const option=el('option','',topic);option.value=topic;$('topic').append(option);}$('total').textContent=problems.length;save();render();if(location.hash)openDetail(location.hash.slice(1),false);}).catch(()=>{$('result-count').textContent='โหลดคลังโจทย์ไม่สำเร็จ';$('problems').append(el('p','notice','กรุณารีเฟรชหน้าอีกครั้ง หรือตรวจสอบว่า deploy โฟลเดอร์ web ครบทุกไฟล์'));});
