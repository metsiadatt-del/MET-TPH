export const DOLLAR_RATE_URL='https://api.priceto.day/v1/latest/irr/usd';
export function parseDollarRate(data,now=Date.now()) {
  if(!data||data.success!==true||typeof data.price!=='number'||!Number.isFinite(data.price)||data.price<=0||data.price>1e12||typeof data.time!=='string')throw Error('پاسخ منبع نرخ دلار معتبر نیست.');
  const time=Date.parse(data.time);
  if(!Number.isFinite(time)||time>now+300000)throw Error('زمان نرخ دلار معتبر نیست.');
  if(now-time>48*3600000)throw Error('نرخ دریافتی بیش از ۴۸ ساعت قدیمی است؛ نرخ قبلی حفظ شد.');
  return {rate:data.price/10,rateAt:new Date(time).toISOString(),rateSource:'priceto.day'};
}
export async function fetchDollarRate(fetcher=fetch,now=Date.now()) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try {
    const response=await fetcher(DOLLAR_RATE_URL,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw Error('منبع نرخ دلار در دسترس نیست.');
    return parseDollarRate(await response.json(),now);
  } finally {clearTimeout(timer);}
}
