export const DOLLAR_RATE_URL='https://iran-market.github.io/data/popular.json';
export function parseDollarRate(data,now=Date.now()) {
  if(!data||!Array.isArray(data.data)||data.meta?.unit!=='toman'||data.meta.stale===true)throw Error('پاسخ منبع نرخ دلار معتبر یا به‌روز نیست.');
  const rows=data.data.filter(row=>row?.symbol==='USD_IRR_FREE');
  if(rows.length!==1)throw Error('نرخ دلار بازار آزاد در پاسخ منبع مشخص نیست.');
  const row=rows[0];
  if(row.currency!=='IRT'||row.unit_size!==1||row.stale===true||typeof row.price!=='number'||!Number.isFinite(row.price)||row.price<=0||row.price>1e12||typeof row.timestamp!=='string')throw Error('مبلغ یا واحد نرخ دلار معتبر نیست.');
  const time=Date.parse(row.timestamp);
  if(!Number.isFinite(time)||time>now+300000)throw Error('زمان نرخ دلار معتبر نیست.');
  if(now-time>48*3600000)throw Error('نرخ دریافتی بیش از ۴۸ ساعت قدیمی است؛ نرخ قبلی حفظ شد.');
  return {rate:row.price,rateAt:new Date(time).toISOString(),rateSource:'iran-market'};
}
export const ECONOMIC_CALENDAR_URL='https://nfs.faireconomy.media/ff_calendar_thisweek.json';
export const PUBLIC_MARKET_URL='https://iran-market.github.io/data/latest-toman.json';
const publicSymbols={usd:'USD_IRR_FREE',gold18:'GOLD_18K_IRR',coin:'COIN_BAHAR_IRR',halfCoin:'COIN_HALF_IRR',quarterCoin:'COIN_QUARTER_IRR'};
export function parsePublicMarket(data,now=Date.now()){
  if(data?.meta?.unit!=='toman'||!data.data?.categories||typeof data.data.categories!=='object'||!Object.values(data.data.categories).every(Array.isArray)||!Number.isFinite(Date.parse(data.meta.published_at)))throw Error('ساختار قیمت‌های داخلی معتبر نیست.');
  const rows=Object.values(data.data.categories).flat(),result={updatedAt:data.meta.published_at};
  for(const [key,symbol] of Object.entries(publicSymbols)){
    const row=rows.find(r=>r?.symbol===symbol),time=Date.parse(row?.timestamp);
    result[key]=row&&row.currency==='IRT'&&row.unit_size===1&&Number.isFinite(row.price)&&row.price>0&&row.price<=1e12&&Number.isFinite(time)&&time<=now+300000?{price:row.price*10,at:row.timestamp,stale:row.stale===true||now-time>48*3600000}:null;
  }
  return result;
}
async function publicJSON(url,fetcher){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{const response=await fetcher(url,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('منبع آنلاین در دسترس نیست.');return await response.json();}finally{clearTimeout(timer);}}
export async function fetchPublicMarket(fetcher=fetch){return parsePublicMarket(await publicJSON(PUBLIC_MARKET_URL,fetcher));}
export function parseEconomicCalendar(data,now=new Date()){
  if(!Array.isArray(data))throw Error('ساختار تقویم معتبر نیست.');
  const iranDay=date=>new Date(date.getTime()+12600000).toISOString().slice(0,10),today=iranDay(now);
  return data.filter(item=>item&&typeof item.title==='string'&&Number.isFinite(Date.parse(item.date))&&/([+-]\d{2}:\d{2}|Z)$/.test(item.date)&&iranDay(new Date(item.date))===today&&['High','Medium'].includes(item.impact)).map(item=>({title:item.title.slice(0,500),date:new Date(item.date).toISOString(),impact:item.impact,country:String(item.country||'').slice(0,20)})).sort((a,b)=>(a.impact==='High'?0:1)-(b.impact==='High'?0:1)||a.date.localeCompare(b.date));
}
export async function fetchEconomicCalendar(fetcher=fetch,now=new Date()){return parseEconomicCalendar(await publicJSON(ECONOMIC_CALENDAR_URL,fetcher),now);}
export async function fetchDollarRate(fetcher=fetch,now=Date.now()) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try {
    const response=await fetcher(DOLLAR_RATE_URL,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw Error('منبع نرخ دلار در دسترس نیست.');
    return parseDollarRate(await response.json(),now);
  } finally {clearTimeout(timer);}
}
