export const SECTIONS = [['home','HOME','خانه'],['money','مدیریت سرمایه','مدیریت سرمایه'],['mind','مدیریت روانی','ذهن آرام، تصمیم بهتر'],['technical','تکنیکال','تحلیل و یادگیری'],['plan','پلن معاملاتی','مسیر شخصی معامله'],['journal','ژورنال‌نویسی','روایت معاملات شما'],['accounts','حساب‌ها','مدیریت حساب‌های معاملاتی']];
export const DEFAULT_SYMBOLS = ['XAUUSD','EURUSD','DXY','GBPUSD'];
export const freshState = () => ({version:1,accounts:[],trades:[],notes:[],costs:[],steps:[],symbols:[...DEFAULT_SYMBOLS],checklist:[{id:'plan',text:'معامله با پلن من مطابقت دارد',done:false},{id:'risk',text:'ریسک و حد ضرر را مشخص کرده‌ام',done:false},{id:'mind',text:'آرام هستم و برای جبران ضرر معامله نمی‌کنم',done:false}],checklistDate:'',settings:{rate:0,rateAt:'',currency:'USD',feed:'',autoRate:true,rateSource:'manual',theme:'light'},quotes:[],quotesAt:''});
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function fixedDate(date, offset) { return new Date(date.getTime()+offset*3600000); }
export function dayKey(date=new Date()) { return fixedDate(date,3.5).toISOString().slice(0,10); }
export function sessionAt(date=new Date()) {
  const d=fixedDate(date,-4), minutes=d.getUTCHours()*60+d.getUTCMinutes();
  if(minutes>=1380||minutes<240)return 'آسیا';
  if(minutes>=360&&minutes<420)return 'فرانکفورت';
  if(minutes>=420&&minutes<540)return 'لندن';
  if(minutes>=720&&minutes<840)return 'نیویورک';
  return 'None';
}
export function clockAt(date,offset) {return fixedDate(date,offset).toISOString().slice(11,19);}
export function filterTrades(trades,{account='',start='',end=''}={}) {return trades.filter(t=>(!account||t.account===account)&&(!start||t.date>=start)&&(!end||t.date<=end));}
export function statistics(trades) {const wins=trades.filter(t=>t.result==='TP').length;return {count:trades.length,wins,losses:trades.length-wins,winRate:trades.length?wins/trades.length*100:0,pnl:trades.reduce((s,t)=>s+t.pnl,0)};}
export function accountStats(account,trades) {const result=statistics(trades.filter(t=>t.account===account.id));return {...result,balance:account.deposit+result.pnl,percent:account.deposit?result.pnl/account.deposit*100:0};}
export function riskAmount(balance,percent) {if(!Number.isFinite(balance)||balance<0||!Number.isFinite(percent)||percent<=0||percent>100)throw Error('سرمایه و درصد ریسک معتبر وارد کنید.');return balance*percent/100;}
export function dateRange(kind,today=dayKey()) {const d=new Date(today+'T00:00:00Z');if(kind==='week')d.setUTCDate(d.getUTCDate()-6);else if(kind==='month')d.setUTCDate(1);return {start:d.toISOString().slice(0,10),end:today};}
const validDate = s => typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const text = (s,max=10000) => typeof s==='string'&&s.length<=max;
const finite = n => typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e12;
export function validateState(s) {
  const fail=()=>{throw Error('ساختار فایل پشتیبان معتبر نیست.');};
  if(!s||s.version!==1)fail();
  for(const key of ['accounts','trades','notes','costs','steps','symbols','checklist','quotes'])if(!Array.isArray(s[key])||s[key].length>20000)fail();
  for(const key of ['accounts','trades','notes','costs','steps','checklist']) {const ids=new Set();for(const row of s[key]){if(!row||!text(row.id,100)||!row.id||ids.has(row.id))fail();ids.add(row.id);}}
  for(const a of s.accounts)if(!text(a.name,200)||!text(a.type,100)||!text(a.broker,200)||!finite(a.deposit)||a.deposit<0||!validDate(a.date))fail();
  const ids=new Set(s.accounts.map(a=>a.id));
  if(!s.symbols.every(v=>text(v,30)&&/^[A-Z0-9._/-]+$/.test(v))||new Set(s.symbols).size!==s.symbols.length)fail();
  for(const t of s.trades)if(!ids.has(t.account)||!validDate(t.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t.time)||!text(t.symbol,30)||!s.symbols.includes(t.symbol)||!['TP','SL'].includes(t.result)||!finite(t.pnl)||(t.result==='TP'&&t.pnl<0)||(t.result==='SL'&&t.pnl>0)||!text(t.note)||!text(t.image,3000000)||(t.image&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(t.image)))fail();
  for(const n of s.notes)if(!['money','mind','technical','plan','journal'].includes(n.section)||!text(n.text)||!validDate(n.date))fail();
  for(const c of s.costs)if(!text(c.title,200)||!finite(c.amount)||c.amount<0||!validDate(c.date))fail();
  for(const p of s.steps)if(!text(p.text,500))fail();
  for(const c of s.checklist)if(!text(c.text,500)||typeof c.done!=='boolean')fail();
  if(!text(s.checklistDate,10)||(s.checklistDate&&!validDate(s.checklistDate)))fail();
  if(!s.settings||!finite(s.settings.rate)||s.settings.rate<0||!text(s.settings.rateAt,40)||!['USD','IRT'].includes(s.settings.currency)||!text(s.settings.feed,500)||!text(s.quotesAt,40))fail();
  if(s.settings.autoRate!==undefined&&typeof s.settings.autoRate!=='boolean')fail();
  if(s.settings.theme!==undefined&&!['light','dark'].includes(s.settings.theme))fail();
  if(s.settings.rateSource!==undefined&&!['manual','priceto.day','custom'].includes(s.settings.rateSource))fail();
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
