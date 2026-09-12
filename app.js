const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const KEY = 'teyvatTracker';
const defaults = {
  primogems:12480,fates:12,acquaint:4,stardust:340,pity:64,guaranteed:false,
  goal:180,goalDate:'2026-10-25',goalTitle:'Ahorrar para el próximo personaje',banner:'character',
  history:[{date:new Date().toISOString().slice(0,10),amount:12480,note:'Saldo inicial'}]
};
let state = {...defaults, ...(JSON.parse(localStorage.getItem(KEY)||'{}'))};
state.history ||= defaults.history;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const fmt=n=>Number(n).toLocaleString('es');
const daysLeft=()=>Math.max(1,Math.ceil((new Date(state.goalDate+'T23:59:59')-new Date())/86400000));
function effectiveWishes(){ return state.pity + state.fates + Math.floor(state.primogems/160); }
function daily(){
  const missing=Math.max(0,state.goal-effectiveWishes());
  return {missing, days:daysLeft(), wishes:missing/daysLeft(), primos:missing*160/daysLeft()};
}
function render(){
  const d=daily(), total=effectiveWishes(), pct=Math.min(100,Math.round(total/state.goal*100));
  $('#primogems').textContent=fmt(state.primogems); $('#fates').textContent=fmt(state.fates); $('#acquaint').textContent=fmt(state.acquaint); $('#stardust').textContent=fmt(state.stardust);
  $('#wishEquivalent').textContent=Math.floor(state.primogems/160);
  $('#goalWish').textContent=total; $('#goalPercent').textContent=pct+'%'; $('#goalProgress').style.width=pct+'%'; $('#goalRemaining').textContent=d.missing;
  $('#dailyNeed').textContent=d.wishes.toFixed(1);
  $('#goalTitle').textContent=state.goalTitle;
  $('#goalRing').style.background=`conic-gradient(var(--accent) 0 ${pct}%,#29344a ${pct}% 100%)`;
  $('#goalDate').textContent=`Meta: ${new Date(state.goalDate+'T12:00:00').toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'})}`;
  $('#dailyPrimos').textContent=fmt(Math.ceil(d.primos)); $('#dailyWishes').textContent=d.wishes.toFixed(1); $('#daysLeft').textContent=d.days;
  $('#pityNumber').textContent=state.pity; $('#pityTrack i').style.width=Math.min(100,state.pity/90*100)+'%'; $('#pityStatus').textContent=state.guaranteed?'Garantizado':'50/50 en juego'; $('#lastFive').textContent='Hace '+state.pity+' deseos';
  $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.banner===state.banner));
}
function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.append(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)}
function closeModal(){$('#modalBackdrop').classList.remove('open')}
function modal(title,body){$('#modal').innerHTML=`<div class="modal-head"><div><h2>${title}</h2></div><button class="icon-btn" id="xClose">×</button></div>${body}`;$('#modalBackdrop').classList.add('open');$('#xClose').onclick=closeModal}
function resources(){
 modal('Actualizar recursos',`<p>Elige cómo quieres modificar tus protogemas. Todo queda guardado en este dispositivo.</p>
 <div class="modal-grid"><button class="primary" id="addRes">＋ Añadir</button><button class="ghost" id="spendRes">－ Gastar</button><button class="ghost" id="setRes">↺ Establecer</button><button class="ghost" id="rewardRes">🎁 Recompensa</button></div>
 <div class="quick-amounts"><button data-amt="60">+60</button><button data-amt="90">+90</button><button data-amt="300">+300</button><button data-amt="1600">+1600</button></div>`);
 $('#addRes').onclick=()=>askAmount(1); $('#spendRes').onclick=()=>askAmount(-1);
 $('#setRes').onclick=()=>{const v=prompt('Nueva cantidad de protogemas',state.primogems);if(v!==null){state.primogems=Math.max(0,+v||0);log();save();render();closeModal();toast('Saldo establecido ✓')}};
 $('#rewardRes').onclick=()=>{state.primogems+=60;log('Comisiones');save();render();closeModal();toast('+60 protogemas registrados ✦')};
 $$('.quick-amounts button').forEach(b=>b.onclick=()=>{state.primogems+=+b.dataset.amt;log('Añadido manual');save();render();closeModal();toast('+'+b.dataset.amt+' protogemas ✦')});
}
function askAmount(mult){const v=prompt(mult>0?'¿Cuántas protogemas quieres añadir?':'¿Cuántas protogemas quieres gastar?','160');if(v!==null){state.primogems=Math.max(0,state.primogems+mult*(+v||0));log(mult>0?'Añadido':'Gasto');save();render();closeModal();toast('Inventario actualizado ✓')}}
function log(note='Actualización'){state.history.push({date:new Date().toISOString().slice(0,10),amount:state.primogems,note});state.history=state.history.slice(-30)}
function goal(){modal('Editar meta',`<p>El objetivo usa <b>pity + destinos disponibles + protogemas convertidas a deseos</b>. Así puedes ver tu progreso real hacia la meta.</p><div class="modal-grid"><div class="field"><label>Deseos objetivo</label><input id="goalInput" type="number" min="1" value="${state.goal}"></div><div class="field"><label>Fecha límite</label><input id="dateInput" type="date" value="${state.goalDate}"></div></div><div class="field" style="margin-top:10px"><label>Nombre</label><input id="titleInput" value="${state.goalTitle}"></div><div class="modal-actions"><button class="ghost" id="cancel">Cancelar</button><button class="primary" id="saveGoal">Guardar meta</button></div>`);$('#cancel').onclick=closeModal;$('#saveGoal').onclick=()=>{state.goal=Math.max(1,+$('#goalInput').value||1);state.goalDate=$('#dateInput').value||state.goalDate;state.goalTitle=$('#titleInput').value.trim()||'Mi meta';save();render();closeModal();toast('Meta actualizada ✓')};}
function wishes(){modal('Registrar deseo',`<p>Registra una tirada y el tracker actualizará automáticamente tu pity.</p><div class="wish-options"><button class="wish5" data-rarity="5">★ 5★</button><button data-rarity="4">★ 4★</button><button data-rarity="3">★ 3★</button></div><div class="field"><label>Resultado</label><input id="wishName" placeholder="Ej. personaje / arma (opcional)"></div><div class="modal-actions"><button class="ghost" id="cancel">Cancelar</button></div>`);$('#cancel').onclick=closeModal;$$('.wish-options button').forEach(b=>b.onclick=()=>{const r=+b.dataset.rarity;state.pity=r===5?0:state.pity+1;if(r===5)state.guaranteed=!state.guaranteed; if(state.fates>0)state.fates--; else if(state.primogems>=160)state.primogems-=160; else {toast('No tienes un destino o 160 protogemas');return}save();render();closeModal();toast(r===5?'¡5★ registrado! ✨':'Deseo registrado ✓')})}
function stats(){const d=daily();modal('Estadísticas',`<div class="stat-list"><div><span>Deseos efectivos</span><b>${effectiveWishes()}</b></div><div><span>Progreso de meta</span><b>${Math.min(100,Math.round(effectiveWishes()/state.goal*100))}%</b></div><div><span>Protogemas necesarias por día</span><b>${fmt(Math.ceil(d.primos))}</b></div><div><span>Deseos necesarios por día</span><b>${d.wishes.toFixed(1)}</b></div><div><span>Días restantes</span><b>${d.days}</b></div></div><div class="modal-actions"><button class="primary" id="closeStats">Cerrar</button></div>`);$('#closeStats').onclick=closeModal}
function more(){modal('Más herramientas',`<div class="tool-grid"><button id="backup">⬇ Exportar respaldo</button><button id="restore">⬆ Importar respaldo</button><button id="reset">♻ Restablecer datos</button><button id="about">ℹ Sobre la app</button></div><div class="modal-actions"><button class="ghost" id="closeMore">Cerrar</button></div>`);$('#closeMore').onclick=closeModal;$('#backup').onclick=exportData;$('#restore').onclick=importData;$('#reset').onclick=()=>{if(confirm('¿Borrar todos los datos?')){state={...defaults,history:[]};save();render();closeModal();toast('Datos restablecidos')}};$('#about').onclick=()=>toast('Teyvat Tracker • PWA offline')}
function settings(){modal('Configuración',`<div class="tool-grid"><button id="backup">⬇ Exportar datos</button><button id="restore">⬆ Importar datos</button><button id="reset">♻ Restablecer</button></div><p>Los datos se almacenan localmente. Puedes exportarlos para llevarlos a otro dispositivo.</p>`);$('#backup').onclick=exportData;$('#restore').onclick=importData;$('#reset').onclick=()=>{if(confirm('¿Restablecer la aplicación?')){localStorage.removeItem(KEY);location.reload()}}}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='teyvat-tracker-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Respaldo exportado ✓')}
function importData(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state={...defaults,...JSON.parse(r.result)};save();render();closeModal();toast('Respaldo importado ✓')}catch{toast('Archivo no válido')}};r.readAsText(f)};input.click()}
$$('[data-modal="resources"]').forEach(x=>x.onclick=resources);$('#editGoal').onclick=goal;$('#settingsBtn').onclick=settings;
$$('[data-nav]').forEach(x=>x.onclick=()=>{const n=x.dataset.nav;if(n==='home'){window.scrollTo({top:0,behavior:'smooth'});toast('Inicio');}else if(n==='wishes')wishes();else if(n==='goals')goal();else if(n==='stats')stats();else more()});
$$('.tab').forEach(x=>x.onclick=()=>{state.banner=x.dataset.banner;state.pity=state.banner==='weapon'?27:state.banner==='standard'?18:64;save();render();toast('Banner cambiado')});
$$('.task input').forEach(i=>i.onchange=()=>{$('#taskCount').textContent=$$('.task input:checked').length+'/4'});
$('#chartRange').onchange=()=>toast('Vista cambiada a '+$('#chartRange').value);
$('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')closeModal()};
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
