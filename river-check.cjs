const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),handlers={};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'forest':id==='count'?'4':id==='vehicle'?'engine':'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener:(name,fn)=>handlers[id+name]=fn,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:680})});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el(Math.random())},window:{},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox);}
function step(n){run(`for(let n=0;n<${n*10};n++)tick(.1)`);}
function aim(x,y){handlers.mappointerdown({button:0,clientX:x,clientY:y});}

el('mission').value='river';run('reset();S.spread=null;start();draw()');
assert(run('S.river.barrels.length===3&&S.civilians[0].underwater'));
const initial=run('S.river.barrels[0].x');step(10);assert(run('S.river.barrels[0].x')>initial);
run('S.paused=true');const stopped=run('S.river.barrels[0].x');step(20);assert.equal(run('S.river.barrels[0].x'),stopped);run('S.paused=false');
run('dispatch()');step(20);
run("select('person',S.people[0].id);equip('rescue')");aim(790,215);assert(run('S.people[0].target===null'),'Ordinary rescue cannot reach underwater person');
run("equip('diver')");aim(790,215);step(30);assert(run('S.civilians[0].saved'),'Diver rescues through real commands');
run("select('person',S.people[1].id);equip('foam')");aim(560,390);step(120);assert(run('S.fires[0].hp===0'));assert(run('!S.done'),'Oil containment is required for success');
step(80);assert(run('S.river.barrels.some(b=>b.leaking)'),'Unsecured barrels leak but can still be recovered');run('draw()');
for(let i=0;i<3;i++){
 run("select('person',S.people[0].id);equip('rescue')");aim(run(`S.river.barrels[${i}].x`),run(`S.river.barrels[${i}].y`));assert(run('S.people[0].target===null'));
 run("equip('boom')");aim(run(`S.river.barrels[${i}].x`),run(`S.river.barrels[${i}].y`));step(35);assert(run(`S.river.barrels[${i}].secured&&!S.river.barrels[${i}].leaking`));
}
assert(run('S.done'),'River mission can be completed using real commands');step(100);assert(run('S.trucks.every(t=>t.state==="finished")'));run('draw();reset()');assert(run('!S.done&&S.river.barrels.every(b=>!b.secured&&!b.leaking)'));
console.log('PASS: river drift, pause, diver equipment, fire, leaking barrel recovery, containment required, success, return, reset and rendering');
