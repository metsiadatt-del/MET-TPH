export function memoryIndexedDB(){
  const records=new Map();
  const control={failNext:false};
  const db={objectStoreNames:{contains:()=>false},close(){},createObjectStore(){},transaction(){const tx={objectStore(){return {get(key){const req={};queueMicrotask(()=>{req.result=structuredClone(records.get(key));req.onsuccess?.();});return req;},put(value,key){queueMicrotask(()=>{if(control.failNext){control.failNext=false;tx.error=Error('Simulated storage failure');tx.onabort?.();}else{records.set(key,structuredClone(value));tx.oncomplete?.();}});}};}};return tx;}};
  control.indexedDB={open(){const req={};queueMicrotask(()=>{req.result=db;req.onupgradeneeded?.();req.onsuccess?.();});return req;}};
  return control;
}
