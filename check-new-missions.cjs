const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),handlers={};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'forest':id==='count'?'4':id==='vehicle'?'engine':'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener:(name,fn)=>handlers[id+name]=fn,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:680})});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el(Math.random())},window:{},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox);}
function step(n){run(`for(let n=0;n<${n*10};n++)tick(.1)`);}
function aim(x,y){handlers.mappointerdown({button:0,clientX:x,clientY:y});}
for(const mission of ['car','forest','airport','warehouse','accident']){el('mission').value=mission;run('reset();S.spread=null;start();draw()');assert(run('S.fires.length>0&&S.civilians.length>0'));}
el('mission').value='warehouse';run('reset();S.spread=null;start()');step(101);assert(run('S.hazard.exploded&&S.fires.length===5'));run('draw();S.fires.forEach(f=>f.hp=0);S.civilians.forEach(c=>{c.saved=true;c.care="hospital"})');step(1);assert(run('S.done'));
run('reset();S.spread=null;start();dispatch()');step(10);run("select('person',S.people[0].id);equip('foam')");aim(640,270);step(88);assert(run('S.hazard.resolved&&!S.hazard.exploded'), 'Can prevent explosion through actual dispatch/equip/target flow');
el('mission').value='accident';run('reset();S.spread=null;start();dispatch()');step(10);run("select('person',S.people[0].id);equip('rescue')");aim(765,355);assert(run('S.people[0].target===null'),'Rescue gear cannot free trapped person');run("equip('cutter')");aim(765,355);step(25);assert(run('S.civilians[0].saved'),'Cutter frees trapped person');
run("select('person',S.people[1].id);equip('foam')");aim(680,300);step(120);assert(!run('S.done'));el('vehicle').value='ambulance';el('count').value='1';run('dispatch()');step(120);assert(run('S.done'),'Accident completes through actual commands');
el('mission').value='warehouse';run('reset();S.spread=null;start();S.paused=true');step(110);assert(run('S.hazard.remaining===100'));run('reset()');assert(run('!S.active&&!S.hazard.exploded&&S.people.length===0'));
const html=fs.readFileSync('index.html','utf8');for(const [,script]of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script);
assert(html.includes("mission:'warehouse'")&&html.includes("mission:'accident'")&&html.includes('data-tool="cutter"'));
console.log('PASS: five mission setups, explosion/prevention, cutter rescue, accident completion, pause/reset and inline syntax');
