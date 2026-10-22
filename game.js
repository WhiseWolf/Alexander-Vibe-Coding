'use strict';
const $=id=>document.getElementById(id),canvas=$('map'),ctx=canvas.getContext('2d');
const VEHICLE_LIMIT=4;
// Session-only progression: reloading intentionally starts a fresh watch.
const career={wins:0,practice:false,tutorial:false,lesson:"basics",lessons:[],lastReport:null};
const LESSONS=[
 {id:'basics',mission:'car',title:'1 · Erste Befehle',description:'Bewegen, alle vier Löschmittel, Pause, Polizei, Auftanken, Abziehen und Rettung.'},
 {id:'water',mission:'car',title:'2 · Wasser marsch!',description:'Schlauch verlängern, Hydrant anschließen und zwei Trupps am Y-Verteiler einsetzen.'},
 {id:'accident',mission:'accident',title:'3 · Rettungsschere',description:'Motorbrand löschen, eingeklemmte Person befreien und Krankenwagen einsetzen.'},
 {id:'river',mission:'river',title:'4 · Rettung am Fluss',description:'Tauchausrüstung, treibende Fässer und Ölsperren ausprobieren.'},
 {id:'house',mission:'house',title:'5 · Das dunkle Haus',description:'Strom abschalten, Tür öffnen und beide Räume erkunden.'},
 {id:'tunnel',mission:'tunnel',title:'6 · Nachtexpress',description:'Notabschaltung, Zugtüren und Rettung zweier Fahrgäste.'},
 {id:'warehouse',mission:'warehouse',title:'7 · Gefahrbereich',description:'Gelb markierten Brand löschen und die Explosion verhindern.'},
 {id:'forest',mission:'forest',title:'8 · Hilfe aus der Luft',description:'Vorhut, Löschwagen und gezielten Wasserabwurf ausprobieren.'},
 {id:'airport',mission:'airport',title:'9 · Flughafen-Panther',description:'Panther anfordern, Löschmittel wählen und Dachwerfer einsetzen.'}
];
function tutorialChecklist(){
 const task=(id,label,done,hint)=>({id,label,done:!!done,hint});
 const allHospital=S.civilians.every(c=>c.care==='hospital');
 const steps=[task('dispatch','Feuerwehr anfordern',S.trucks.some(t=>['engine','scout','panther'].includes(t.type)),'Fordere zuerst einen Löschwagen an. Bei der Flughafen-Übung kannst du den Panther wählen.')];
 if(S.lesson==='basics')steps.push(
  task('move','Einen Feuerwehrmann bewegen',S.stats.moved,'Tippe einen Feuerwehrmann an, dann auf freien Boden. Die Mannschaft steigt nach der Ankunft aus.'),
  task('tools','Alle vier Löschmittel am Übungsfeuer testen',['water','foam','powder','additive'].every(t=>S.stats.toolsUsed.includes(t)),'Teste Wasser, Schaum, Pulver und Wasser + Mittel. Jeweils Feuerwehrmann, Ausrüstung, Brand antippen. Ist der Schlauch zu kurz: +40 m kuppeln. Das Übungsfeuer wird bei Bedarf neu entzündet.'),
  task('pause','Pause ausprobieren',S.stats.paused,'Tippe oben auf Pause, danach auf Weiter. Die Einsatzzeit bleibt während der Pause stehen.'),
  task('refill','Einen Wagen auftanken lassen',S.stats.refills>0,'Wähle einen Löschwagen und tippe Zurück / auftanken. Warte auf seine Rückkehr; seine neue Mannschaft steigt wieder aus.'),
  task('withdraw','Einen Fahrzeugplatz freigeben',S.stats.withdrawn>0,'Wähle einen Wagen und Zur Wache / Platz freigeben. Fordere bei Bedarf einen neuen Wagen an.'),
  task('police','Polizei anfordern',S.trucks.some(t=>t.type==='police'),'Fordere einen Polizeiwagen an. Er kann bisher anfahren und zurückfahren; eine Absperrfunktion ist noch nicht eingebaut.')
 );
 if(S.lesson==='water')steps.push(
  task('coupling','Schlauch mit Kupplung verlängern',S.stats.hoseExtensions>0,'Feuerwehrmann wählen, Wasserschlauch holen, dann Schlauch kuppeln +40 m. Reichweite maximal 160 m.'),
  task('hydrant','Hydrant liefert tatsächlich Wasser',S.stats.hydrantUsed,'Feuerwehrmann wählen, Hydrant anschließen, dann blauen Hydranten antippen. Nach fünf Sekunden Anschluss löscht ein zweiter Trupp, damit Wasser nachfließt.'),
  task('splitter','Beide Y-Ausgänge zum Löschen einsetzen',S.stats.splitterUsers.length>=2,'Y-Verteiler setzen wählen, dann freien Boden vor dem Wagen antippen. Nach Aufbau für beide Feuerwehrleute: Schlauch wählen, Y antippen, Brand antippen. Jeder Ausgang muss einmal Wasser liefern.')
 );
 if(['accident','tunnel'].includes(S.lesson))steps.push(task('cutter','Eingeklemmte Menschen befreien',S.civilians.every(c=>c.saved),'Wähle die Rettungsschere und tippe auf die eingeklemmte Person. Im Tunnel zuerst die Notabschaltung bedienen.'));
 if(S.lesson==='river')steps.push(task('diver','Person aus dem Wasser retten',S.civilians.every(c=>c.saved),'Tauchausrüstung holen und die Person im Fluss antippen.'),task('barrels','Alle drei Fässer sichern',S.river.barrels.every(b=>b.secured),'Ölsperre holen und jedes treibende Fass antippen. Die Mannschaft sichert es vereinfacht vom Ufer.'));
 if(['house','tunnel'].includes(S.lesson))steps.splice(1,0,task('power','Notabschaltung bedienen',(S.house||S.tunnel).powerOff,'Notabschaltung wählen, dann den gelben Schaltkasten antippen. Die Arbeit dauert fünf Sekunden.'));
 if(S.lesson==='house')steps.push(task('door','Haustür öffnen',S.house.doorOpen,'Menschen retten wählen und nach der Stromabschaltung auf die gelbe Tür tippen.'),task('rooms','Beide Räume erkunden',S.house.discovered.left&&S.house.discovered.right,'Tippe in jeden dunklen Raum. Erst wenn ein Feuerwehrmann dort ist, werden Menschen und Feuer sichtbar.'));
 if(S.lesson==='warehouse')steps.push(task('hazard','Explosion verhindern',S.hazard.resolved&&!S.hazard.exploded,'Lösche zuerst den gelb markierten Gefahrbereich. Im Tutorial hast du zehn Minuten Warnzeit.'));
 if(S.lesson==='forest')steps.push(task('scout','Vorhut kennenlernen',S.trucks.some(t=>t.type==='scout'),'Fordere eine Vorhut an. Auch hier steigen zwei Feuerwehrleute aus; ein Fahrzeugplatz bleibt für den Krankenwagen frei.'),task('plane','Wasserabwurf auslösen',S.airUsed>0,'Tippe Löschflugzeug an, dann auf einen Brand. Die Zielwahl kannst du durch erneutes Antippen abbrechen.'));
 if(S.lesson==='airport')steps.push(task('panther','Mit dem Panther löschen',S.stats.pantherUsed,'Fordere genau einen Panther an. Wähle ihn, dann ein Löschmittel und eine Flamme. Zum Retten brauchst du zusätzlich eine Mannschaft und einen Krankenwagen.'));
 steps.push(task('hospital','Alle Menschen ins Krankenhaus bringen',allHospital,'Menschen retten wählen (bei Unfall/Tunnel Rettungsschere, im Fluss Tauchausrüstung). Danach einen Krankenwagen anfordern: Er versorgt und transportiert automatisch, bei Bedarf mehrmals.'),task('finish','Alle Brände und Aufgaben abschließen',S.done,'Lösche die übrigen Brände. Bei leerem Tank Hydrant anschließen oder zurück zum Auftanken.'));
 return steps;
}
function tutorialReady(){return tutorialChecklist().filter(t=>t.id!=='finish').every(t=>t.done);}
function updateTutorial(){
 if(!S.tutorial)return;
 const needsFire=S.lesson==='basics'&&!['water','foam','powder','additive'].every(t=>S.stats.toolsUsed.includes(t))||S.lesson==='water'&&(!S.stats.hydrantUsed||S.stats.splitterUsers.length<2)||S.lesson==='forest'&&S.airUsed===0||S.lesson==='airport'&&!S.stats.pantherUsed;
 if(needsFire&&S.fires.every(f=>f.hp<=0)){S.fires[0].hp=40;S.fires[0].max=Math.max(40,S.fires[0].max);radio('Übungsfeuer erneut an: Du kannst die fehlenden Löschaktionen in Ruhe ausprobieren.');}
}
function renderTutorial(){
 $('tutorial-panel').hidden=!S.tutorial;if(!S.tutorial)return;
 const lesson=LESSONS.find(l=>l.id===S.lesson),tasks=tutorialChecklist(),next=tasks.find(t=>!t.done);
 $('tutorial-title').textContent=lesson.title;
 $('tutorial-tasks').textContent=tasks.map(t=>(t.done?'✓ ':'○ ')+t.label).join('\n');
 const hint=(S.hazard?.exploded?'Die Explosion ist passiert. Tippe Übung neu starten, um das Verhindern noch einmal zu üben.':next?.hint)||'Übung geschafft! In der Zentrale wartet die nächste Lektion.';
 if($('tutorial-hint').textContent!==hint)$('tutorial-hint').textContent=hint;
}
function careerDifficulty(){return career.practice||career.tutorial?'leicht':career.wins<2?'leicht':career.wins<4?'normal':'schwer';}
function careerRank(){return career.wins<2?'Nachwuchs-Einsatzleiter':career.wins<4?'Einsatzleiter':'Wachleiter';}
function flightLimit(){return S.difficulty==='schwer'?1:S.difficulty==='normal'?2:3;}
function missionReport(){
 const efficient=S.trucks.length<=(S.mission==='forest'||S.mission==='airport'?4:3);
 const contained=!S.hazard?.exploded&&S.stats.spreadCount===0&&!S.stats.oilLeaked;
 const badges=['Alle Menschen im Krankenhaus'];
 if(efficient)badges.push('Mit wenigen Fahrzeugen geschafft');
 if(S.hazard?.resolved&&!S.hazard.exploded)badges.push('Explosion verhindert');
 if(S.stats.spreadStopped)badges.push('Ausbreitung rechtzeitig gestoppt');
 if(S.river&&!S.stats.oilLeaked)badges.push('Alle Ölfässer dicht gesichert');
 if(S.stats.hydrantUsed)badges.push('Wasserversorgung aufgebaut');
 if(S.stats.splitterUsed)badges.push('Y-Verteiler erfolgreich genutzt');
 if(S.house||S.tunnel)badges.push('Notabschaltung erledigt');
 return {mission:S.mission,difficulty:S.difficulty,practice:career.practice,tutorial:S.tutorial,lesson:S.lesson,seconds:S.elapsed,vehicles:S.trucks.length,flights:S.airUsed,stars:1+Number(efficient)+Number(contained),efficient,contained,badges};
}
function finishMission(){
 S.report=missionReport();career.lastReport=S.report;
 if(S.tutorial&&!career.lessons.includes(S.lesson))career.lessons.push(S.lesson);
 if(!career.practice&&!S.tutorial)career.wins++;
 $('mission-result').hidden=false;$('command-panel').scrollTop=0;
 $('mission-result').textContent='★'.repeat(S.report.stars)+' · '+Math.floor(S.report.seconds/60)+':'+String(Math.floor(S.report.seconds%60)).padStart(2,'0')+' · '+S.report.vehicles+' Fahrzeuge · '+S.report.flights+' Abwürfe · '+S.report.badges.join(' · ');
}
const HOUSE_ROOMS=[{id:'hall',name:'Eingang',x:515,y:365,w:315,h:50},{id:'left',name:'Linker Raum',x:515,y:170,w:150,h:195},{id:'right',name:'Rechter Raum',x:665,y:170,w:165,h:195}];
function houseRoom(p){return HOUSE_ROOMS.find(r=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h);}
function houseVisible(p){return !S.house||p.saved||!!(S.house.doorOpen&&S.house.discovered[houseRoom(p)?.id]);}
function discoverHouse(){if(!S.house?.doorOpen)return;for(const p of S.people){if(['aboard','boarding'].includes(p.state))continue;const r=houseRoom(p);if(r&&!S.house.discovered[r.id]){S.house.discovered[r.id]=true;radio(r.name+' erkundet! Hier sind '+S.civilians.filter(c=>!c.saved&&houseRoom(c)?.id===r.id).length+' Menschen und '+S.fires.filter(f=>f.hp>0&&houseRoom(f)?.id===r.id).length+' Brandstellen.');}}}
function activeVehicles(){return S.trucks.filter(t=>t.state!=='finished');}
function houseRoute(p,g){const from=houseRoom(p)?.id||'outside',to=houseRoom(g)?.id||'outside';if(from===to)return [g];const route=[];const doors={left:{x:590,y:390},right:{x:740,y:390}};if(doors[from])route.push({x:doors[from].x,y:340},doors[from]);if(from==='outside')route.push({x:625,y:440},{x:625,y:390});if(to==='outside')route.push({x:625,y:390},{x:625,y:440});if(doors[to])route.push(doors[to],{x:doors[to].x,y:340});route.push(g);return route;}
const names={engine:'Löschwagen',scout:'Vorhut',panther:'Panther',ambulance:'Krankenwagen',police:'Polizei'};
const toolsName={water:'Wasserschlauch',foam:'Löschschaum',powder:'Löschpulver',additive:'Wasser + Mittel',rescue:'Rettung',cutter:'Rettungsschere',diver:'Tauchausrüstung',boom:'Ölsperre',switch:'Notabschaltung',hydrant:'Hydrant anschließen',splitter:'Y-Verteiler setzen'};
let S,last=0,sound=false;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
// Deliberately simplified game metres: 1 canvas unit equals 0.2 m.
const HOSE_SCALE=.2,HOSE_BASE=80,HOSE_MAX=160;
const usesHose=tool=>['water','foam','additive'].includes(tool);
function supplyHitRadius(){return Math.max(32,22*1000/canvas.getBoundingClientRect().width);}
function truckOutlet(t){return {x:t.x,y:t.y-22};}
function hoseSource(p){return S.splitters.find(y=>y.id===p.splitterId&&y.truckId===p.truckId)||truckOutlet(S.trucks.find(t=>t.id===p.truckId));}
function hoseRoute(source,goal){return [source,...(S.house?.doorOpen?houseRoute(source,goal):[goal])];}
function lineMetres(points){return points.slice(1).reduce((sum,p,i)=>sum+dist(points[i],p),0)*HOSE_SCALE;}
function hoseLengthNeeded(p,goal){return lineMetres(hoseRoute(hoseSource(p),goal));}
function hoseCanReach(p,goal){return !usesHose(p.tool)||hoseLengthNeeded(p,goal)<=(p.hoseLength||HOSE_BASE)+.01;}
function extendHose(){
 const p=selected(),t=S.trucks.find(t=>t.id===p?.truckId);
 if(!S.active||S.done||S.paused||S.selected?.kind!=='person'||!usesHose(p?.tool)||t?.state!=='ready')return;
 if((p.hoseLength||HOSE_BASE)<HOSE_MAX)S.stats.hoseExtensions++;p.hoseLength=Math.min(HOSE_MAX,(p.hoseLength||HOSE_BASE)+40);p.hoseWarning=false;
 radio('Schlauch gekuppelt: '+p.hoseLength+' m. Höchstens 160 m pro Trupp.');ui();
}
function connectBranch(p,y){
 const t=S.trucks.find(t=>t.id===p.truckId);
 if(!usesHose(p.tool)||t?.state!=='ready'||y.truckId!==p.truckId){radio('Dieser Y-Verteiler gehört zu einer anderen Mannschaft. Nutze den Verteiler deines Fahrzeugs.');return;}
 if(S.people.filter(other=>other.id!==p.id&&other.splitterId===y.id).length>=2){radio('Beide Ausgänge am Y-Verteiler sind belegt.');return;}
 p.splitterId=y.id;p.target=null;p.goal={x:y.x,y:y.y};p.state='moving';p.hoseWarning=false;p.trail=[];
 radio('Schlauch am Y-Verteiler verbunden. Tippe jetzt auf dein Löschziel.');ui();
}
function disconnectBranch(){const p=selected();if(!p||S.selected?.kind!=='person'||S.paused||S.done)return;p.splitterId=null;p.hoseWarning=false;radio('Schlauch wieder direkt am Fahrzeug. Prüfe die Reichweite.');ui();}
function orderHydrant(p,h){
 const t=S.trucks.find(t=>t.id===p.truckId);
 if(!h){radio('Tippe auf einen blauen Hydranten H1, H2 oder H3.');return;}
 if(h.truckId&&h.truckId!==t.id){radio('Dieser Hydrant versorgt bereits einen anderen Wagen. Wähle einen freien.');return;}
 if(lineMetres(hoseRoute(truckOutlet(t),h))>HOSE_BASE){radio('Der Hydrant ist zu weit vom Fahrzeug entfernt. Wähle einen näheren.');return;}
 p.target={kind:'hydrant',id:h.id};p.goal={x:h.x,y:h.y+22};p.job=0;if(p.state!=='collect')p.state='moving';radio('Hydrant gewählt. Die Mannschaft schließt die Zuleitung an.');ui();
}
function orderSplitter(p,point){
 const t=S.trucks.find(t=>t.id===p.truckId);
 if(S.splitters.some(y=>y.truckId===t.id)){radio('Dieser Wagen hat bereits einen Y-Verteiler. Mit einem Schlauchtrupp den Verteiler antippen.');return;}
 if(point.x<80||point.x>940||point.y<75||point.y>490||(S.river&&point.x>480&&point.y>150&&point.y<340)||(S.house&&houseRoom(point)&&!houseVisible(point))||S.fires.some(f=>f.hp>0&&dist(f,point)<55)){radio('Setze den Y-Verteiler auf freien, erkundeten Boden außerhalb der Flammen.');return;}
 if(lineMetres(hoseRoute(truckOutlet(t),point))>HOSE_BASE){radio('Die Zuleitung zum Y reicht 80 m. Setze ihn näher am Fahrzeug.');return;}
 p.target={kind:'splitter'};p.goal={x:point.x,y:point.y};p.job=0;if(p.state!=='collect')p.state='moving';radio('Y-Verteiler wird verlegt. Danach können zwei Trupps ihre Schläuche dort verbinden.');ui();
}
function finishSupplyJob(p,t){
 if(p.target.kind==='hydrant'){
  const h=S.hydrants.find(h=>h.id===p.target.id);
  if(!h.truckId||h.truckId===t.id){const old=S.hydrants.find(h=>h.truckId===t.id);if(old)old.truckId=null;h.truckId=t.id;t.hydrantId=h.id;radio('Hydrant verbunden! Dieser Wagen erhält laufend Wasser.');}
  else radio('Der Hydrant wurde inzwischen belegt. Wähle einen freien.');
 }else if(!S.splitters.some(y=>y.truckId===t.id)){
  S.splitters.push({id:S.nextId++,truckId:t.id,x:p.x,y:p.y});radio('Y-Verteiler bereit! Wasserschlauch wählen, dann den gelben Verteiler antippen. Zwei Ausgänge verfügbar.');
 }
 p.target=null;p.state='idle';p.job=0;ui();
}
function disconnectSupply(t){
 for(const h of S.hydrants)if(h.truckId===t.id)h.truckId=null;
 t.hydrantId=null;const removed=S.splitters.filter(y=>y.truckId===t.id).map(y=>y.id);
 S.splitters=S.splitters.filter(y=>y.truckId!==t.id);
 for(const p of S.people)if(removed.includes(p.splitterId))p.splitterId=null;
}
function updateWaterSupply(dt){
 for(const h of S.hydrants){const t=S.trucks.find(t=>t.id===h.truckId);if(t?.state==='ready'&&!S.done){if(t.water<100)S.stats.hydrantUsed=true;t.water=Math.min(100,t.water+dt*2);if(t.water>=20)t.warning=false;}}
}
function drawWaterNetwork(){
 for(const h of S.hydrants){const t=S.trucks.find(t=>t.id===h.truckId);if(t?.state==='ready')path([h,truckOutlet(t)],'#76dcf4',5);ellipse(h.x,h.y,18,18,'#164f68');ctx.fillStyle='#85e2ff';ctx.fillRect(h.x-9,h.y-12,18,25);ctx.fillRect(h.x-16,h.y-5,32,8);label(h.id.toUpperCase(),h.x-10,h.y-26,12,'#bcefff');}
 for(const y of S.splitters){const t=S.trucks.find(t=>t.id===y.truckId);path(hoseRoute(truckOutlet(t),y),'#d7bf75',5);path([{x:y.x-13,y:y.y-13},y,{x:y.x+13,y:y.y-13}],'#ffe18b',7);path([y,{x:y.x,y:y.y+17}],'#ffe18b',7);label('Y '+S.people.filter(p=>p.splitterId===y.id).length+'/2',y.x-18,y.y-25,12,'#ffe18b');}
 for(const p of S.people){if(!usesHose(p.tool)||p.state==='aboard'||!p.trail.length)continue;const points=hoseRoute(hoseSource(p),p);path(points,'#24323480',6);path(points,hoseCanReach(p,p)?'#d7bf75':'#f28b73',3);
  let untilJoint=40/HOSE_SCALE;
  for(let i=1;i<points.length;i++){const from=points[i-1],to=points[i],length=dist(from,to);let offset=untilJoint;while(offset<length){const k=offset/length;ellipse(from.x+(to.x-from.x)*k,from.y+(to.y-from.y)*k,5,5,'#d8e9e9');offset+=40/HOSE_SCALE;}untilJoint=offset-length;}
 }
 const p=selected();if(S.selected?.kind==='person'&&p&&usesHose(p.tool)){const source=hoseSource(p);ctx.save();ctx.strokeStyle='#8ed9df55';ctx.lineWidth=2;ctx.setLineDash([8,10]);ctx.beginPath();ctx.arc(source.x,source.y,(p.hoseLength||HOSE_BASE)/HOSE_SCALE,0,Math.PI*2);ctx.stroke();ctx.restore();}
}
function radio(t){$('radio').textContent='📻 '+t;if(sound&&window.speechSynthesis){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='de-DE';window.speechSynthesis.speak(u);}}
function onMissionComplete(){}
const randomBetween=(a,b)=>a+Math.random()*(b-a);
function makeSpread(){
 const spots={car:[[700,330],[570,228],[825,235],[575,443]],forest:[[500,200],[570,150],[690,150],[815,200],[865,300],[845,440],[760,475],[555,450],[485,325]],airport:[[790,300],[775,445],[530,280]],warehouse:[[575,310],[770,240],[750,400]],accident:[[755,275]],river:[[650,420]],house:[[650,235],[770,350]],tunnel:[[710,260],[920,260]]};
 const limit={car:2,forest:4,airport:2,warehouse:2,accident:1,river:1,house:2,tunnel:2}[S.mission];
 const pool=spots[S.mission].map(([x,y])=>({x,y,used:false,heat:0})).filter(p=>S.fires.every(f=>dist(p,f)>65)&&S.civilians.every(c=>dist(p,c)>45)&&(S.mission!=='car'||S.fires.some(f=>dist(p,f)<230)));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return {fuel:pool.slice(0,limit),timer:randomBetween(35,50),wind:Math.random()<.5?-1:1,pending:null};
}
function updateSpread(dt){if(S.house&&!S.house.doorOpen)return;
 if(S.done||!S.spread)return;
 const spread=S.spread;
 if(spread.pending!==null){
  const fuel=spread.fuel[spread.pending],source=S.fires[fuel.source];
  if(!source||source.hp<source.max*.4){S.stats.spreadStopped++;fuel.heat=0;spread.pending=null;spread.timer=randomBetween(25,40);radio('Ausbreitung gestoppt! Der Ausgangsbrand ist rechtzeitig geschwächt.');return;}
  fuel.heat+=dt/12;
  if(fuel.heat>=1){S.stats.spreadCount++;fuel.used=true;fuel.heat=0;S.fires.push({x:fuel.x,y:fuel.y,hp:55,max:55,heat:1});spread.pending=null;spread.timer=randomBetween(35,50);radio('Das Feuer hat auf eine neue Stelle übergegriffen!');ui();}
  return;
 }
 spread.timer-=dt;if(spread.timer>0)return;spread.timer=randomBetween(35,50);
 const options=spread.fuel.map((fuel,index)=>({fuel,index,source:S.fires.findIndex(f=>f.hp>f.max*.55&&dist(f,fuel)<(S.mission==='forest'?190:230))})).filter(o=>!o.fuel.used&&o.source>=0);
 if(!options.length)return;
 options.sort((a,b)=>spread.wind*(b.fuel.x-a.fuel.x));
 const pick=options[0];pick.fuel.source=pick.source;spread.pending=pick.index;radio(houseVisible(pick.fuel)?'Achtung: Das Feuer droht auf die gelb markierte Stelle überzugreifen! Lösche oder schwäche den Brand daneben.':'Im Haus könnte sich das Feuer weiter ausbreiten. Erkundet die Räume!');
}
function reset(difficulty){S={mission:$('mission').value,tutorial:career.tutorial,lesson:career.lesson,active:false,paused:false,elapsed:0,anim:0,trucks:[],people:[],fires:[],civilians:[],selected:null,nextId:1,air:null,airAim:false,airCooldown:0,done:false,completionWait:0,centerRequested:false,airUsed:0,report:null,stats:{spreadCount:0,spreadStopped:0,oilLeaked:false,hydrantUsed:false,splitterUsed:false,splitterUsers:[],hoseExtensions:0,moved:false,toolsUsed:[],refills:0,withdrawn:0,paused:false,pantherUsed:false},hydrants:[130,440,900].map((x,i)=>({id:'h'+(i+1),x,y:470,truckId:null})),splitters:[],check:0,hazard:null,river:null,spread:null,tunnel:null};
$('mission-result').hidden=true;S.difficulty=['leicht','normal','schwer'].includes(difficulty)?difficulty:['leicht','normal','schwer'][Math.floor(Math.random()*3)];S.house=S.mission==='house'?{powerOff:false,doorOpen:false,discovered:{hall:false,left:false,right:false},panel:{x:455,y:350},door:{x:625,y:425}}:null;
S.tunnel=S.mission==='tunnel'?{powerOff:false,panel:{x:440,y:230}}:null;
S.hazard=S.mission==='warehouse'?{remaining:100,resolved:false,exploded:false,flash:0}:null;
S.river=S.mission==='river'?{barrels:[550,650,750].map((x,i)=>({x,y:275+i*18,secured:false,leaking:false})),warned:false}:null;
S.ignition=S.mission==='car'?[[700,330],[570,228],[825,235]][Math.floor(Math.random()*3)]:null;
const f=S.mission==='house'?[[700,270,110],[755,320,100]]:S.mission==='tunnel'?[[595,275,140],[820,265,160]]:S.mission==='river'?[[560,390,100]]:S.mission==='warehouse'?[[640,270,45],[715,320,100],[620,385,100]]:S.mission==='accident'?[[680,300,110]]:S.mission==='car'?[[S.ignition[0]-30,S.ignition[1]-20,200],[S.ignition[0]+30,S.ignition[1]-5,180],[S.ignition[0]-2,S.ignition[1]+40,180]]:S.mission==='forest'?[[600,220,230],[720,250,230],[790,370,230],[670,440,230],[550,365,230]]:[[655,235,260],[710,285,260],[600,360,260],[735,390,260]];
S.fires=f.map(([x,y,hp],index)=>{const jitter=S.mission==='forest'?28:S.mission==='airport'?20:12;const strength=S.mission==='warehouse'&&index===0?hp:Math.round(hp*randomBetween(.9,1.1));return{x:x+randomBetween(-jitter,jitter),y:y+randomBetween(-jitter,jitter),hp:strength,max:strength,heat:1};});S.civilians=(S.mission==='house'?(S.difficulty==='schwer'?[[780,225],[570,320]]:[[780,225]]):S.mission==='tunnel'?[[725,365],[855,365]]:S.mission==='river'?[[790,215]]:S.mission==='warehouse'?[[815,400]]:S.mission==='accident'?[[765,355]]:S.mission==='airport'?[[825,280],[850,355],[810,420]]:S.mission==='car'?[[785,390]]:[[840,450],[835,500]]).map(([x,y])=>({x,y,saved:false,care:'danger',ambulanceId:null,trapped:['accident','tunnel'].includes(S.mission),underwater:S.mission==='river'}));S.spread=makeSpread();const factor=S.difficulty==='leicht'?.45:S.difficulty==='schwer'?1.35:1;S.fires.forEach(f=>{f.hp*=factor;f.max=f.hp;});if(S.difficulty==='leicht')S.spread.fuel=[];if(S.difficulty==='schwer')S.spread.timer=25;if(S.hazard)S.hazard.remaining=S.tutorial?600:S.difficulty==='leicht'?200:S.difficulty==='schwer'?80:100;$('start').disabled=false;$('pause').textContent='Pause';$('pause').setAttribute('aria-pressed','false');$('radio').textContent='📻 Ein Notruf wartet auf dich.';ui();}
function selected(){if(!S.selected)return null;return (S.selected.kind==='person'?S.people:S.trucks).find(v=>v.id===S.selected.id);}
function select(kind,id){S.selected={kind,id};ui();}
function ui(){const v=selected(),person=S.selected?.kind==='person';$('selection').textContent=v?(person?'Feuerwehrmann '+v.number:names[v.type]+' '+v.number)+' ausgewählt':'Tippe einen Feuerwehrmann oder ein Fahrzeug an';
$('hint').textContent=S.done?(S.river?'Einsatz geschafft! Person gerettet, Brand gelöscht und alle Fässer gesichert.':'Einsatz geschafft! Alle Brände gelöscht und alle Menschen gerettet.')+' Die Mannschaft räumt auf und fährt zurück.':!S.active?'Nimm den Notruf an. Fordere dann einen Löschwagen an. Du siehst die Anfahrt und das Aussteigen.':v?person?(v.tool==='switch'?'Tippe auf den gelb markierten Schaltkasten links am Gebäude. Die Mannschaft bedient die Notabschaltung.':v.tool==='boom'?'Tippe auf ein treibendes Ölfass. Die Mannschaft sichert es vom Ufer aus.':v.tool==='diver'?'Tippe auf die Person im Wasser. Der Taucher geht zur Rettung.':v.tool?'Ausrüstung: '+toolsName[v.tool]+'. Tippe auf eine Flamme zum Löschen, auf eine Person zum Retten oder auf freien Boden zum Gehen.':'Wähle unten eine Ausrüstung. Tippe danach auf das Ziel in der Karte.'):(v.type==='ambulance'?'Dieser Krankenwagen übernimmt befreite Personen automatisch am Sammelplatz, versorgt sie und fährt zum Krankenhaus. Ein Patientenplatz, danach kommt er zurück.':v.type==='panther'?'Wähle ein Löschmittel und tippe auf eine Flamme. Der Panther löscht mit seinem Dachwerfer.':'Die Mannschaft steigt nach der Ankunft aus. Wähle einen Feuerwehrmann. Mit „Zurück“ fährt dieses Fahrzeug zur Wache.'):(S.civilians.some(c=>c.care==='waiting')?'Am Sammelplatz warten Menschen! Fordere einen Krankenwagen an. Er übernimmt Versorgung und Transport automatisch.':'Tippe eine Einheit auf der Karte oder in der Liste an. Du gibst die Befehle; die Mannschaft führt sie aus.');
if(S.active&&!S.done&&S.fires.every(f=>f.hp<=0)&&S.civilians.some(c=>c.care!=='hospital'))$('hint').textContent='Menschen brauchen noch Versorgung und Transport! Fordere Krankenwagen an. Erst nach der Übergabe aller Patienten im Krankenhaus ist die Rettung abgeschlossen.';
const fleet=activeVehicles(),pantherOption=$('vehicle').querySelector('option[value="panther"]');pantherOption.disabled=S.mission!=='airport'||fleet.some(t=>t.type==='panther');if(pantherOption.disabled&&$('vehicle').value==='panther')$('vehicle').value='engine';$('fleet-limit').textContent='Fahrzeuge: '+fleet.length+'/'+VEHICLE_LIMIT+' · Ein Platz bleibt für die Rettung frei';$('withdraw').disabled=!v||!S.active||(S.trucks.find(t=>t.id===(v.truckId||v.id))?.state!=='ready');$('dispatch').disabled=!S.active||S.done||fleet.length>=VEHICLE_LIMIT;$('air').disabled=!S.active||S.done||S.airCooldown>0||!!S.air||S.mission!=='forest'||S.airUsed>=flightLimit();$('air').textContent=S.airUsed>=flightLimit()?'✈ Keine Abwürfe übrig':S.airCooldown>0?'✈ Wieder in '+Math.ceil(S.airCooldown)+' s' :S.airAim?'✈ Zielwahl abbrechen':'✈ Löschflugzeug · '+(flightLimit()-S.airUsed)+' übrig';$('return').disabled=!v||!S.active||(v.type==='ambulance'&&v.state!=='ready');
 document.querySelectorAll('[data-tool]').forEach(b=>{b.hidden=b.dataset.tool==='switch'&&!['tunnel','house'].includes(S.mission);b.disabled=!v||S.done||(!person&&v.type!=='panther')||(v.state==='incoming'||v.state==='returning'||v.state==='refilling');b.classList.toggle('active',v?.tool===b.dataset.tool);if(!person&&['rescue','cutter','diver','boom','switch','hydrant','splitter'].includes(b.dataset.tool))b.disabled=true;});
const crew=person&&v,crewTruck=crew&&S.trucks.find(t=>t.id===crew.truckId);
$('hose-extend').disabled=!crew||!usesHose(crew.tool)||crewTruck?.state!=='ready'||(crew.hoseLength||HOSE_BASE)>=HOSE_MAX||S.paused||S.done;
$('hose-direct').disabled=!crew||!crew.splitterId||S.paused||S.done;
$('hose-info').textContent=crew?(usesHose(crew.tool)?'Schlauch: '+Math.ceil(hoseLengthNeeded(crew,crew))+' / '+(crew.hoseLength||HOSE_BASE)+' m · Quelle: '+(crew.splitterId?'Y-Verteiler':'Fahrzeug')+' · +40 m kuppeln, maximal 160 m.':crew.tool==='hydrant'?'Blauen Hydranten antippen. Nach fünf Sekunden Anschluss erhält der Wagen laufend Wasser.':crew.tool==='splitter'?'Freien Boden innerhalb von 80 m antippen. Danach Schlauch wählen und den Y-Verteiler antippen. Zwei Ausgänge für die Mannschaft dieses Wagens.':'Wasserschlauch wählen, um Reichweite, Kupplungen und Y-Anschluss zu nutzen.'):'Wähle einen Feuerwehrmann: Hydrant anschließen oder Y-Verteiler setzen. Zuleitung 80 m, Truppschlauch 80 bis 160 m. Spielmaße, keine echte Einsatzanleitung.';
renderTutorial();$('units').replaceChildren();S.trucks.filter(t=>t.state!=='finished').forEach(t=>{const b=document.createElement('button');b.textContent=names[t.type]+' '+t.number+' · '+(t.type==='ambulance'?'1 Patientenplatz':Math.round(t.water)+'%')+'\n'+({incoming:'Anfahrt',ready:'Vor Ort',returning:'Rückfahrt',refilling:'Tankt auf',patientApproach:'Zum Sammelplatz',treating:'Versorgt Patient',transporting:'Zum Krankenhaus',hospital:'Übergabe in Klinik',finished:'Wache'}[t.state]||t.state);b.style.whiteSpace='pre-line';b.classList.toggle('active',S.selected?.kind==='truck'&&S.selected.id===t.id);b.onclick=()=>select('truck',t.id);$('units').append(b);});S.people.filter(p=>p.state!=='aboard').forEach(p=>{const b=document.createElement('button');b.textContent='👨‍🚒 Feuerwehrmann '+p.number+' · '+(p.tool?toolsName[p.tool]:'ohne Gerät');b.classList.toggle('active',S.selected?.kind==='person'&&S.selected.id===p.id);b.onclick=()=>select('person',p.id);$('units').append(b);});}
function start(){S.active=true;$('start').disabled=true;radio(S.mission==='house'?'Hausbrand! Von außen sind keine Flammen sichtbar. Schalte mit Notabschaltung den Strom am gelben Kasten aus. Öffne dann mit Menschen retten die markierte Tür. Suche die Person im dunklen Haus und lösche die Brände.':S.mission==='tunnel'?'Nachtexpress im Tunnel! Fordere die Vorhut oder Löschwagen an. Wähle Notabschaltung und tippe auf den Schaltkasten links. Danach lösche die Brände und befreie zwei Fahrgäste mit der Rettungsschere.':S.mission==='river'?'Unfall am Fluss! Lösche den Transporter. Rette die Person mit Tauchausrüstung. Sichere die drei treibenden Fässer: Ölsperre wählen, dann ein Fass antippen.':S.mission==='warehouse'?'Lagerhausbrand! Lösche zuerst den markierten Gefahrbereich, bevor die Warnzeit abläuft. Eine Person braucht Hilfe.':S.mission==='accident'?'Verkehrsunfall! Lösche den Motorbrand. Hole die Rettungsschere und befreie die Person am blauen Auto.':S.mission==='car'?'Ein Auto brennt am Parkplatz! Eine Person braucht Hilfe.':S.mission==='forest'?'Wanderer melden einen Waldbrand. Zwei Menschen sind noch am Waldweg. Fordere Löschwagen an. Mit „Löschflugzeug“ kannst du eine Abwurfstelle wählen.':'Ein Flugzeug brennt auf dem Vorfeld. Drei Personen brauchen Hilfe.');ui();}
function dispatch(){if(!S.active||S.done)return;const count=Number($('count').value),type=$('vehicle').value,fleet=activeVehicles();if(!Object.hasOwn(names,type)||!Number.isInteger(count)||count<1||count>VEHICLE_LIMIT){radio('Bitte gib eine ganze Zahl von 1 bis 4 ein.');return;}
if(fleet.length+count>VEHICLE_LIMIT){radio('Maximal vier Fahrzeuge gleichzeitig. Ziehe einen Wagen mit „Zur Wache“ ab, wenn du andere Hilfe brauchst.');return;}
if(type==='panther'&&(S.mission!=='airport'||count>1||fleet.some(t=>t.type==='panther'))){radio('Ein Panther ist nur am Flughafen erlaubt, höchstens einer gleichzeitig.');return;}
if(type!=='ambulance'&&!fleet.some(t=>t.type==='ambulance')&&fleet.length+count>VEHICLE_LIMIT-1){radio('Ein Platz bleibt für den Krankenwagen frei.');return;}
for(let i=0;i<count;i++){const n=S.trucks.length,id=S.nextId++,slots=new Set(activeVehicles().map(t=>t.slotIndex));let slotIndex=0;while(slots.has(slotIndex))slotIndex++;S.trucks.push({id,type,number:n+1,slotIndex,x:-80-i*90,y:570,slot:{x:230+slotIndex*140,y:535},state:'incoming',water:100,tool:null,target:null,warning:false,timer:0});}radio(count+' '+names[type]+' unterwegs.');ui();}

