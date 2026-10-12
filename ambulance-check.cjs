const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),handlers={};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'forest':id==='count'?'4':id==='vehicle'?'engine':'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener:(name,fn)=>handlers[id+name]=fn,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:680})});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el(Math.random())},window:{},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox);}
function step(n){run(`for(let n=0;n<${n*10};n++)tick(.1)`);}
function aim(x,y){handlers.mappointerdown({button:0,clientX:x,clientY:y});}

el('mission').value='forest';el('count').value='1';run('reset();S.spread=null;start();dispatch()');step(10);
for(let i=0;i<2;i++){run("select('person',S.people[0].id);equip('rescue')");aim(run(`S.civilians[${i}].x`),run(`S.civilians[${i}].y`));step(40);}
assert(run('S.civilians.every(c=>c.saved&&c.care==="waiting")'),'Rescued people wait visibly without ambulance');run('draw();S.fires.forEach(f=>f.hp=0)');step(20);assert(!run('S.done'),'Rescue and firefighting alone no longer complete mission');
el('vehicle').value='ambulance';run('dispatch()');step(10);assert(run('S.trucks[1].state==="patientApproach"||S.trucks[1].state==="treating"'));
step(9);assert(run('S.trucks[1].state==="treating"'));assert(run('S.civilians[0].care==="treating"'),'Patient remains visible during treatment');run('draw();S.paused=true');const timer=run('S.trucks[1].timer');step(20);assert.equal(run('S.trucks[1].timer'),timer);run('S.paused=false');
step(8);assert(run('S.civilians[0].care==="aboard"&&S.trucks[1].state==="transporting"'));run('draw()');assert(!run('S.done'));step(15);assert(run('S.civilians[0].care==="hospital"&&S.civilians[1].care==="waiting"'));assert(!run('S.done'),'Second person still requires transport');step(100);assert(run('S.civilians.every(c=>c.care==="hospital")&&S.done'),'One ambulance makes multiple trips');
// Two ambulances reserve different people; duplicate rescue cannot undo care state.
run('reset();S.spread=null;start();S.civilians.forEach(c=>{c.saved=true;c.care="waiting";c.x=850+S.civilians.indexOf(c)*40;c.y=460})');el('count').value='2';run('dispatch()');step(10);
assert(run('S.civilians[0].ambulanceId!==S.civilians[1].ambulanceId&&S.civilians.every(c=>c.ambulanceId!==null)'));
const care=run('S.civilians[0].care');run('finishRescue({},S.civilians[0],{x:0,y:0})');assert.equal(run('S.civilians[0].care'),care,'Duplicate rescue does not undo ambulance care');
step(100);assert(run('S.civilians.every(c=>c.care==="hospital")'));run('reset()');assert(run('S.civilians.every(c=>!c.saved&&c.care==="danger"&&!c.ambulanceId)'));
// Preserve a vehicle slot so dispatching only fire engines cannot block ambulance rescue.
el('vehicle').value='engine';el('count').value='10';run('start();dispatch()');assert(run('S.trucks.length===0'));el('count').value='9';run('dispatch()');el('vehicle').value='ambulance';el('count').value='1';run('dispatch()');assert(run('S.trucks.length===10&&S.trucks[9].type==="ambulance"'));
console.log('PASS: waiting patients, ambulance approach/treatment/transport, pause, hospital handover, repeat trips, distinct assignments, completion, reset and reserved slot');
