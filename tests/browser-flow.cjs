const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const server=require('node:http').createServer((req,res)=>{const path=req.url.split('?')[0]==='/game.js'?'game.js':'index.html';res.setHeader('Content-Type',path.endsWith('.js')?'text/javascript':'text/html');res.end(require('node:fs').readFileSync(path));});await new Promise(r=>server.listen(0,'127.0.0.1',r));const baseUrl=process.env.GAME_URL||'http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});try{
for(const viewport of [{width:390,height:844},{width:844,height:390},{width:820,height:1180}]){
 const page=await browser.newPage({viewport,hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(baseUrl);
 assert(await page.locator('#intro-screen').isVisible(),'Intro opens before the dispatch center');await page.screenshot({path:'/tmp/alexander-intro-'+viewport.width+'.png'});
 assert(await page.evaluate(()=>!S.active&&pendingCall===null));
 await page.locator('#intro-start').tap();await page.waitForFunction(()=>pendingCall!==null);
 assert(await page.locator('#career-status').innerText().then(t=>t.includes('leicht')));
 await page.locator('#accept-call').tap();assert(await page.evaluate(()=>S.active&&S.difficulty==='leicht'));
 await page.locator('#dispatch').tap();assert.equal(await page.evaluate(()=>S.trucks.length),1);
 await page.evaluate(()=>{S.paused=true});const elapsed=await page.evaluate(()=>S.elapsed);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>S.elapsed),elapsed);
 await page.evaluate(()=>{S.paused=false;S.fires.forEach(f=>f.hp=0);S.civilians.forEach(c=>{c.saved=true;c.care='hospital'});if(S.river)S.river.barrels.forEach(b=>b.secured=true);if(S.tunnel)S.tunnel.powerOff=true;tick(.1)});
 assert(await page.locator('#mission-result').isVisible());assert(await page.locator('#mission-result').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight}),'Success report must be in the visible command panel');const seconds=await page.evaluate(()=>S.report.seconds);
 await page.evaluate(()=>tick(6));assert(await page.locator('#dispatch-center').isVisible());assert(await page.locator('#last-result').isVisible());
 assert.equal(await page.evaluate(()=>career.lastReport.seconds),seconds);assert.equal(await page.evaluate(()=>career.wins),1);
 await page.selectOption('#play-mode','practice');await page.waitForFunction(()=>pendingCall!==null);await page.locator('#accept-call').tap();assert.equal(await page.evaluate(()=>S.difficulty),'leicht');
 await page.locator('#center-return').tap();assert.equal(await page.evaluate(()=>career.wins),1);
 await page.selectOption('#play-mode','tutorial');assert.equal(await page.locator('#lesson-buttons button').count(),9);
 await page.getByRole('button',{name:'2 · Wasser marsch!',exact:true}).tap();await page.locator('#accept-call').tap();
 assert(await page.locator('#tutorial-panel').isVisible());await page.locator('#dispatch').tap();await page.evaluate(()=>{for(let i=0;i<150;i++)tick(.1)});
 const chooseCrew=async number=>page.locator('#units button').filter({hasText:'Feuerwehrmann '+number+' ·'}).first().tap();
 const tapMap=async(x,y)=>{const b=await page.locator('#map').boundingBox();await page.touchscreen.tap(b.x+x*b.width/1000,b.y+y*b.height/680);};
 await chooseCrew(1);await page.locator('[data-tool="water"]').tap();await page.locator('#hose-extend').tap();assert.equal(await page.evaluate(()=>selected().hoseLength),120);
 await page.locator('[data-tool="hydrant"]').tap();await tapMap(440,470);await page.evaluate(()=>{for(let i=0;i<250;i++)tick(.1)});assert.equal(await page.evaluate(()=>S.trucks[0].hydrantId),'h2');
 await page.locator('[data-tool="splitter"]').tap();await tapMap(500,450);await page.evaluate(()=>{for(let i=0;i<250;i++)tick(.1)});assert.equal(await page.evaluate(()=>S.splitters.length),1);
 await chooseCrew(2);await page.locator('[data-tool="water"]').tap();await tapMap(500,450);assert(await page.evaluate(()=>S.people[1].splitterId===S.splitters[0].id),'Occupied Y remains tappable');
 await chooseCrew(1);await page.locator('[data-tool="water"]').tap();await tapMap(500,450);assert.equal(await page.evaluate(()=>S.people.filter(p=>p.splitterId).length),2);
 await page.screenshot({path:'/tmp/alexander-training-'+viewport.width+'.png'});
 await page.locator('#tutorial-restart').tap();assert.equal(await page.evaluate(()=>S.splitters.length),0);assert.equal(await page.evaluate(()=>career.wins),1);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 assert.deepEqual(errors,[]);await page.screenshot({path:'/tmp/alexander-'+viewport.width+'.png'});
 await page.reload();assert.equal(await page.evaluate(()=>career.wins),0,'No permanent storage');await page.close();
 console.log('PASS touch browser flow',viewport.width,viewport.height);
}
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exit(1)});
