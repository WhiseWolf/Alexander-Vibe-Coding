const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),handlers={};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'forest':id==='count'?'4':id==='vehicle'?'engine':'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener:(name,fn)=>handlers[id+name]=fn,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:680})});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el(Math.random())},window:{},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox);}
function step(n){run(`for(let n=0;n<${n*10};n++)tick(.1)`);}
function aim(x,y){handlers.mappointerdown({button:0,clientX:x,clientY:y});}

let timer=null,central=false;
sandbox.setTimeout=fn=>{timer=fn;return 1};sandbox.clearTimeout=()=>{timer=null};sandbox.URLSearchParams=URLSearchParams;
sandbox.fitMap=()=>{};
sandbox.document.body={classList:{add(){central=true},remove(){central=false}}};
const html=fs.readFileSync('index.html','utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('const emergencyCalls='))[1];
vm.runInContext(script,sandbox);
timer();el('accept-call').onclick();assert(!central&&run('S.active'));
run('S.fires.forEach(f=>f.hp=0);S.civilians.forEach(c=>{c.saved=true;c.care="hospital"});if(S.river)S.river.barrels.forEach(b=>b.secured=true);if(S.tunnel)S.tunnel.powerOff=true');step(1);
assert(run('S.done')&&!central,'Success stays visible');
run('S.paused=true');step(20);assert(!central,'Pause holds completion countdown');
run('S.paused=false');step(4);assert(!central,'Return does not happen early');step(2);
assert(central&&!run('S.active')&&!run('S.done'),'Completion returns automatically and resets mission');
assert(el('accept-call').disabled&&timer,'Next call scheduled');timer();assert(!el('accept-call').disabled);
el('accept-call').onclick();assert(!central&&run('S.active'));step(10);assert(!central,'Old completion cannot end the new mission');
console.log('PASS: success countdown, pause, automatic center return, clean reset, next call and new mission');
