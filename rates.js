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
export function upcomingMarketHolidays(now=new Date()){
  const today=new Date(now.getTime()+12600000).toISOString().slice(0,10);
  return [
    {title:'شکرگزاری آمریکا',date:'2026-11-26',end:'2026-11-28',note:'۲۶–۲۸ نوامبر · ساعات ویژهٔ ارزها و فلزات'},
    {title:'کریسمس',date:'2026-12-24',end:'2026-12-26',note:'۲۴–۲۶ دسامبر · ساعات ویژه و تعطیلی کریسمس'},
    {title:'سال نو میلادی',date:'2026-12-31',end:'2027-01-01',note:'۳۱ دسامبر–۱ ژانویه · ساعات ویژه و تعطیلی سال نو'}
  ].filter(item=>item.end>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
}
export async function fetchDollarRate(fetcher=fetch,now=Date.now()) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try {
    const response=await fetcher(DOLLAR_RATE_URL,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw Error('منبع نرخ دلار در دسترس نیست.');
    return parseDollarRate(await response.json(),now);
  } finally {clearTimeout(timer);}
}
