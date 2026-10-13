const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),handlers={};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'forest':id==='count'?'4':id==='vehicle'?'engine':'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener:(name,fn)=>handlers[id+name]=fn,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:680})});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el(Math.random())},window:{},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox);}
function step(n){run(`for(let n=0;n<${n*10};n++)tick(.1)`);}
function aim(x,y){handlers.mappointerdown({button:0,clientX:x,clientY:y});}

for(const difficulty of ['leicht','normal','schwer']){
el('mission').value='house';run('reset()');run(`S.difficulty='${difficulty}';reset()`);
// Set the random source before reset to exercise each actual variant.
run(`Math.random=()=>${{'leicht':.1,'normal':.5,'schwer':.9}[difficulty]};reset();start();dispatch()`);step(20);run('draw()');
assert.strictEqual(run('S.civilians.length'),difficulty==='schwer'?2:1);
run("select('person',S.people[0].id);equip('rescue')");aim(625,425);assert(run('!S.people[0].target'),'Door blocked before power off');
run("equip('switch')");aim(455,350);step(20);assert(run('S.house.powerOff'));
run("equip('rescue')");aim(625,425);run('S.paused=true');step(20);assert(run('!S.house.doorOpen'));run('S.paused=false');step(20);assert(run('S.house.doorOpen'));run('draw()');
for(let ci=0;ci<run('S.civilians.length');ci++){run("select('person',S.people[0].id);equip('rescue')");aim(run(`S.civilians[${ci}].x`),run(`S.civilians[${ci}].y`));step(40);assert(run(`S.civilians[${ci}].saved`));}
for(let fi=0;fi<run('S.fires.length');fi++){
for(let attempt=0;attempt<8&&run(`S.fires[${fi}].hp>0`);attempt++){
run("select('person',S.people.find(p=>p.truckId===S.trucks[0].id).id);equip('foam')");aim(run(`S.fires[${fi}].x`),run(`S.fires[${fi}].y`));step(170);
if(run('S.trucks[0].water<20')){run('sendBack(S.trucks[0])');step(100);}}
assert(run(`S.fires[${fi}].hp===0`));}
assert(!run('S.done'));el('vehicle').value='ambulance';el('count').value='1';run('dispatch()');step(180);assert(run('S.done'),'Requires hospital delivery');run('draw()');el('vehicle').value='engine';el('count').value='4';
}
console.log('PASS house: all difficulties, two patients on hard, power/door gates, pause, rescue, fire suppression and hospital completion');
