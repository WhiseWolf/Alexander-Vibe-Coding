const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),handlers={};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'forest':id==='count'?'3':id==='vehicle'?'engine':'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},querySelector(){return el("panther-option")},replaceChildren(){},append(){},addEventListener:(name,fn)=>handlers[id+name]=fn,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:680})});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el(Math.random())},window:{},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox);}
function step(n){run(`for(let n=0;n<${n*10};n++)tick(.1)`);}
function aim(x,y){handlers.mappointerdown({button:0,clientX:x,clientY:y});}

el('mission').value='tunnel';run('reset("normal");start();dispatch()');step(20);run('draw()');
run("select('person',S.people[0].id);equip('foam');extendHose();extendHose()");aim(run('S.fires[0].x'),run('S.fires[0].y'));assert(run('S.people[0].target===null'),'Liquid action locked until power off');
run("equip('cutter')");aim(725,365);assert(run('S.people[0].target===null'),'Door rescue locked until power off');
run("equip('switch')");aim(440,230);assert(run('S.people[0].target.kind==="panel"'));run('S.paused=true');step(30);assert(run('!S.tunnel.powerOff'));run('S.paused=false');step(20);assert(run('S.tunnel.powerOff'));run('draw()');
for(let ci=0;ci<2;ci++){run("select('person',S.people[0].id);equip('rescue')");aim(run(`S.civilians[${ci}].x`),run(`S.civilians[${ci}].y`));assert(run('S.people[0].target===null'));run("equip('cutter')");aim(run(`S.civilians[${ci}].x`),run(`S.civilians[${ci}].y`));step(40);assert(run(`S.civilians[${ci}].saved`));}
for(let fi=0;fi<run('S.fires.length');fi++){
 for(let attempt=0;attempt<8&&run(`S.fires[${fi}].hp>0`);attempt++){
  run("select('person',S.people.find(p=>p.truckId===S.trucks[0].id).id);equip('foam');extendHose();extendHose()");aim(run(`S.fires[${fi}].x`),run(`S.fires[${fi}].y`));step(170);
  if(!run('S.done')&&run('S.trucks[0].water<20')){run('sendBack(S.trucks[0])');step(100);}
 }
 assert(run(`S.fires[${fi}].hp===0`));
}
assert(!run('S.done'));el('vehicle').value='ambulance';el('count').value='1';run('dispatch()');step(180);assert(run('S.done&&S.tunnel.powerOff'),'Tunnel mission finishes through real equipment and target commands with spread enabled');run('draw();reset()');assert(run('!S.tunnel.powerOff&&!S.active'));
console.log('PASS: tunnel setup/rendering, action gates, switch command, pause, trapped passenger rescue, extinguishing with spread, completion and reset');
