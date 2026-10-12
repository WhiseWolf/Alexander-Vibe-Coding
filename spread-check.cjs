const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),handlers={};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'forest':id==='count'?'4':id==='vehicle'?'engine':'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener:(name,fn)=>handlers[id+name]=fn,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:680})});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el(Math.random())},window:{},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox);}
function step(n){run(`for(let n=0;n<${n*10};n++)tick(.1)`);}
function aim(x,y){handlers.mappointerdown({button:0,clientX:x,clientY:y});}

let seed=12;sandbox.Math=Object.create(Math);sandbox.Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(const mission of ['car','forest','airport','warehouse','accident','river']){
 el('mission').value=mission;
 const layouts=new Set();
 for(let i=0;i<10;i++){run('reset();draw()');layouts.add(run('JSON.stringify(S.fires.map(f=>[f.x,f.y,f.hp]))'));assert(run('S.spread.fuel.length>0'),'Every mission has spread opportunities');}
 assert(layouts.size>1,'Fresh calls have variable fire layouts');
 run('reset();start()');const original=run('S.fires.length'),budget=run('S.spread.fuel.length');step(650);run('draw()');
 assert(run('S.spread.fuel.some(f=>f.used)'),'Untreated fire spreads');
 assert(run('S.fires.length')<=original+budget+(mission==='warehouse'?2:0),'Spread stays bounded');
 run('S.fires.forEach(f=>f.hp=0)');const count=run('S.fires.length');step(200);assert.equal(run('S.fires.length'),count,'Extinguished fire never reignites');
}
el('mission').value='forest';run('reset();start();S.spread.timer=0');step(1);assert(run('S.spread.pending!==null'));
const source=run('S.spread.fuel[S.spread.pending].source');run(`S.fires[${source}].hp=S.fires[${source}].max*.3`);const count=run('S.fires.length');step(1);assert(run('S.spread.pending===null'));assert.equal(run('S.fires.length'),count,'Cooling source cancels warned spread');
run('reset();start();S.paused=true');const timer=run('S.spread.timer');step(100);assert.equal(run('S.spread.timer'),timer);
// Actual command completion with spread enabled and a full team, no forced extinguishing.
el('mission').value='forest';el('count').value='4';run('reset();start();dispatch()');step(160);
for(let ci=0;ci<run('S.civilians.length');ci++){
 run("select('person',S.people[0].id);equip('rescue')");aim(run(`S.civilians[${ci}].x`),run(`S.civilians[${ci}].y`));step(40);
}
for(let fi=0;fi<run('S.fires.length');fi++){
 for(let attempt=0;attempt<8&&run(`S.fires[${fi}].hp>0`);attempt++){
  run("select('person',S.people.find(p=>p.truckId===S.trucks[0].id).id);equip('additive')");aim(run(`S.fires[${fi}].x`),run(`S.fires[${fi}].y`));step(170);
  if(!run('S.done')&&run('S.trucks[0].water<20')){run('sendBack(S.trucks[0])');step(100);}
 }
 assert(run(`S.fires[${fi}].hp===0`),'Spread fires remain extinguishable');
}
assert(run('S.done'),'Variable forest with real spread remains completable');
console.log('PASS: variable layouts in six missions, actual spread, finite fuel, no reignition, cooling prevention, pause and full command completion');
