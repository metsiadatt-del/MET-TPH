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
export async function fetchDollarRate(fetcher=fetch,now=Date.now()) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try {
    const response=await fetcher(DOLLAR_RATE_URL,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw Error('منبع نرخ دلار در دسترس نیست.');
    return parseDollarRate(await response.json(),now);
  } finally {clearTimeout(timer);}
}
