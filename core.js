export const SECTIONS = [['home','HOME','خانه'],['money','مدیریت مالی','موجودی و گزارش'],['education','آموزش','تحلیل، سرمایه و روان‌شناسی'],['plan','پلن معاملاتی','روایت مراحل تصمیم'],['checklists','چک‌لیست','چک‌لیست‌های چندتایم‌فریمی'],['journal','ژورنال‌نویسی','روایت معاملات شما'],['accounts','حساب‌ها','مدیریت حساب‌های معاملاتی']];
export const DEFAULT_SYMBOLS = ['XAUUSD','EURUSD','DXY','GBPUSD'];
const CHECKLIST_ROWS={M:[],W:[],D:[],H4:[],H1:[],M15:[['OF',''],['Hunt-Shift',''],['SMT',''],['Buy or Sell',''],['','']],M5:[['OF',''],['Hunt-Shift',''],['SMT',''],['Buy or Sell',''],['','']],M1:[['OF',''],['Hunt-Shift',''],['SMT',''],['Buy or Sell',''],['','']],ENTRY:[]};
for(const id of ['M','W','D','H4','H1']){const period=id==='M'?'M':id==='W'?'W':'D';CHECKLIST_ROWS[id]=[['Structure',''],['TPD',`p${period}H`],['TPD',`p${period}L`],['PPD','Sw'],['PPD','Fvg'],['PPD','Ob'],...(['M','W','D'].includes(id)?[['TSMT','']]:[['CSMT','']]),...(['D','H4','H1'].includes(id)?[['OF',''],['Area',''],['Hunt-Shift','']]:[]),...(id==='H4'?[['Sw-Sw-SMT','']]:[]),['','']];}
CHECKLIST_ROWS.ENTRY=[['PD',''],['Buy or Sell',''],['SMT',''],['OF',''],['Hunt-Shift with FVG',''],['Entry',''],['','']];
export function checklistOptions(row){if(['Structure','TSMT','Sw-Sw-SMT'].includes(row.group))return ['Yes','No'];if(row.group==='OF')return ['UP','Down'];if(row.group==='Area')return ['Premium','Discount','External'];if(row.group==='CSMT')return ['CH','CL'];if(row.group==='Buy or Sell')return ['Buy','Sell'];return row.group?['✓','✕']:[];}
export function reviewLocal(tf,zone='America/New_York'){if(!tf.date||!tf.time)return {date:'',time:''};const at=new Date(tf.date+'T'+tf.time+':00+03:30'),parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(at).map(p=>[p.type,p.value]));return {date:`${parts.year}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}`};}
export function setReviewNY(tf,date,time){if(!date||!time)throw Error('تاریخ و ساعت بررسی را کامل وارد کنید.');const target=Date.parse(date+'T'+time+':00Z');let instant=target+5*3600000;for(let i=0;i<3;i++){const probe={date:dayKey(new Date(instant)),time:clockAt(new Date(instant),3.5).slice(0,5)},local=reviewLocal(probe);instant+=target-Date.parse(local.date+'T'+local.time+':00Z');}const candidate={date:dayKey(new Date(instant)),time:clockAt(new Date(instant),3.5).slice(0,5)},local=reviewLocal(candidate);if(local.date!==date||local.time!==time)throw Error('این ساعت به‌علت تغییر ساعت فصلی نیویورک وجود ندارد.');Object.assign(tf,candidate,{reviewedAt:new Date(instant).toISOString()});}
const CHECKLIST_SYMBOLS=['DXY','EURUSD','GBPUSD'];
const checklistRows=(rows,symbols=CHECKLIST_SYMBOLS)=>rows.map(([group,label])=>({group,label,values:Object.fromEntries(symbols.map(s=>[s,['','','']])),checks:Object.fromEntries(symbols.map(s=>[s,false])),contexts:Object.fromEntries(symbols.map(s=>[s,'']))}));
export function createSetup(id,title,symbols){const doc=checklistDocument(id,title,symbols);for(const tf of doc.timeframes)tf.rows=checklistRows(CHECKLIST_ROWS[tf.id],symbols);return doc;}
export function candleWindow(id,now=new Date()){
  const start=new Date(now);start.setUTCSeconds(0,0);
  if(id==='M'){start.setUTCDate(1);start.setUTCHours(0,0);}else if(id==='W'){start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);start.setUTCHours(0,0);}else if(id==='D')start.setUTCHours(0,0);else if(id==='H4')start.setUTCHours(Math.floor(start.getUTCHours()/4)*4,0);else start.setUTCMinutes(0);
  const previous=new Date(start),end=new Date(start),hours={W:168,D:24,H4:4,H1:1};
  if(id==='M'){previous.setUTCMonth(previous.getUTCMonth()-1);end.setUTCMonth(end.getUTCMonth()+1);}else{previous.setTime(start.getTime()-hours[id]*3600000);end.setTime(start.getTime()+hours[id]*3600000);}
  return {start:start.toISOString(),previous:previous.toISOString(),end:end.toISOString()};
}
export function stampReview(tf,now=new Date()){tf.date=dayKey(now);tf.time=clockAt(now,3.5).slice(0,5);tf.reviewedAt=now.toISOString();}
export function archiveReview(tf){const snapshot=JSON.parse(JSON.stringify(tf));delete snapshot.history;tf.history.push(snapshot);stampReview(tf);}
const checklistDocument=(id='setup-default',title='DXY/EURUSD/GBPUSD',symbols=CHECKLIST_SYMBOLS)=>({id,title,symbols:[...symbols],createdAt:'',timeframes:Object.entries(CHECKLIST_ROWS).map(([id,rows])=>({id,label:{M:'M',W:'W',D:'D',H4:'H4',H1:'H1',M15:'15Min',M5:'5Min',M1:'1Min',ENTRY:'15Sec'}[id],date:'',time:'',previousCandle:'',currentCandle:'',rows:checklistRows(rows),schema:4,enabled:Object.fromEntries(symbols.map(s=>[s,true])),context:'',history:[],reviewedAt:''})),selectedTimeframe:'M',lower:{symbol:'',of:false,huntShift:false,stm:false,trigger15sec:false}});
const GLOBAL_CHECKLISTS=[['technical','تکنیکال'],['capital','مدیریت سرمایه'],['psychology','مدیریت روانی']];
const globalChecklistState=()=>GLOBAL_CHECKLISTS.map(([id,title])=>({id,title,items:Array.from({length:5},(_,i)=>({id:`${id}-${i+1}`,text:'',done:false}))}));
export const freshState = () => ({version:1,accounts:[],trades:[],notes:[],educationNotes:[],costs:[],steps:[],symbols:[...DEFAULT_SYMBOLS],checklist:[],checklistDate:'',watchSymbols:['TVC:DXY','FX:EURUSD','FX:GBPUSD','OANDA:XAUUSD'],globalChecklists:globalChecklistState(),checklists:[checklistDocument()],checklistSelected:'setup-default',rules:[],rulesDate:'',publicMarket:{usd:null,gold18:null,coin:null,halfCoin:null,quarterCoin:null,updatedAt:''},settings:{rate:0,rateAt:'',currency:'USD',feed:'',autoRate:true,rateSource:'manual',theme:'light'},quotes:[],quotesAt:''});
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function fixedDate(date, offset) { return new Date(date.getTime()+offset*3600000); }
export function dayKey(date=new Date()) { return fixedDate(date,3.5).toISOString().slice(0,10); }
export function sessionAt(date=new Date()) {
  const d=fixedDate(date,-4), minutes=d.getUTCHours()*60+d.getUTCMinutes();
  const day=d.getUTCDay(),md=d.toISOString().slice(5,10);
  if(day===6||(day===0&&minutes<1020)||(day===5&&minutes>=1020)||['01-01','12-25'].includes(md))return 'None';
  if(minutes>=1380||minutes<240)return 'آسیا';
  if(minutes>=360&&minutes<420)return 'فرانکفورت';
  if(minutes>=420&&minutes<540)return 'لندن';
  if(minutes>=720&&minutes<840)return 'نیویورک';
  return 'None';
}
export function clockAt(date,offset) {return fixedDate(date,offset).toISOString().slice(11,19);}
export function filterTrades(trades,{account='',start='',end=''}={}) {return trades.filter(t=>(!account||t.account===account)&&(!start||t.date>=start)&&(!end||t.date<=end));}
export function statistics(trades) {const wins=trades.filter(t=>t.result==='TP').length;return {count:trades.length,wins,losses:trades.length-wins,winRate:trades.length?wins/trades.length*100:0,pnl:trades.reduce((s,t)=>s+t.pnl,0)};}
export function accountStats(account,trades) {const result=statistics(trades.filter(t=>t.account===account.id)),share=account.type==='پراپ'&&Number.isFinite(account.profitShare)?Math.max(0,result.pnl)*account.profitShare/100:result.pnl;return {...result,balance:account.deposit+result.pnl,percent:account.deposit?result.pnl/account.deposit*100:0,profitShare:share};}
export function riskAmount(balance,percent) {if(!Number.isFinite(balance)||balance<0||!Number.isFinite(percent)||percent<=0||percent>100)throw Error('سرمایه و درصد ریسک معتبر وارد کنید.');return balance*percent/100;}
export function dateRange(kind,today=dayKey()) {const d=new Date(today+'T00:00:00Z');if(kind==='week')d.setUTCDate(d.getUTCDate()-6);else if(kind==='month')d.setUTCDate(1);return {start:d.toISOString().slice(0,10),end:today};}
const validDate = s => typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const text = (s,max=10000) => typeof s==='string'&&s.length<=max;
const finite = n => typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e12;
export function validateState(s) {
  const fail=()=>{throw Error('ساختار فایل پشتیبان معتبر نیست.');};
  if(!s||s.version!==1)fail();
  if(s.educationNotes===undefined)s.educationNotes=(s.notes||[]).filter(n=>['technical','money','mind'].includes(n.section)).map(n=>({id:n.id,category:n.section,title:'یادداشت منتقل‌شده',text:n.text,date:n.date,createdAt:n.date+'T00:00:00Z',pinned:false}));
  if(s.rules===undefined)s.rules=(s.checklist||[]).map(c=>({...c}));
  if(s.watchSymbols===undefined)s.watchSymbols=freshState().watchSymbols;
  if(!Array.isArray(s.watchSymbols)||s.watchSymbols.length>50||!s.watchSymbols.every(v=>typeof v==='string'&&/^[A-Z0-9_]+:[A-Z0-9_.!/-]+$/.test(v))||new Set(s.watchSymbols).size!==s.watchSymbols.length)fail();
  if(s.rulesDate===undefined)s.rulesDate='';
  if(!text(s.rulesDate,10)||(s.rulesDate&&!validDate(s.rulesDate)))fail();
  if(s.publicMarket===undefined)s.publicMarket=freshState().publicMarket;
  if(!s.publicMarket||typeof s.publicMarket!=='object'||!text(s.publicMarket.updatedAt,40)||(s.publicMarket.updatedAt&&!Number.isFinite(Date.parse(s.publicMarket.updatedAt))))fail();
  for(const key of ['usd','gold18','coin','halfCoin','quarterCoin']){const item=s.publicMarket[key];if(item!==null&&(!item||!finite(item.price)||item.price<=0||!text(item.at,40)||!Number.isFinite(Date.parse(item.at))||typeof item.stale!=='boolean'))fail();}
  if(s.globalChecklists===undefined)s.globalChecklists=globalChecklistState();
  if(!Array.isArray(s.globalChecklists)||s.globalChecklists.length!==3)s.globalChecklists=globalChecklistState();
  for(const group of s.globalChecklists){if(!text(group.id,30)||!text(group.title,100)||!Array.isArray(group.items)||group.items.length!==5)fail();for(const item of group.items)if(!text(item.id,100)||!text(item.text,500)||typeof item.done!=='boolean')fail();}
  if(!Array.isArray(s.checklists)||!s.checklists.length){s.checklists=[checklistDocument()];s.checklistSelected='setup-default';}
  for(const doc of s.checklists){
    if(!doc||!Array.isArray(doc.timeframes)||!doc.timeframes.length)fail();
    const legacy=!doc.symbols;
    if(legacy)doc.symbols=[...CHECKLIST_SYMBOLS];
    if(doc.id==='eur-gbp'){doc.id='setup-default';doc.title='DXY/EURUSD/GBPUSD';}
    doc.createdAt??='';
    if(!doc.selectedTimeframe)doc.selectedTimeframe='M';
    for(const tf of checklistDocument().timeframes)if(!doc.timeframes.some(x=>x.id===tf.id)){tf.rows=checklistRows(CHECKLIST_ROWS[tf.id],doc.symbols);doc.timeframes.push(tf);}
    for(const tf of doc.timeframes){
      tf.time??='';tf.previousCandle??='';tf.currentCandle??='';tf.reviewedAt??='';tf.history??=[];
      if(!Array.isArray(tf.rows)||!Array.isArray(tf.history)||tf.history.length>2000)fail();
      for(const row of tf.rows){
        if(!row.values||!row.checks)fail();
        row.contexts??=Object.fromEntries(doc.symbols.map(s=>[s,'']));
        if(legacy)for(const [old,key] of [['GBP','GBPUSD'],['EUR','EURUSD']]){if(row.values[old]){row.values[key]=row.values[old];row.checks[key]=row.checks[old];row.contexts[key]=row.contexts[old]||'';delete row.values[old];delete row.checks[old];delete row.contexts[old];}}
      }
      if(tf.schema!==4){
        const old=tf.rows;tf.history.push(JSON.parse(JSON.stringify({...tf,history:undefined})));
        tf.rows=checklistRows(CHECKLIST_ROWS[tf.id]||[['','']],doc.symbols);
        let group='';const previous=old.map(row=>{group=row.group||group;return {row,group};});
        for(const row of tf.rows){const candidates=previous.filter(x=>(x.group===row.group&&(!row.label||x.row.label.toLowerCase()===row.label.toLowerCase()))||(!row.group&&!x.row.group&&!['Yes','No','Up','Down','Premium','Discount','CH','CL'].includes(x.row.label)));for(const symbol of doc.symbols){row.contexts[symbol]=old[0]?.contexts?.[symbol]||tf.context||'';const source=candidates.find(x=>x.row.values[symbol]?.[0]);if(source){let value=source.row.values[symbol][0];if(['✓','Yes'].includes(value)&&['Yes','No','Up','Down','Premium','Discount','CH','CL'].includes(source.row.label))value=source.row.label;if(value==='Up')value='UP';if(!row.group||checklistOptions(row).includes(value))row.values[symbol][0]=value;}if(!row.group&&candidates[0])row.label=candidates[0].row.label;}}
        tf.schema=4;
      }
      tf.enabled??=Object.fromEntries(doc.symbols.map(s=>[s,true]));
      for(const symbol of doc.symbols)if(typeof tf.enabled[symbol]!=='boolean')fail();
      if(legacy){const groups=[];let group='';for(const row of tf.rows){group=row.group||group;groups.push({row,group});}if(['M','W'].includes(tf.id))tf.rows=[...groups.filter(x=>x.group==='Structure'),...groups.filter(x=>x.group!=='Structure')].map(x=>x.row);if(!tf.rows.some(r=>!r.group&&!r.label))tf.rows.push(...checklistRows([['','']],doc.symbols));}
    }
  }
  for(const key of ['accounts','trades','notes','educationNotes','costs','steps','symbols','checklist','rules','checklists','quotes'])if(!Array.isArray(s[key])||s[key].length>20000)fail();
  for(const key of ['accounts','trades','notes','educationNotes','costs','steps','checklist','rules']) {const ids=new Set();for(const row of s[key]){if(!row||!text(row.id,100)||!row.id||ids.has(row.id))fail();ids.add(row.id);}}
  for(const a of s.accounts)if(!text(a.name,200)||!text(a.type,100)||!text(a.broker,200)||!finite(a.deposit)||a.deposit<0||!validDate(a.date)||((a.profitShare!==undefined)&&(!finite(a.profitShare)||a.profitShare<0||a.profitShare>100)))fail();
  const ids=new Set(s.accounts.map(a=>a.id));
  if(!s.symbols.every(v=>text(v,30)&&/^[A-Z0-9._/-]+$/.test(v))||new Set(s.symbols).size!==s.symbols.length)fail();
  for(const t of s.trades)if(!ids.has(t.account)||!validDate(t.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t.time)||!text(t.symbol,30)||!s.symbols.includes(t.symbol)||!['TP','SL'].includes(t.result)||!finite(t.pnl)||(t.result==='TP'&&t.pnl<0)||(t.result==='SL'&&t.pnl>0)||!text(t.note)||!text(t.image,11200000)||(t.image&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(t.image)))fail();
  for(const n of s.notes)if(!['money','mind','technical','plan','journal'].includes(n.section)||!text(n.text)||!validDate(n.date))fail();
  for(const n of s.educationNotes)if(!['technical','money','mind'].includes(n.category)||!text(n.title,200)||!text(n.text)||!validDate(n.date)||typeof n.pinned!=='boolean')fail();
  for(const c of s.costs)if(!text(c.title,200)||!finite(c.amount)||c.amount<0||!validDate(c.date))fail();
  for(const p of s.steps){if(p.description===undefined)p.description='';if(!text(p.text,500)||!text(p.description,5000))fail();}
  for(const c of s.checklist)if(!text(c.text,500)||typeof c.done!=='boolean')fail();
  if(s.educationNotes.filter(n=>n.pinned).length>10)fail();
  for(const note of s.educationNotes){if(note.createdAt===undefined)note.createdAt=note.date+'T00:00:00Z';if(!text(note.createdAt,40)||!Number.isFinite(Date.parse(note.createdAt)))fail();}
  for(const c of s.rules)if(!text(c.text,500)||typeof c.done!=='boolean')fail();
  if(!text(s.checklistDate,10)||(s.checklistDate&&!validDate(s.checklistDate)))fail();
  for(const doc of s.checklists){if(!text(doc.id,100)||!text(doc.title,200)||!Array.isArray(doc.symbols)||doc.symbols.length!==3||new Set(doc.symbols).size!==3||!doc.symbols.every(v=>text(v,30)&&/^[A-Z0-9._/-]+$/.test(v))||!Array.isArray(doc.timeframes)||!doc.lower||!text(doc.lower.symbol,30)||typeof doc.lower.of!=='boolean'||typeof doc.lower.huntShift!=='boolean'||typeof doc.lower.stm!=='boolean'||typeof doc.lower.trigger15sec!=='boolean')fail();for(const tf of doc.timeframes.flatMap(tf=>[tf,...tf.history])){if(!tf||!text(tf.reviewedAt||'',40)||(tf.reviewedAt&&!Number.isFinite(Date.parse(tf.reviewedAt)))||!text(tf.id,10)||!text(tf.label,10)||!text(tf.date,10)||(tf.date&&!validDate(tf.date))||!text(tf.time||'',10)||(tf.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(tf.time))||!text(tf.previousCandle||'',100)||!text(tf.currentCandle||'',100)||!Array.isArray(tf.rows)||!text(tf.context||'',5000))fail();for(const row of tf.rows){if(!text(row.group,100)||!text(row.label,100)||!row.values||!row.checks)fail();for(const symbol of doc.symbols){if(!Array.isArray(row.values[symbol])||row.values[symbol].length!==3||!row.values[symbol].every(v=>text(v,500)))fail();if(typeof row.checks[symbol]!=='boolean')fail();if(row.contexts&& !text(row.contexts[symbol]||'',5000))fail();}}}}
  if(!s.checklistSelected||!s.checklists.some(d=>d&&d.id===s.checklistSelected))s.checklistSelected=s.checklists[0].id;

  if(!s.settings||!finite(s.settings.rate)||s.settings.rate<0||!text(s.settings.rateAt,40)||!['USD','IRT'].includes(s.settings.currency)||!text(s.settings.feed,500)||!text(s.quotesAt,40))fail();
  if(s.settings.autoRate!==undefined&&typeof s.settings.autoRate!=='boolean')fail();
  if(s.settings.theme!==undefined&&!['light','dark'].includes(s.settings.theme))fail();
  if(s.settings.rateSource!==undefined&&!['manual','priceto.day','iran-market','custom'].includes(s.settings.rateSource))fail();
  for(const q of s.quotes)if(!text(q.symbol,30)||!finite(q.price)||q.price<=0||!finite(q.change))fail();
  return s;
}
export function validateFeed(data) {
  if(!data||!Array.isArray(data.quotes)||!data.quotes.length||data.quotes.length>100||!Number.isFinite(Date.parse(data.timestamp))||Date.parse(data.timestamp)>Date.now()+300000)throw Error('پاسخ منبع نرخ معتبر نیست.');
  const quotes=data.quotes.map(q=>{if(!DEFAULT_SYMBOLS.includes(q.symbol)||!finite(q.price)||q.price<=0||!finite(q.change))throw Error('نرخ دریافتی معتبر نیست.');return {symbol:q.symbol,price:q.price,change:q.change};});
  if(new Set(quotes.map(q=>q.symbol)).size!==quotes.length)throw Error('نماد تکراری در پاسخ منبع.');
  if(data.usdToman!==undefined&&(!finite(data.usdToman)||data.usdToman<=0))throw Error('نرخ تومان معتبر نیست.');
  return {quotes,timestamp:data.timestamp,rate:data.usdToman};
}
