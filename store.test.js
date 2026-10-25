import test from 'node:test';
import assert from 'node:assert/strict';
import {memoryIndexedDB} from './memory-db.js';
import {freshState} from '../src/core.js';
const mock=memoryIndexedDB();globalThis.indexedDB=mock.indexedDB;
const {load,save}=await import('../src/store.js');
test('store saves and reloads cloned data through IndexedDB API double',async()=>{const initial=await load();assert.deepEqual(initial,freshState());initial.notes.push({id:'n',section:'mind',date:'2026-10-24',text:'تمرکز'});await save(initial);initial.notes[0].text='not saved';assert.equal((await load()).notes[0].text,'تمرکز');});
test('store abort reports error and preserves previous value',async()=>{const before=await load(),next=structuredClone(before);next.settings.rate=100000;mock.failNext=true;await assert.rejects(save(next),/Simulated storage failure/);assert.deepEqual(await load(),before);});
test('invalid data is rejected before write',async()=>{const before=await load();const invalid=structuredClone(before);invalid.settings.rate=-1;assert.throws(()=>save(invalid));assert.deepEqual(await load(),before);});