function spawn(t){if(!['engine','scout'].includes(t.type))return;for(let i=0;i<2;i++){S.people.push({id:S.nextId++,number:S.people.length+1,truckId:t.id,x:t.x+25+i*28,y:t.y-52,state:'idle',tool:null,target:null,goal:null,trail:[],hoseLength:HOSE_BASE,splitterId:null,direction:0,job:0});}radio(names[t.type]+' '+t.number+' vor Ort. Die Mannschaft ist ausgestiegen.');}
function equip(tool){const v=selected();if(!v||S.done||S.paused)return;if(S.selected.kind==='person'&&!usesHose(tool))v.splitterId=null;v.tool=tool;v.target=null;if(S.selected.kind==='person'){const t=S.trucks.find(t=>t.id===v.truckId);if(t.state!=='ready')return;v.state='collect';v.goal={x:t.x+38,y:t.y-40};v.trail=[];radio('Feuerwehrmann '+v.number+' holt '+toolsName[tool]+' aus dem Gerätefach. Wähle jetzt sein Ziel.');}else radio('Dachwerfer bereit: '+toolsName[tool]+'. Tippe auf einen Brand.');ui();}
function finishRescue(p,c,t){
 if(!c.saved){c.saved=true;c.care='waiting';c.x=850+S.civilians.indexOf(c)*40;c.y=460;c.underwater=false;radio('Person gerettet! Sie wartet am Sammelplatz auf einen Krankenwagen.');}
 p.target=null;p.state='packing';p.goal={x:t.x+25,y:t.y-40};ui();
}
function updateAmbulance(t,dt){
 if(t.state==='ready'){
  const index=S.civilians.findIndex(c=>c.care==='waiting'&&!c.ambulanceId);
  if(index<0)return;t.patient=index;const c=S.civilians[index];c.ambulanceId=t.id;t.state='patientApproach';t.goal={x:c.x,y:525};radio('Krankenwagen '+t.number+' fährt zum Sammelplatz.');ui();
 }else if(t.state==='patientApproach'){
  if(move(t,t.goal,dt,75)){t.state='treating';t.timer=8;S.civilians[t.patient].care='treating';radio('Krankenwagen '+t.number+': Wir versorgen die Person.');ui();}
 }else if(t.state==='treating'){
  t.timer-=dt;if(t.timer<=0){S.civilians[t.patient].care='aboard';t.state='transporting';radio('Person im Krankenwagen. Wir fahren zum Krankenhaus.');ui();}
 }else if(t.state==='transporting'){
  if(move(t,{x:-90,y:t.y},dt,90)){S.civilians[t.patient].care='hospital';t.patient=null;t.state='hospital';t.timer=12;radio('Person im Krankenhaus angekommen und übergeben.');ui();}
 }else if(t.state==='hospital'){
  if(S.done){t.state='finished';return;}t.timer-=dt;if(t.timer<=0){t.state='incoming';radio('Krankenwagen '+t.number+' kommt für den nächsten Patienten zurück.');ui();}
 }
}
function sendBack(t,automatic=false,withdraw=false){if(!t||t.state!=='ready')return;disconnectSupply(t);t.withdraw=withdraw;t.target=null;t.state='returning';S.people.filter(p=>p.truckId===t.id).forEach(p=>{p.target=null;p.goal={x:t.x+25,y:t.y-35};p.state='boarding';});radio(automatic?'Arbeit erledigt. Die Mannschaft räumt auf und fährt zur Wache.':names[t.type]+' '+t.number+(withdraw?' fährt zur Wache und gibt seinen Platz frei.':' sammelt die Mannschaft ein und fährt zum Auftanken.'));ui();}
function move(p,g,dt,speed){if(S.house?.doorOpen&&p.truckId){const key=g.x+','+g.y;if(p.routeKey!==key){p.routeKey=key;p.route=houseRoute(p,g);}const waypoint=p.route[0];const done=moveStraight(p,waypoint,dt,speed);if(done)p.route.shift();if(!p.route.length){p.routeKey=null;return true;}return false;}return moveStraight(p,g,dt,speed);}
function moveStraight(p,g,dt,speed){const d=dist(p,g);if(d<1)return true;const k=Math.min(1,speed*dt/d);p.direction=Math.atan2(g.y-p.y,g.x-p.x);p.x+=(g.x-p.x)*k;p.y+=(g.y-p.y)*k;return k===1;}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*1000/r.width,y:(e.clientY-r.top)*680/r.height};}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!S.active||S.paused)return;const p=point(e);if(S.airAim){if(S.done||S.airUsed>=flightLimit())return;const f=S.fires.filter(f=>f.hp>0).sort((a,b)=>dist(a,p)-dist(b,p)).find(f=>dist(f,p)<80);if(!f){radio('Tippe auf eine brennende Stelle für den Wasserabwurf.');return;}S.airUsed++;S.airAim=false;S.air={x:-100,y:f.y,target:{x:f.x,y:f.y},dropped:false};S.airCooldown=75;radio('Löschflugzeug im Anflug auf deine Abwurfstelle.');ui();return;}const operator=selected();if(S.selected?.kind==='person'&&operator&&S.trucks.find(t=>t.id===operator.truckId)?.state==='ready'&&!S.done){const hydrant=S.hydrants.find(h=>dist(h,p)<supplyHitRadius()),splitter=S.splitters.find(y=>dist(y,p)<supplyHitRadius());if(operator.tool==='hydrant'&&hydrant){orderHydrant(operator,hydrant);return;}if(usesHose(operator.tool)&&splitter&&!S.fires.some(f=>f.hp>0&&houseVisible(f)&&dist(f,p)<dist(splitter,p))){connectBranch(operator,splitter);return;}}const person=S.people.filter(v=>v.state!=='aboard').sort((a,b)=>dist(a,p)-dist(b,p)).find(v=>dist(v,p)<29);if(person){select('person',person.id);return;}const truck=S.trucks.find(t=>Math.abs(t.x-p.x)<49&&Math.abs(t.y-p.y)<29&&t.x>0);if(truck){select('truck',truck.id);return;}const v=selected();if(!v||S.done)return;if(S.selected.kind==='person'&&S.trucks.find(t=>t.id===v.truckId)?.state==='ready'){if(v.tool==='hydrant'){orderHydrant(v,S.hydrants.find(h=>dist(h,p)<supplyHitRadius()));return;}if(v.tool==='splitter'){orderSplitter(v,p);return;}const y=S.splitters.find(y=>dist(y,p)<supplyHitRadius());if(y&&usesHose(v.tool)&&!S.fires.some(f=>f.hp>0&&houseVisible(f)&&dist(f,p)<dist(y,p))){connectBranch(v,y);return;}}const control=S.house||S.tunnel;const panel=control&&!control.powerOff&&dist(control.panel,p)<40;const door=S.house&&!S.house.doorOpen&&dist(S.house.door,p)<40;const barrel=S.river?.barrels.find(b=>!b.secured&&dist(b,p)<35);const f=(!S.house||S.house.doorOpen)&&S.fires.find(f=>f.hp>0&&houseVisible(f)&&dist(f,p)<60),c=(!S.house||S.house.doorOpen)&&S.civilians.find(c=>!c.saved&&houseVisible(c)&&dist(c,p)<35);
if(S.house&&!S.house.doorOpen&&!panel&&!door&&p.x>500&&p.x<850&&p.y>160&&p.y<425){radio('Das Haus ist noch geschlossen. Erst Strom aus, dann Tür öffnen.');return;}
if(S.selected.kind==='person'){if(door&&(!S.house.powerOff||v.tool!=='rescue')){radio(!S.house.powerOff?'Zuerst Strom am Schaltkasten abschalten.':'Wähle Menschen retten und tippe auf die Tür.');return;}if(['boarding','aboard'].includes(v.state))return;if((f||c||barrel||panel)&&!v.tool){radio('Wähle zuerst den Schlauch oder die Rettungsausrüstung.');return;}if(panel&&v.tool!=='switch'){radio('Wähle Notabschaltung, um den Schaltkasten zu bedienen.');return;}if(S.tunnel&&!S.tunnel.powerOff&&(c||(f&&v.tool!=='powder'))){radio('Zuerst die Notabschaltung am Schaltkasten bedienen. Die Zugtüren und diese Löschaktion sind noch gesperrt.');return;}if(barrel&&v.tool!=='boom'){radio('Wähle die Ölsperre, um dieses Fass vom Ufer aus zu sichern.');return;}if(c&&v.tool!==(c.underwater?'diver':c.trapped?'cutter':'rescue')){radio(c.underwater?'Für diese Person brauchst du die Tauchausrüstung.':c.trapped?'Wähle die Rettungsschere, um die eingeklemmte Person zu befreien.':'Wähle „Menschen retten“, um dieser Person zu helfen.');return;}if(f&&!c&&['rescue','cutter','diver','boom','switch','hydrant','splitter'].includes(v.tool)){radio('Zum Löschen brauchst du ein Löschmittel.');return;}if(S.river&&!c&&!barrel&&p.x>480&&p.y>150&&p.y<340&&v.tool!=='diver'){radio('Hier ist der Fluss. Nur mit Tauchausrüstung kannst du ins Wasser.');return;}v.target=door?{kind:'door'}:panel?{kind:'panel'}:barrel?{kind:'barrel',index:S.river.barrels.indexOf(barrel)}:c?{kind:'civilian',index:S.civilians.indexOf(c)}:f?{kind:'fire',index:S.fires.indexOf(f)}:null;v.goal=door?{x:S.house.door.x,y:S.house.door.y+30}:panel?{x:control.panel.x,y:control.panel.y+35}:barrel?{x:barrel.x,y:365}:c?{x:c.x-20,y:c.y+18}:f?{x:S.house?Math.max(houseRoom(f).x+25,f.x-45):f.x-85,y:S.house?Math.min(350,f.y+25):f.y+25}:{x:clamp(p.x,80,940),y:clamp(p.y,75,490)};if(f&&usesHose(v.tool)&&!hoseCanReach(v,v.goal)){v.target=null;v.goal=null;v.state='idle';radio('Schlauch zu kurz! Kupple +40 m oder verbinde den Trupp mit einem Y-Verteiler.');ui();return;}if(v.state!=='collect')v.state='moving';v.job=0;radio(v.target?'Befehl verstanden. Ich gehe zum Ziel.':'Ich gehe dorthin.');}
else if(v.type==='panther'&&v.state==='ready'){if(S.tunnel&&!S.tunnel.powerOff&&v.tool!=='powder'){radio('Zuerst die Notabschaltung am Schaltkasten bedienen.');return;}if(!v.tool){radio('Wähle zuerst ein Löschmittel.');return;}if(f){v.target=S.fires.indexOf(f);radio('Panther: Dachwerfer auf das Ziel gerichtet.');}}ui();});
function tick(dt){if(!S.active||S.paused)return;if(!S.done)S.elapsed+=dt;if(S.hazard)S.hazard.flash=Math.max(0,S.hazard.flash-dt);S.airCooldown=Math.max(0,S.airCooldown-dt);
if(S.river){for(const b of S.river.barrels){if(!b.secured){b.x=Math.min(885,b.x+dt*2.2);if(b.x>=885){b.leaking=true;S.stats.oilLeaked=true;}}}if(!S.river.warned&&S.river.barrels.some(b=>b.leaking)){S.river.warned=true;radio('Ein Fass verliert Öl! Sichere es mit der Ölsperre. Der Einsatz bleibt lösbar.');}}
updateWaterSupply(dt);
for(const t of S.trucks){if(t.type==='ambulance'&&['patientApproach','treating','transporting','hospital'].includes(t.state)){updateAmbulance(t,dt);continue;}if(t.state==='incoming'){if(move(t,t.slot,dt,80)){t.state='ready';spawn(t);if(S.done)sendBack(t,true);ui();}}else if(t.state==='returning'){const crew=S.people.filter(p=>p.truckId===t.id);if(crew.every(p=>p.state==='aboard')&&move(t,{x:-90,y:t.y},dt,85)){if(t.withdraw)S.stats.withdrawn++;t.state=S.done||t.withdraw?'finished':'refilling';t.timer=12;ui();}}else if(t.state==='refilling'){if(S.done){t.state='finished';continue;}t.timer-=dt;if(t.timer<=0){S.stats.refills++;t.water=100;t.warning=false;t.state='incoming';S.people=S.people.filter(p=>p.truckId!==t.id);radio(names[t.type]+' '+t.number+' ist aufgetankt und kommt zurück.');ui();}}if(t.state==='ready'&&t.type==='panther'&&t.target!==null){const f=S.fires[t.target];if(!f||f.hp<=0||t.water<=0){t.target=null;}else attack(t,f,dt,1.5);}if(t.state==='ready'&&t.type==='ambulance')updateAmbulance(t,dt);}
for(const p of S.people){const t=S.trucks.find(t=>t.id===p.truckId);if(p.state==='boarding'){if(move(p,p.goal,dt,65)){p.state='aboard';p.trail=[];}}else if(p.state==='packing'){if(move(p,p.goal,dt,65)){p.state='idle';p.trail=[];}}else if(p.state==='collect'){const g={x:t.x+38,y:t.y-40};if(move(p,g,dt,70)){p.state=p.goal?'moving':'idle';p.trail=[{x:g.x,y:g.y}];}}else if(p.state==='moving'&&p.goal){if(!p.target&&dist(p,p.goal)>1&&dt>0)S.stats.moved=true;if(p.target?.kind==='barrel')p.goal={x:S.river.barrels[p.target.index].x,y:365};if(move(p,p.goal,dt,S.house&&S.house.doorOpen&&p.goal.x>500&&p.goal.y<425?40:70)){p.state=p.target?'working':'idle';}if(p.tool&&!['rescue','cutter','diver','boom','switch','hydrant','splitter'].includes(p.tool)&&(p.trail.length===0||dist(p,p.trail[p.trail.length-1])>25))p.trail.push({x:p.x,y:p.y});}else if(p.state==='working'&&p.target){if(p.target.kind==='fire'){const f=S.fires[p.target.index];if(f.hp<=0){p.target=null;p.state='packing';p.goal={x:t.x+25,y:t.y-40};radio('Feuerwehrmann '+p.number+': Mein Ziel ist gelöscht. Ich bringe das Gerät zurück.');ui();}else if(t.water<=0){p.state='idle';p.target=null;radio('Tank leer. Schicke das Fahrzeug zum Auftanken und fordere Verstärkung an.');ui();}else attack(p,f,dt,1);}else if(['hydrant','splitter'].includes(p.target.kind)){p.job+=dt;if(p.job>=5)finishSupplyJob(p,t);}else if(p.target.kind==='panel'){p.job+=dt;if(p.job>=5){(S.house||S.tunnel).powerOff=true;p.target=null;p.state='packing';p.goal={x:t.x+25,y:t.y-40};radio(S.house?'Strom ausgeschaltet! Wähle Menschen retten und öffne die markierte Tür.':'Notabschaltung bestätigt! Die Funken sind weg. Löscht die Brände und befreit die Fahrgäste mit der Rettungsschere.');ui();}}else if(p.target.kind==='door'){p.job+=dt;if(p.job>=4){S.house.doorOpen=true;S.house.discovered.hall=true;p.target=null;p.state='idle';radio('Tür offen! Nur der Eingang ist sichtbar. Tippe in einen dunklen Raum, um ihn zu erkunden. Suche Menschen, lösche und fordere einen Krankenwagen an. Schwierigkeit: '+S.difficulty);ui();}}else if(p.target.kind==='barrel'){const b=S.river.barrels[p.target.index];if(dist(p,{x:b.x,y:365})>30){p.goal={x:b.x,y:365};p.state='moving';}else{p.job+=dt;if(p.job>=8){b.secured=true;b.leaking=false;p.target=null;p.state='packing';p.goal={x:t.x+25,y:t.y-40};radio('Ölfass gesichert! Die Ölsperre hält das Öl zurück.');ui();}}}else{const c=S.civilians[p.target.index];p.job+=dt;if(p.job>=(c.underwater?12:c.trapped?10:6)){finishRescue(p,c,t);}}}}
if(S.air){S.air.x+=dt*200;if(S.air.x>=S.air.target.x&&!S.air.dropped){S.air.dropped=true;S.fires.filter(f=>Math.abs(f.y-S.air.target.y)<=110&&Math.abs(f.x-S.air.target.x)<=170).forEach(f=>f.hp=Math.max(0,f.hp-110));radio('Löschflugzeug: Wasserabwurf erfolgt.');}if(S.air.x>1150)S.air=null;}
discoverHouse();
updateHazard(dt);
updateSpread(dt);
updateTutorial();
if(!S.done&&S.fires.every(f=>f.hp<=0)&&S.civilians.every(c=>c.care==='hospital')&&(!S.river||S.river.barrels.every(b=>b.secured))&&(!S.tunnel||S.tunnel.powerOff)&&(!S.tutorial||tutorialReady())){S.done=true;S.airAim=false;finishMission();S.trucks.filter(t=>t.state==='ready').forEach(t=>sendBack(t,true));radio(S.river?'Einsatz geschafft! Person gerettet, Brand gelöscht und alle Ölfässer gesichert. Die Mannschaft räumt auf.':'Einsatz geschafft! Alle Menschen gerettet, alle Brände gelöscht. Die Mannschaft räumt auf.');ui();}
if(S.done&&!S.centerRequested){S.completionWait+=dt;if(S.completionWait>=6){S.centerRequested=true;onMissionComplete();return;}}
S.check+=dt;if(S.check>=1){S.check=0;ui();}}
function updateHazard(dt){
 if(!S.hazard||S.hazard.resolved)return;
 const h=S.hazard;
 if(S.fires[0].hp<=0){h.resolved=true;radio('Gefahrbereich gelöscht! Die Explosion ist verhindert.');return;}
 h.remaining=Math.max(0,h.remaining-dt);
 if(h.remaining===0){h.resolved=true;h.exploded=true;h.flash=1;
 S.fires.push({x:780,y:235,hp:130,max:130,heat:1},{x:775,y:380,hp:130,max:130,heat:1});
 radio('Knall im Lagerhaus! Zwei weitere Brandstellen. Löscht weiter und rettet die Person.');ui();}
}
function attack(unit,f,dt,mult){if(!houseVisible(f))return;if(unit.truckId&&!hoseCanReach(unit,unit)){if(!unit.hoseWarning){unit.hoseWarning=true;radio('Schlauch reicht nicht! Kupple +40 m oder wähle einen Y-Verteiler.');}return;}if(S.tunnel&&!S.tunnel.powerOff&&unit.tool!=='powder')return;const t=unit.truckId?S.trucks.find(t=>t.id===unit.truckId):unit;const efficiency=S.mission==='forest'?{water:1,foam:.7,powder:.35,additive:1.15}:{water:.65,foam:1.15,powder:1,additive:.95};if(f.hp>0&&dt>0&&t.water>0){if(unit.splitterId&&usesHose(unit.tool)){S.stats.splitterUsed=true;if(!S.stats.splitterUsers.includes(unit.id))S.stats.splitterUsers.push(unit.id);}if(!S.stats.toolsUsed.includes(unit.tool))S.stats.toolsUsed.push(unit.tool);if(unit.type==='panther')S.stats.pantherUsed=true;}f.hp=Math.max(0,f.hp-dt*1.0*mult*(efficiency[unit.tool]||.65));t.water=Math.max(0,t.water-dt*.62*mult);if(t.water<20&&!t.warning){t.warning=true;radio(names[t.type]+' '+t.number+': Tank unter 20 Prozent. Bitte Ersatz schicken und auftanken lassen.');}}
// Detailed top-down shapes, shaded surfaces and animated effects; no external assets.
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function path(points,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
function label(s,x,y,size=13,color='#edf5ee'){ctx.font='600 '+size+'px system-ui';ctx.fillStyle=color;ctx.fillText(s,x,y);}
function tree(x,y,r=30){ellipse(x+9,y+10,r+5,r,'#152f3060');const g=ctx.createRadialGradient(x-10,y-10,3,x,y,r);g.addColorStop(0,'#6a8a50');g.addColorStop(.6,'#365c3c');g.addColorStop(1,'#203e30');ellipse(x,y,r,r,g);for(let j=0;j<5;j++)ellipse(x+Math.sin(j*2.4)*r*.55,y+Math.cos(j*2.4)*r*.55,r*.4,r*.35,'#4d70424d');}
function car(x,y,burnt=false){ctx.save();ctx.translate(x,y);ctx.rotate(-.28);ellipse(7,9,36,22,'#152b3155');ctx.fillStyle='#182228';ctx.fillRect(-24,-22,12,44);ctx.fillRect(15,-22,12,44);const g=ctx.createLinearGradient(0,-19,0,19);g.addColorStop(0,burnt?'#55534b':'#899baa');g.addColorStop(1,burnt?'#292c2a':'#374a61');ctx.fillStyle=g;ctx.fillRect(-39,-19,78,38);ctx.fillStyle='#202f38';ctx.fillRect(-15,-16,34,32);ctx.fillStyle='#91b2bda0';ctx.fillRect(-20,-14,8,28);ctx.fillRect(17,-14,7,28);ctx.fillStyle='#bfd3dc';ctx.fillRect(-7,-12,19,24);ctx.fillStyle='#e9d8b6';ctx.fillRect(33,-16,5,6);ctx.fillRect(33,10,5,6);ctx.restore();}
function drawTruck(t){if(t.x<-70)return;ctx.save();ctx.translate(t.x,t.y);if(['returning','transporting'].includes(t.state))ctx.rotate(Math.PI);ellipse(6,7,51,28,'#10222975');ctx.fillStyle='#101b22';for(const x of [-26,23]){ctx.fillRect(x,-27,13,10);ctx.fillRect(x,17,13,10);}const g=ctx.createLinearGradient(0,-23,0,23);g.addColorStop(0,t.type==='ambulance'?'#f4efe1':t.type==='police'?'#b8d1d9':'#f05342');g.addColorStop(1,t.type==='ambulance'?'#9eaba8':t.type==='police'?'#314758':'#8f2927');ctx.fillStyle=g;ctx.fillRect(-48,-22,96,44);ctx.fillStyle='#d5d8cb';ctx.fillRect(-42,-18,55,36);ctx.strokeStyle='#738789';ctx.lineWidth=1;for(let x=-40;x<12;x+=9){ctx.strokeRect(x,-15,7,30);}ctx.fillStyle='#394c58';ctx.fillRect(20,-18,16,36);ctx.fillStyle='#a6ced2';ctx.fillRect(33,-17,8,34);ctx.fillStyle='#f9eeae';ctx.fillRect(44,-19,4,8);ctx.fillRect(44,11,4,8);ctx.fillStyle=Math.sin(S.anim*9)>0?'#72dfff':'#3370bb';ctx.fillRect(17,-23,8,46);ctx.fillStyle='#eecc6b';ctx.fillRect(-44,-3,57,6);if(t.type==='panther'){ellipse(-5,0,13,13,'#505b5e');path([{x:-5,y:0},{x:25,y:-5}],'#e4e2cc',7);}ctx.restore();if(S.selected?.kind==='truck'&&S.selected.id===t.id){ctx.strokeStyle='#ffdd75';ctx.lineWidth=3;ctx.strokeRect(t.x-53,t.y-30,106,60);}label(names[t.type]+' '+t.number,t.x-48,t.y-35,11);if(t.type==='ambulance'){label(t.state==='treating'?'Versorgung '+Math.ceil(t.timer)+' s':t.state==='transporting'?'Patient an Bord':'1 Patientenplatz',t.x-48,t.y+44,11,'#c0ead9');}else{ctx.fillStyle='#233d49';ctx.fillRect(t.x-42,t.y+29,84,5);ctx.fillStyle=t.water<20?'#ffac67':'#66c7e9';ctx.fillRect(t.x-42,t.y+29,84*t.water/100,5);}}
function drawPerson(p,civilian=false){if(p.state==='aboard'||(civilian&&['aboard','hospital'].includes(p.care)))return;const sel=S.selected?.kind==='person'&&S.selected.id===p.id;if(sel){ellipse(p.x,p.y,22,22,'#e8c35b40');ctx.strokeStyle='#ffe28a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,23,0,Math.PI*2);ctx.stroke();}ellipse(p.x+4,p.y+5,12,9,'#15282f70');ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.direction||0);const walk=['moving','boarding','collect'].includes(p.state)?Math.sin(S.anim*12)*5:0;ctx.fillStyle='#17262d';ctx.fillRect(-8,-9-walk,16,6);ctx.fillRect(-8,4+walk,16,6);ctx.fillStyle=civilian?'#638db5':p.tool==='diver'?'#243a52':'#e4a045';ctx.fillRect(-7,-8,17,16);ctx.fillStyle='#ece68c';ctx.fillRect(0,-9,3,18);ellipse(7,0,8,8,civilian?'#deb08e':'#f3d164');if(!civilian){path([{x:12,y:-7},{x:14,y:7}],'#403a32',3);ellipse(-4,0,4,7,'#4e5e5e');}ctx.restore();if(!civilian)label(String(p.number),p.x-5,p.y-27,12);else{if(p.underwater){ctx.strokeStyle='#83e6ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,25,0,Math.PI*2);ctx.stroke();}label(p.care==='waiting'?'RTW NÖTIG':p.care==='treating'?'VERSORGUNG':p.underwater?'TAUCHRETTUNG':'Hilfe!',p.x-40,p.y-32,11,p.saved?'#9fe9c7':'#edf5ee');}}
function fireFX(f){if(f.hp<=0)return;const r=clamp(f.hp/f.max,.15,1);ellipse(f.x,f.y,40,30,'#ff6c2440');for(let i=0;i<9;i++){const a=i*2.4,x=f.x+Math.sin(a)*25*r,y=f.y+Math.cos(a)*24*r;const g=ctx.createRadialGradient(x,y,1,x,y,16*r+5);g.addColorStop(0,'#fff2a5');g.addColorStop(.3,'#ffb633');g.addColorStop(.8,'#ed572ac0');g.addColorStop(1,'#dc392000');ellipse(x,y,(13+Math.sin(S.anim*10+i)*4)*r+4,18*r+4,g);}for(let j=0;j<6;j++){const k=(S.anim*.18+j/6)%1;ellipse(f.x+k*40,f.y-k*58,12+k*20,10+k*16,'rgba(44,48,48,'+(.32*(1-k))+')');}}
function jet(from,f,tool){const color={water:'#a5e6ffd0',foam:'#f3faf1e0',powder:'#e9d4a3c0',additive:'#8edfcbd0'}[tool]||'#a5e6ff';path([from,f],color,tool==='foam'?8:4);for(let i=0;i<8;i++){const k=(S.anim*1.6+i/8)%1;ellipse(from.x+(f.x-from.x)*k,from.y+(f.y-from.y)*k,2,2,'#ecfaf6');}ellipse(f.x,f.y,22+Math.sin(S.anim*9)*4,16,color);}
function draw(){ctx.fillStyle='#54714f';ctx.fillRect(0,0,1000,680);for(let i=0;i<240;i++){ellipse((i*173+23)%1000,(i*97+17)%680,2+(i%3),2,i%2?'#668155':'#496946');}
ctx.fillStyle='#515b5d';ctx.fillRect(0,500,1000,145);ctx.fillStyle='#60696b';ctx.fillRect(0,511,1000,125);for(let x=10;x<1000;x+=90){ctx.fillStyle='#d8d6b2';ctx.fillRect(x,570,43,4);}path([{x:0,y:501},{x:1000,y:501}],'#b4b6a3',4);
if(S.mission==='car'){ctx.fillStyle='#767d79';ctx.fillRect(510,175,380,300);for(let x=535;x<890;x+=90){path([{x,y:195},{x,y:265}],'#bbc5b5',2);path([{x,y:425},{x,y:468}],'#bbc5b5',2);}car(570,228);car(825,235);car(700,330,S.fires.every(f=>f.hp<=0));car(575,443);[[130,150],[240,205],[375,290],[930,160],[945,420],[370,110],[120,400]].forEach(([x,y])=>tree(x,y));label('PARKPLATZ · AUTOBRAND',535,158,16);}
else if(S.mission==='forest'){path([{x:450,y:500},{x:480,y:380},{x:740,y:130}],'#9b926a',55);for(let i=0;i<28;i++){const x=100+(i*149)%830,y=100+(i*113)%340;if(!S.fires.some(f=>dist({x,y},f)<55))tree(x,y,25+i%13);}S.fires.forEach(f=>tree(f.x,f.y,34));label('WALDWEG',470,470);}
else if(S.mission==='house'){
ctx.fillStyle='#b1a58e';ctx.fillRect(500,155,345,275);ctx.fillStyle=S.house.doorOpen?'#283138':'#78574e';ctx.fillRect(515,170,315,245);
if(S.house.doorOpen){path([{x:665,y:175},{x:665,y:365}],'#aaa392',8);for(const [a,b] of [[515,565],[615,715],[765,830]])path([{x:a,y:365},{x:b,y:365}],'#aaa392',8);ctx.fillStyle='#67594f';ctx.fillRect(735,190,70,30);label('DUNKEL · MIT RAUCH',535,195,13);}
else{for(let y=180;y<415;y+=24)path([{x:515,y},{x:830,y}],'#936f5e',3);label('FEUER VON AUSSEN UNSICHTBAR',505,140,13);}
const h=S.house;ctx.fillStyle=h.powerOff?'#71b291':'#efc15f';ctx.fillRect(h.panel.x-22,h.panel.y-25,44,50);label(h.powerOff?'STROM AUS':'STROM',415,312,14);ctx.fillStyle=h.doorOpen?'#91c6a2':'#f2cc77';ctx.fillRect(600,415,50,18);label(h.doorOpen?'TÜR OFFEN':'TÜR ÖFFNEN',575,458,14);label('HAUSBRAND',520,110,18);
}else if(S.mission==='tunnel'){
ctx.fillStyle='#172433';ctx.fillRect(0,0,1000,500);ctx.fillStyle='#35434f';ctx.fillRect(395,145,590,295);ctx.fillStyle='#111b29';ctx.fillRect(480,175,495,230);ctx.fillStyle='#6c7176';ctx.fillRect(485,340,490,58);
for(let x=490;x<975;x+=25)path([{x,y:253},{x,y:312}],'#695d51',5);
for(let y of [265,300])path([{x:480,y},{x:975,y}],'#b2bec7',4);
for(const [i,x]of [595,725,855].entries()){ellipse(x+5,290,61,25,'#00000080');ctx.fillStyle=i===0?'#c05049':'#d7d9cc';ctx.fillRect(x-57,255,114,60);ctx.fillStyle='#506575';ctx.fillRect(x-48,263,96,18);for(let w=x-43;w<x+46;w+=22){ctx.fillStyle='#add7df';ctx.fillRect(w,264,15,16);}path([{x:x-53,y:307},{x:x+53,y:307}],'#d4a44f',5);ctx.fillStyle='#2d3e4a';ctx.fillRect(x-20,294,40,20);if(i>0){const saved=S.civilians[i-1].saved;ctx.fillStyle=saved?'#65c3a4':'#efbe66';ctx.fillRect(x-18,316,36,12);label(saved?'BEFREIT':'TÜR KLEMMT',x-40,346,11,saved?'#9ee3c8':'#ffdd75');}}
for(let x=500;x<975;x+=100){ellipse(x,190,9,5,S.tunnel.powerOff?'#aee9cc':Math.sin(S.anim*6)>0?'#f9b669':'#795945');}
const box=S.tunnel.panel;ctx.fillStyle=S.tunnel.powerOff?'#4d967d':'#cf9c4e';ctx.fillRect(box.x-24,box.y-27,48,54);label(S.tunnel.powerOff?'✓':'⚡',box.x-10,box.y+8,23);label('SCHALTKASTEN',box.x-55,box.y-40,12,'#ffdd75');if(!S.tunnel.powerOff){ctx.strokeStyle='#ffdd75';ctx.lineWidth=3;ctx.strokeRect(box.x-30,box.y-33,60,66);if(Math.sin(S.anim*17)>0)path([{x:577,y:245},{x:585,y:225},{x:595,y:243},{x:605,y:226}],'#a9dfff',3);}
label('NACHTEXPRESS · TUNNELRETTUNG',400,115,17);label('SICHERER ZUGANG',410,425,12,'#b0c8d4');
}else if(S.mission==='river'){
ctx.fillStyle='#719775';ctx.fillRect(465,130,500,260);ctx.fillStyle='#397f99';ctx.fillRect(480,155,480,190);for(let i=0;i<16;i++){const x=490+(i*41+S.anim*18)%455,y=175+(i*29)%145;path([{x,y},{x:x+24,y}],'#8fd6df70',3);}path([{x:480,y:352},{x:965,y:352}],'#bca77c',12);ctx.fillStyle='#a7a69a';ctx.fillRect(605,130,55,240);for(let x of [610,654])path([{x,y:130},{x,y:360}],'#d8d8c8',3);car(560,395);label('FLUSSUNFALL · ÖLFÄSSER SICHERN',490,110,16);label('ÖLSPERRE → FASS ANTIPPEN',675,380,12,'#ffdd75');S.river.barrels.forEach(b=>{if(b.leaking)ellipse(b.x-15,b.y,45,24,'#202b37b0');ctx.fillStyle=b.secured?'#80c7a2':'#ad7951';ctx.fillRect(b.x-14,b.y-18,28,36);path([{x:b.x-14,y:b.y-11},{x:b.x+14,y:b.y-11}],'#3d4248',3);path([{x:b.x-14,y:b.y+11},{x:b.x+14,y:b.y+11}],'#3d4248',3);if(b.secured){path([{x:b.x-32,y:b.y+24},{x:b.x+32,y:b.y+24}],'#ffdb75',8);label('✓',b.x-5,b.y+5,17);}else label('ÖL',b.x-11,b.y+5,12,'#ffe6ba');});
}else if(S.mission==='warehouse'){
ctx.fillStyle='#7f8580';ctx.fillRect(490,150,360,300);
ctx.fillStyle='#313e48';ctx.fillRect(525,180,285,240);
ctx.fillStyle='#8398a1';ctx.fillRect(535,190,265,220);
for(let y=200;y<405;y+=20)path([{x:535,y},{x:800,y}],'#60737e',4);
ctx.fillStyle='#263e47';ctx.fillRect(635,410,85,20);
for(let x=580;x<760;x+=70){ctx.fillStyle='#af8f56';ctx.fillRect(x,435,45,30);}
label('LAGERHAUS · GEFAHRBEREICH',515,135,16);
if(!S.hazard.resolved){ctx.strokeStyle=Math.sin(S.anim*6)>0?'#ffdf77':'#ef6949';ctx.lineWidth=5;ctx.strokeRect(590,225,100,90);label('ZUERST LÖSCHEN',565,210,14,'#ffdd75');}
}else if(S.mission==='accident'){
ctx.fillStyle='#6d797c';ctx.fillRect(475,145,390,330);
path([{x:665,y:155},{x:665,y:470}],'#d4d7b8',4);
car(680,300);ctx.save();ctx.translate(750,350);ctx.rotate(1.1);car(0,0);ctx.restore();
for(let y=175;y<455;y+=55){ellipse(495,y,7,7,'#ffa35f');}
label('VERKEHRSUNFALL',530,130,17);
label('RETTUNGSSCHERE → PERSON',695,405,12,'#ffdd75');
}else{ctx.fillStyle='#899492';ctx.fillRect(360,95,610,395);for(let x=380;x<970;x+=90){path([{x,y:100},{x,y:488}],'#7b8583',1);}path([{x:390,y:440},{x:900,y:440}],'#dbc777',3);ctx.save();ctx.translate(680,300);ctx.rotate(-.35);ellipse(15,15,140,110,'#45575b45');ctx.fillStyle='#ced8d5';ctx.beginPath();ctx.moveTo(-110,0);ctx.lineTo(30,-15);ctx.lineTo(95,-130);ctx.lineTo(105,-122);ctx.lineTo(70,-12);ctx.lineTo(135,-7);ctx.lineTo(154,-35);ctx.lineTo(166,-34);ctx.lineTo(155,0);ctx.lineTo(166,34);ctx.lineTo(154,35);ctx.lineTo(135,7);ctx.lineTo(70,12);ctx.lineTo(105,122);ctx.lineTo(95,130);ctx.lineTo(30,15);ctx.closePath();ctx.fill();path([{x:-85,y:0},{x:126,y:0}],'#778b98',4);for(let x=-65;x<100;x+=12){ellipse(x,-7,2,2,'#384e60');ellipse(x,7,2,2,'#384e60');}ctx.restore();label('FLUGHAFEN · VORFELD',390,80,16);}
label('← FEUERWEHRWACHE',25,665,13);label('SAMMELPLATZ',830,478,11);ellipse(885,460,20,20,'#73b4a9');label('+',879,466,20);
drawWaterNetwork();
S.trucks.forEach(drawTruck);S.civilians.filter(houseVisible).forEach(c=>drawPerson(c,true));S.people.forEach(p=>drawPerson(p));S.fires.filter(houseVisible).forEach(fireFX);if(S.house&&S.house.doorOpen){for(let i=0;i<7;i++)ellipse(550+(i*41)%260,230+(i*37)%150,38,23,'#73818a35');}
if(S.spread){S.spread.fuel.filter(f=>f.heat>0&&!f.used&&houseVisible(f)).forEach(f=>{ctx.strokeStyle='#ffdd75';ctx.lineWidth=4;ctx.beginPath();ctx.arc(f.x,f.y,24+f.heat*12,0,Math.PI*2);ctx.stroke();label('BRANDGEFAHR',f.x-45,f.y-38,11,'#ffdd75');});if(S.mission==='forest'){label('WIND '+(S.spread.wind>0?'→':'←'),35,120,16,'#d7eddd');}}
S.people.filter(p=>p.state==='working'&&p.target?.kind==='fire').forEach(p=>{const t=S.trucks.find(t=>t.id===p.truckId);if(t.water>0&&S.fires[p.target.index].hp>0&&hoseCanReach(p,p))jet(p,S.fires[p.target.index],p.tool);});S.trucks.filter(t=>t.state==='ready'&&t.target!==null&&t.water>0).forEach(t=>jet({x:t.x+25,y:t.y},S.fires[t.target],t.tool));
if(S.house?.doorOpen){for(const r of HOUSE_ROOMS){if(!S.house.discovered[r.id]){ctx.fillStyle='#111c29';ctx.fillRect(r.x,r.y,r.w,r.h);label('UNERKUNDET',r.x+12,r.y+80,12,'#9babb9');label('Hierhin tippen',r.x+12,r.y+103,11,'#9babb9');}}}
if(S.air){const a=S.air;if(a.dropped){for(let i=0;i<25;i++)ellipse(a.x-35-i*9,a.y+Math.sin(i)*75,15,12,'#c5edff60');}ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle='#e5d575';ctx.fillRect(-35,-7,70,14);ctx.fillStyle='#e4e5d4';ctx.fillRect(-9,-53,17,106);ctx.fillRect(-29,-26,7,52);ellipse(35,0,12,7,'#cbd5d4');ctx.restore();}
if(S.hazard){const h=S.hazard;ctx.fillStyle='#142831e8';ctx.fillRect(200,55,620,40);label(h.exploded?'EXPLOSION · Zwei neue Brandstellen':h.resolved?'EXPLOSION VERHINDERT':'EXPLOSIONSWARNUNG · '+Math.ceil(h.remaining)+' s · markierten Brand löschen',215,82,16,h.resolved?'#a0e4c7':'#ffdd75');if(h.flash>0){ctx.fillStyle='rgba(255,204,112,'+(h.flash*.6)+')';ctx.fillRect(0,0,1000,680);}}
if(S.tunnel&&!S.done){ctx.fillStyle='#142831e8';ctx.fillRect(270,55,620,40);label(S.tunnel.powerOff?'NOTABSCHALTUNG BESTÄTIGT · Löschen und Türen öffnen':'ZUERST NOTABSCHALTUNG · Schaltkasten links',285,82,15,S.tunnel.powerOff?'#a0e4c7':'#ffdd75');}
if(S.airAim){ctx.fillStyle='#142831e8';ctx.fillRect(225,55,550,50);label('Tippe auf den Brand: Hier soll Wasser landen.',245,87,18,'#bdeaff');}
if(S.done){ctx.fillStyle='#142831e8';ctx.fillRect(300,45,400,65);label('EINSATZ GESCHAFFT',350,75,23,'#a0e4c7');label('Einsatzzentrale in '+Math.max(0,Math.ceil(6-S.completionWait))+' Sekunden',348,96,13);}}
function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(!document.hidden){if(!S.paused)S.anim+=dt;tick(dt);draw();$('clock').textContent=String(Math.floor(S.elapsed/60)).padStart(2,'0')+':'+String(Math.floor(S.elapsed%60)).padStart(2,'0');const hp=S.fires.reduce((n,f)=>n+f.hp,0),max=S.fires.reduce((n,f)=>n+f.max,0);$('fill').style.width=(1-hp/max)*100+'%';$('status').textContent=(S.paused?'PAUSE':S.done?'GESCHAFFT':S.active?'IM EINSATZ':'NOTRUF')+' · '+{car:'AUTOBRAND',forest:'WALDBRAND',airport:'FLUGZEUGBRAND',warehouse:'LAGERHAUSBRAND',accident:'VERKEHRSUNFALL',river:'FLUSSUNFALL',house:'HAUSBRAND',tunnel:'TUNNELRETTUNG'}[S.mission];$('overview').textContent=S.civilians.filter(c=>c.saved).length+'/'+S.civilians.length+' befreit · '+S.civilians.filter(c=>c.care==='hospital').length+'/'+S.civilians.length+' Klinik'+(S.river?' · '+S.river.barrels.filter(b=>b.secured).length+'/3 Fässer':'');}requestAnimationFrame(frame);}
$('tutorial-restart').onclick=()=>{if(!S.tutorial)return;reset('leicht');start();};
$('hose-extend').onclick=extendHose;$('hose-direct').onclick=disconnectBranch;
$('withdraw').onclick=()=>{const v=selected();if(v)sendBack(S.trucks.find(t=>t.id===(v.truckId||v.id)),false,true);};$('vehicle').onchange=ui;
$('start').onclick=start;$('dispatch').onclick=dispatch;$('mission').onchange=reset;$('restart').onclick=reset;$('pause').onclick=()=>{S.paused=!S.paused;if(S.paused)S.stats.paused=true;$('pause').textContent=S.paused?'Weiter':'Pause';$('pause').setAttribute('aria-pressed',String(S.paused));};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Ton: an':'Ton: aus';$('sound').setAttribute('aria-pressed',String(sound));if(sound)radio('Funk eingeschaltet.');else window.speechSynthesis?.cancel();};$('return').onclick=()=>{const v=selected();if(v)sendBack(S.trucks.find(t=>t.id===(v.truckId||v.id)));};$('air').onclick=()=>{if(S.airCooldown||S.air||S.mission!=='forest'||!S.active||S.done||S.paused||S.airUsed>=flightLimit())return;S.airAim=!S.airAim;radio(S.airAim?'Tippe jetzt auf eine brennende Stelle. Dort wirft das Löschflugzeug Wasser ab.':'Abwurfstelle wählen abgebrochen.');ui();};document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>equip(b.dataset.tool));document.addEventListener('visibilitychange',()=>{last=0;});reset();requestAnimationFrame(frame);
