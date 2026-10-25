import {readFileSync,writeFileSync} from 'node:fs';
const files=['core','store','export','rates','app'];
const body=files.map(name=>readFileSync(new URL(`./src/${name}.js`,import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/\bexport (?=(?:async )?(?:function|const|let|class)\b)/g,'')).join('\n');
const embeddedIcon='data:image/png;base64,'+readFileSync(new URL('./assets/icon-192.png',import.meta.url)).toString('base64');
const output=`(async function () {\n'use strict';\nconst h = value => escapeHTML(value);\n${body.replace("const brandIcon='./assets/icon-192.png';",`const brandIcon='${embeddedIcon}';`)}\n})().catch(function(error){ if(window.metBootError) window.metBootError(error); else setTimeout(function(){throw error;},0); });\n`;
const path=new URL('./app.bundle.js',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('app.bundle.js is stale; run node pack.mjs');}else writeFileSync(path,output);
