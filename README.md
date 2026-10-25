# Physics Archive · คลังโจทย์ฟิสิกส์

คลังโจทย์แบบ **หนึ่งโจทย์ต่อหนึ่งไฟล์ `.tex`** แยกตามค่าย เนื้อหา ปี และแท็ก ค้นหาข้อความ ดูต้นฉบับ ทดลองแก้ไข และดูตัวอย่างสมการด้วย KaTeX ได้ เริ่มต้นคลังว่างตามคำขอเจ้าของ repo ข้อมูลเดิมย้อนดูได้ในประวัติ Git ก่อน commit เปลี่ยนคลังนี้

## เปิดในเครื่อง

ต้องมี Node.js 22 ขึ้นไป ไม่มี dependency ที่ต้องติดตั้ง:

```powershell
npm run dev
```

เปิด http://127.0.0.1:4173 — คำสั่งนี้ build ก่อนเปิด server ถ้าแก้ไฟล์ใน `content/` หรือ source เว็บ ให้หยุดแล้วรันใหม่

```powershell
npm test
npm run build
```

ผลลัพธ์เว็บอยู่ใน `dist/` เปิดผ่าน HTTP server ไม่ใช่ double-click `index.html` ตัวแสดงสมการและฟอนต์ KaTeX รวมใน repo แล้ว ส่วนฟอนต์ UI จาก Google Fonts มี sans-serif สำรอง

## เพิ่มโจทย์ถาวรทีละข้อ

1. คัดลอก `templates/problem.tex` เป็น `content/camp-1/mechanics/CAMP1-MEC-001.tex` (ใช้โฟลเดอร์ใดก็ได้ภายใน `content/`)
2. ระบุ metadata ใน comment ด้านบนไฟล์:

```tex
% id: CAMP1-MEC-001
% title: การเคลื่อนที่บนพื้นราบ
% camp: ค่าย 1
% topic: กลศาสตร์
% year: 2569
% tags: กฎของนิวตัน, แรง
```

3. ใส่โจทย์ระหว่าง `\begin{document}` และ `\end{document}` หรือใช้ fragment โดยตรงก็ได้
4. รัน `npm test` และ `npm run build` แล้ว commit/push เข้า `main`

`id`, `title`, `camp`, `topic` จำเป็นต้องมี ส่วนปีและแท็กเว้นว่างได้ รหัสต้องไม่ซ้ำกัน ใช้ภาษาอังกฤษ ตัวเลข `-` และ `_` ไม่เกิน 80 ตัว ระบบจะหยุด build หาก metadata ไม่ครบหรือรหัสซ้ำ ค่าย/หัวข้อใหม่จะปรากฏในตัวกรองอัตโนมัติ ไม่ต้องแก้ JSON ด้วยมือ

ชื่อไฟล์แนะนำให้ตรงกับรหัสโจทย์ เก็บรูปประกอบข้างไฟล์ได้ แต่ quick preview ยังไม่แสดงรูป

## การใช้หน้าเพิ่มโจทย์

- นำเข้า `.tex` หรือเริ่มจากแม่แบบเพื่อดูข้อความและสมการ พร้อมแจ้งข้อผิดพลาดสมการ
- **บันทึกแบบร่าง** เก็บใน localStorage เฉพาะเบราว์เซอร์นี้ ไม่ใช่การเขียนเข้า GitHub และอาจหายได้เมื่อผู้ใช้ล้างข้อมูลเบราว์เซอร์
- **ดาวน์โหลด .tex** เพื่อเก็บต้นฉบับและเพิ่มเข้า `content/` แล้ว commit/push
- เปิดโจทย์ตรง ๆ ได้ด้วย `?id=CAMP1-MEC-001` หลังมีไฟล์นั้นในคลัง

เว็บเป็น static site ไม่มี token ไม่มี API เขียน GitHub จากเบราว์เซอร์ ข้อมูลที่ commit เข้า public repo จะอ่านได้โดยบุคคลทั่วไป

## ขอบเขตตัวอย่าง LaTeX

รองรับข้อความไทย สมการ `$...$`, `$$...$$`, `\(...\)`, `\[...\]`, equation/align/gather แบบพื้นฐาน ตัวหนา/เอียง และรายการแบบง่าย **ไม่ใช่การ compile PDF จริง** ไม่รองรับแพ็กเกจทั้งหมด macro ที่นิยามเอง TikZ รูปภาพ ตาราง การอ้างอิง และ layout ของเอกสารเต็ม คำสั่งที่ไม่รองรับจะแสดงต้นฉบับ/คำเตือน

แม่แบบเอกสารเต็มใช้ XeLaTeX และต้องติดตั้งฟอนต์ Noto Serif Thai ถ้าต้องการ PDF จริงให้นำไฟล์ไป compile ด้วย XeLaTeX/Overleaf

## GitHub Pages

workflow `.github/workflows/pages.yml` จะทดสอบ build แล้ว deploy เมื่อ push `main` ต้องตั้ง **Settings → Pages → Source → GitHub Actions** ของ repo ก่อน URL ปกติคือ https://pxtape.github.io/physics-problem/ การมี workflow ใน repo เพียงอย่างเดียวยังไม่ยืนยันว่า deploy สำเร็จ

## โครงสร้าง

```text
content/                  ไฟล์โจทย์จริง (เริ่มต้นว่าง)
templates/problem.tex     แม่แบบสำหรับโจทย์ใหม่
web/                      หน้าเว็บและ KaTeX ที่รวมไว้ใน repo
lib/                      metadata parser และ quick preview
scripts/build.mjs         รวม metadata จากไฟล์ .tex เป็น catalog.json
tests/                    ตรวจ metadata และความปลอดภัยของ preview
```

KaTeX ใช้ MIT License ดู `web/vendor/KATEX-LICENSE`
