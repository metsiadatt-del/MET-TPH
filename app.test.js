import test from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate as nextTurn} from 'node:timers/promises';
import {readFileSync} from 'node:fs';
import {runInThisContext} from 'node:vm';
import {memoryIndexedDB} from './memory-db.js';
const handlers=new Map(),elements=new Map();
class Element {
  constructor(id){this.id=id;this.innerHTML='';this.textContent='';this.classList={add(){},remove(){}};this.open=false;}
  showModal(){this.open=true;}
  close(){this.open=false;}
  focus(){}
}
for(const id of ['app','modal','toast','print-report'])elements.set(id,new Element(id));
const document={documentElement:{attributes:{},setAttribute(key,value){this.attributes[key]=value;}},hidden:false,getElementById(id){if(elements.has(id))return elements.get(id);const html=elements.get('app').innerHTML+elements.get('modal').innerHTML;if(html.includes(`id="${id}"`)){const element=new Element(id);elements.set(id,element);return element;}return null;},querySelectorAll(){return [];},addEventListener(type,callback){handlers.set(type,callback);}};
const mock=memoryIndexedDB();globalThis.indexedDB=mock.indexedDB;globalThis.document=document;globalThis.window={addEventListener(){},print(){}};globalThis.location={hash:'',href:'https://test.invalid/met/',origin:'https://test.invalid'};
Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
globalThis.confirm=()=>true;
globalThis.fetch=async()=>{throw new TypeError('Offline test fixture');};
globalThis.FormData=class extends Map{constructor(form){super(Object.entries(form.values));}};
const timers=[];
const originalInterval=globalThis.setInterval;globalThis.setInterval=(fn,ms)=>{const timer=originalInterval(fn,ms);timer.unref();timers.push(timer);return timer;};
const originalTimeout=globalThis.setTimeout;globalThis.setTimeout=(fn,ms)=>originalTimeout(fn,ms).unref();
await runInThisContext(readFileSync(new URL('../app.bundle.js',import.meta.url),'utf8'),{filename:'app.bundle.js'});
const {load}=await import('../src/store.js');
async function click(dataset){await handlers.get('click')({target:{closest(selector){if(selector==='[data-tab]')return dataset.tab?{dataset}:null;if(selector==='[data-action]')return dataset.action?{dataset,closest(){return null;}}:null;}},preventDefault(){}});await nextTurn();}
async function submit(kind,values,id=''){const error=new Element('error'),button={disabled:false};const form={id:'editor',dataset:{form:kind,id},values,querySelector(selector){return selector==='.form-error'?error:button;}};await handlers.get('submit')({target:form,preventDefault(){}});assert.equal(error.textContent,'');}
test('application renders all sections and completes account/trade/note/plan flows with DOM API doubles',async()=>{
  assert.match(elements.get('app').innerHTML,/هر معامله، یک قدم/);
  assert.match(elements.get('app').innerHTML,/قیمت و نوسان آنلاین بازار/);
  assert.match(elements.get('app').innerHTML,/مدیریت سرمایه/);
  assert.match(elements.get('app').innerHTML,/ژورنال‌نویسی/);
  assert.ok(!elements.get('app').innerHTML.includes('class="avatar"'));
  assert.ok(!elements.get('app').innerHTML.includes('class="hero-brand"'));
  assert.match(elements.get('app').innerHTML,/data:image\/png;base64,/);
  await click({action:'theme'});assert.equal(document.documentElement.attributes['data-theme'],'dark');assert.equal((await load()).settings.theme,'dark');
  await click({tab:'accounts'});assert.match(elements.get('app').innerHTML,/header-wordmark/);assert.equal(document.documentElement.attributes['data-theme'],'dark');
  await click({action:'theme'});assert.equal(document.documentElement.attributes['data-theme'],'light');
  await click({action:'new-trade'});assert.match(elements.get('modal').innerHTML,/حساب معاملاتی جدید/);
  await submit('account',{name:'حساب اصلی',type:'دمو',deposit:'2000',broker:'بروکر آزمایشی',date:'2026-10-24'});
  const account=(await load()).accounts[0];assert.equal(account.deposit,2000);
  await click({tab:'journal'});await click({action:'new-trade'});assert.match(elements.get('modal').innerHTML,/ساعت نیویورک/);
  await submit('trade',{account:account.id,date:'2026-10-24',time:'12:10',symbol:'btcusd',result:'TP',amount:'120',note:'<script>alert(1)</script>',image:{size:0}});
  let data=await load();assert.equal(data.trades[0].pnl,120);assert.ok(data.symbols.includes('BTCUSD'));
  await submit('trade',{account:account.id,date:'2026-10-24',time:'12:10',symbol:'BTCUSD',result:'SL',amount:'40',note:'اصلاح',image:{size:0}},data.trades[0].id);
  assert.equal((await load()).trades[0].pnl,-40);
  await click({action:'delete',kind:'accounts',id:account.id});assert.equal((await load()).accounts.length,1);
  for(const tab of ['money','mind','technical','plan','journal']){await click({tab});await click({action:'new-note'});await submit('note',{date:'2026-10-24',text:`<img onerror=x> ${tab}`});assert.match(elements.get('app').innerHTML,/&lt;img onerror=x&gt;/);}
  assert.equal((await load()).notes.length,5);
  await click({tab:'plan'});await submit('step',{text:'بررسی روند'});await submit('step',{text:'تعیین ریسک'});data=await load();await click({action:'move-step',id:data.steps[1].id});assert.equal((await load()).steps[0].text,'تعیین ریسک');
  await click({tab:'money'});await submit('cost',{title:'آموزش',amount:'50',date:'2026-10-24'});assert.equal((await load()).costs[0].amount,50);
  await click({tab:'accounts'});assert.match(elements.get('app').innerHTML,/حساب اصلی/);assert.match(elements.get('app').innerHTML,/1,960/);
  for(const tab of ['home','money','mind','technical','plan','journal','accounts']){await click({tab});assert.ok(elements.get('app').innerHTML.includes('aria-current="page"'));assert.ok(!elements.get('app').innerHTML.includes('undefined'));}
  await click({action:'delete',kind:'trades',id:data.trades[0].id});assert.equal((await load()).trades.length,0);
  await click({action:'delete',kind:'accounts',id:account.id});assert.equal((await load()).accounts.length,0);
  const rateTime=new Date().toISOString();globalThis.fetch=async()=>({ok:true,json:async()=>({success:true,price:2500000,time:rateTime})});
  await click({action:'refresh-rate'});assert.equal((await load()).settings.rate,250000);assert.equal((await load()).settings.rateAt,rateTime);assert.equal((await load()).settings.rateSource,'priceto.day');
  globalThis.fetch=async()=>{throw new TypeError('CORS test');};await click({action:'refresh-rate'});assert.equal((await load()).settings.rate,250000);
  await click({action:'currency'});assert.equal((await load()).settings.currency,'IRT');
  for(const timer of timers)clearInterval(timer);
});
