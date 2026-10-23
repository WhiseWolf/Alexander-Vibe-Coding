const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function boot(width=1000){
 const els=new Map(),events={};
 function el(id){if(!els.has(id))els.set(id,{value:({mission:'tunnel',vehicle:'engine',count:'1'})[id]||'',style:{},classList:{toggle(){}},setAttribute(){},replaceChildren(){},append(){},querySelector(){return el('panther-option')},addEventListener(n,f){events[id+n]=f},getContext(){return {}},getBoundingClientRect(){return {left:0,top:0,width,height:width*.68}}});return els.get(id)}
 const context=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>el('tmp')},window:{},requestAnimationFrame(){},console});vm.runInContext(fs.readFileSync('game.js','utf8'),context);
 const run=s=>vm.runInContext(s,context),step=n=>run(`for(let i=0;i<${n*10};i++)tick(.1)`),tap=(x,y)=>events.mappointerdown({button:0,clientX:x*width/1000,clientY:y*width/1000});
 run("reset('normal');start();dispatch()");step(15);run("select('person',S.people[0].id);equip('cutter')");
 return {run,step,tap,el};
}
let game=boot();game.tap(725,322);
assert(game.el('radio').textContent.includes('Notabschaltung'),'A tap on the drawn train door must explain the power lock');
game.run("equip('switch')");game.tap(440,230);game.step(20);assert(game.run('S.tunnel.powerOff'));
game.run("equip('cutter')");game.tap(725,322);
assert.equal(game.run('selected().target?.kind'),'civilian','The visible door must target its trapped passenger');
assert.equal(game.run('selected().target?.index'),0);
for(let i=0;i<300&&game.run('selected().state!=="working"');i++)game.step(.1);
assert.equal(game.run('selected().state'),'working');game.step(2);const work=game.run('selected().job');
assert(game.el('hint').textContent.includes('Sekunden'),'The selected crew must show rescue progress');
game.tap(725,322);assert.equal(game.run('selected().job'),work,'Repeating the door tap must not restart ten seconds of rescue work');
game.run('S.paused=true');game.step(20);assert.equal(game.run('selected().job'),work);game.run('S.paused=false');game.step(10);
assert(game.run('S.civilians[0].saved&&S.civilians[0].care==="waiting"'));
// A firefighter standing on the patient must not intercept the intended rescue command.
game.run("S.people[1].x=855;S.people[1].y=365;select('person',S.people[0].id);equip('cutter')");game.tap(855,365);
assert.equal(game.run('S.selected.id'),game.run('S.people[0].id'));assert.equal(game.run('selected().target?.index'),1);game.step(30);assert(game.run('S.civilians[1].saved'));
// One ambulance still transports both passengers after a rescue through the actual doors.
game.run("$('vehicle').value='ambulance';dispatch()");game.step(180);assert(game.run('S.civilians.every(c=>c.care==="hospital")'));
game=boot(320);game.run("equip('switch')");game.tap(440,230);game.step(20);game.run("equip('cutter')");game.tap(775,322);
assert.equal(game.run('selected().target?.index'),0,'A finger tap within 22 screen pixels of the door must be accepted');
console.log('PASS: drawn train doors, power gate, repeated taps, nearby crew, touch target, pause and both hospital transports');
