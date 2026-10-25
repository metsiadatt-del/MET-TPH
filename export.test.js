import test from 'node:test';
import assert from 'node:assert/strict';
import {excelBytes,wordBytes,zipFiles} from '../src/export.js';
import {spawnSync} from 'node:child_process';
function validateArchive(bytes,kind){const script=`import sys,io,zipfile,xml.etree.ElementTree as ET
z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read()))
assert z.testzip() is None
for name in z.namelist(): ET.fromstring(z.read(name))
assert '[Content_Types].xml' in z.namelist()
assert '_rels/.rels' in z.namelist()
print('valid')
`;const result=spawnSync('python',['-c',script],{input:bytes,encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),'valid',kind);}
test('ZIP supports UTF-8 text and correct CRC',()=>{const bytes=zipFiles({'word/document.xml':'<root>فارسی</root>','[Content_Types].xml':'<Types/>','_rels/.rels':'<Relationships/>'});validateArchive(bytes,'zip');});
test('xlsx is a valid Office ZIP with XML and safe text cells',()=>{const bytes=excelBytes('گزارش','عنوان,عدد'.split(','),[['=HYPERLINK("test")',12.5],['<x>& فارسی',-40]]);validateArchive(bytes,'xlsx');const decoded=new TextDecoder().decode(bytes);assert.ok(decoded.includes('t="inlineStr"'));assert.ok(!decoded.includes('<f>'));assert.ok(decoded.includes('<v>-40</v>'));assert.ok(decoded.includes('rightToLeft="1"'));assert.ok(decoded.includes('&lt;x&gt;&amp;'));});
test('docx is a valid Office ZIP with RTL, A4, text and escaped markup',()=>{const bytes=wordBytes('یادداشت',['تاریخ','متن'],[['2026-10-24','<script> & تست\u0000']]);validateArchive(bytes,'docx');const decoded=new TextDecoder().decode(bytes);assert.ok(decoded.includes('<w:bidi/>'));assert.ok(decoded.includes('w:w="11906"'));assert.ok(decoded.includes('&lt;script&gt;'));assert.ok(decoded.includes('<w:bidiVisual/>'));});
test('xlsx supports columns after Z',()=>{const headers=Array.from({length:28},(_,i)=>String(i));const decoded=new TextDecoder().decode(excelBytes('wide',headers,[headers]));assert.ok(decoded.includes('r="AB3"'));});
