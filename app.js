/* Evolution Games Store */
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IC={win:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5l7.5-1v7H3zM11.5 4.4L21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.4z"/></svg>',
 lin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2.2 0-3.5 1.9-3.5 4.3 0 1.2-.5 2.2-1.3 3.4C6 11.5 5 13.5 5 15.5c0 1.3.4 2.3 1.1 3-.5.6-1.6.9-2.1 1.5-.4.5.2 1 1 1.1 1.5.2 2.5.5 3.5.5.9 0 1.6-.4 2.5-.4s1.6.4 2.5.4c1 0 2-.3 3.5-.5.8-.1 1.4-.6 1-1.1-.5-.6-1.6-.9-2.1-1.5.7-.7 1.1-1.7 1.1-3 0-2-1-4-2.2-5.8-.8-1.2-1.3-2.2-1.3-3.4C15.5 3.9 14.2 2 12 2zM10.500 5.500a.8 1.200 0 100 2.400.8 1.200 0 000-2.400zm3 0a.8 1.200 0 100 2.400.8 1.200 0 000-2.400zM12 9c1 0 1.800.5 1.800 1s-.8 1-1.800 1-1.800-.5-1.800-1S11 9 12 9z"/></svg>'};
const db=(p,m='GET',b)=>fetch(`${CFG.DB}/${p}.json`,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined}).then(r=>r.json());
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const SET=()=>({auto:true,hide18:false,...JSON.parse(localStorage.evo_set||'{}')});
let user=null,key=null,cat={games:[],events:[]},raw='',F={q:'',tag:''};
const toast=t=>{const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2500)};
const img=(u,c)=>u?`<img class="${c}" src="${esc(u)}" alt="" loading="lazy">`:`<div class="${c} ph"></div>`;
const G=id=>cat.games.find(g=>g.id===id);
const avatar=(u,n)=>u?.avatar?`<img class="av" src="${esc(u.avatar)}" alt="">`:`<span class="av">${esc((n||'?')[0].toUpperCase())}</span>`;
const dl=(u,k,l)=>u?`<a class="btn" href="${esc(u)}" download>${IC[k]} ${l}</a>`:`<span class="btn mut" title="Arquivo não disponível">${IC[k]} ${l}</span>`;

async function loadCat(){
  try{
    const j=CFG.CATALOG?await fetch(CFG.CATALOG+'?t='+Date.now()).then(r=>r.json()):JSON.parse(localStorage.evo_catalog||'null')||{};
    const s=JSON.stringify(j);if(s===raw)return false;raw=s;cat={games:j.games||[],events:j.events||[]};return true;
  }catch(e){return false}
}
const vis=()=>cat.games.filter(g=>!(SET().hide18&&+g.rating>=18));
const lib=()=>user?.library||[];
async function saveUser(p){Object.assign(user,p);await db('users/'+key,'PATCH',p)}

/* ---------- views ---------- */
const card=g=>`<a class="card" href="#/game/${esc(g.id)}">${img(g.banner,'cb')}<div class="cm">${img(g.icon,'ci')}<div><b>${esc(g.name)}</b><small>${esc(g.style)}</small></div><span class="rate" style="margin-left:auto">${esc(g.rating)}</span></div></a>`;
const row=(t,l)=>`<h2>${esc(t)}</h2><div class="rs">${l.map(card).join('')}</div>`;
const chipBar=t=>`<div class="chips"><button class="chip ${F.tag?'':'on'}" data-tag="">Todos</button>${t.map(x=>`<button class="chip ${F.tag===x?'on':''}" data-tag="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
const hero=l=>`<div class="hc">${l.map((g,i)=>`<a class="slide ${i?'':'on'}" href="#/game/${esc(g.id)}">${img(g.banner,'cb')}<div class="in">${img(g.icon,'ci big')}<h1>${esc(g.name)}</h1><p>${esc(g.desc)}</p><span class="btn blue">Ver jogo</span></div></a>`).join('')}<div class="dots">${l.map((_,i)=>`<button data-s="${i}" class="${i?'':'on'}"></button>`).join('')}</div></div>`;
const V={
 store(){
  const all=vis().slice().sort((a,b)=>(b.added||0)-(a.added||0)),q=F.q.toLowerCase();
  if(!all.length)return `<div class="empty big"><h1>Nenhum jogo publicado ainda</h1><p>Publique seu primeiro jogo no painel Evolution Studio.</p></div>`;
  const tags=[...new Set(all.flatMap(g=>[g.style,...(g.tags||[])]).filter(Boolean))];
  if(q||F.tag){const l=all.filter(g=>(!F.tag||[g.style,...(g.tags||[])].includes(F.tag))&&(!q||(g.name+g.style+(g.tags||[]).join(' ')).toLowerCase().includes(q)));
   return `<h1>Explorar</h1>${chipBar(tags)}${l.length?`<div class="grid">${l.map(card).join('')}</div>`:'<div class="empty">Nenhum jogo encontrado.</div>'}`}
  const st=[...new Set(all.map(g=>g.style).filter(Boolean))];
  return `${hero(all.slice(0,4))}${chipBar(tags)}${row('Novidades',all.slice(0,12))}${st.map(x=>row(x,all.filter(g=>g.style===x))).join('')}${cat.events.length?`<h2>Eventos</h2><div class="grid">${cat.events.slice(0,3).map(evCard).join('')}</div>`:''}`;
 },
 events(){return `<h1>Eventos</h1><p class="sub">Promoções, lançamentos e novidades.</p>${cat.events.length?`<div class="grid">${cat.events.map(evCard).join('')}</div>`:'<div class="empty">Nenhum evento no momento.</div>'}`},
 game(id){
  const g=G(id);if(!g)return '<div class="empty">Jogo não encontrado.</div>';const own=lib().includes(g.id),sim=vis().filter(x=>x.id!==g.id&&x.style===g.style).slice(0,10);
  return `<div class="gb">${img(g.banner,'cb')}<div class="gbi">${img(g.icon,'ci big')}<div><h1>${esc(g.name)}</h1><span class="mut">${esc(g.style)} • v${esc(g.version)}</span>
  <div class="row" style="margin-top:16px">${dl(g.win,'win','Baixar para Windows')}${dl(g.linux,'lin','Baixar para Linux')}<button class="btn blue" data-lib="${esc(g.id)}">${own?'Na biblioteca ✓ Remover':'Adicionar à biblioteca'}</button></div></div></div></div>
  <div class="gp"><div><h2 style="margin-top:0">Sobre</h2><p style="line-height:1.8;color:#d0d0d0;white-space:pre-line">${esc(g.desc)}</p>
  ${(g.shots||[]).length?`<h2>Capturas de tela</h2><div class="rs shots">${g.shots.map(u=>`<img src="${esc(u)}" data-lb alt="">`).join('')}</div>`:''}
  ${(g.chapters||[]).length?`<h2>Capítulos</h2><div class="box">${g.chapters.map(c=>`<div class="chap"><div><b>${esc(c.title)}</b><br><small>${esc(c.desc)}</small></div><div class="row">${dl(c.win,'win','Windows')}${dl(c.linux,'lin','Linux')}</div></div>`).join('')}</div>`:''}</div>
  <div class="box"><dl class="kv"><dt>Versão</dt><dd>${esc(g.version)}</dd><dt>Classificação</dt><dd><span class="rate">${esc(g.rating)}</span></dd><dt>Estilo</dt><dd>${esc(g.style)}</dd></dl><div style="margin-top:16px">${(g.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div></div>
  ${sim.length?row('Jogos semelhantes',sim):''}`;
 },
 library(){const l=lib().map(G).filter(Boolean);return `<h1>Biblioteca</h1><p class="sub">${l.length} jogo(s)</p>${l.length?`<div class="lrows">${l.map(g=>`<div class="lr">${img(g.icon,'ci big')}<div style="flex:1;min-width:160px"><a href="#/game/${esc(g.id)}"><b>${esc(g.name)}</b></a><br><small>${esc(g.style)} • v${esc(g.version)}</small></div><div class="row">${dl(g.win,'win','Windows')}${dl(g.linux,'lin','Linux')}<button class="btn sm" data-lib="${esc(g.id)}">Remover</button></div></div>`).join('')}</div>`:'<div class="empty">Nada por aqui ainda. Explore a loja e adicione jogos.</div>'}`},
 async friends(f){
  if(f){const u=await db('users/'+f);if(!u)return '<div class="empty">Usuário não encontrado.</div>';
   return `<a class="mut" href="#/friends">← Amigos</a><div class="row" style="margin:10px 0">${avatar(u,u.name)}<h1 style="margin:0">${esc(u.dname||u.name)}</h1></div><p class="sub">${esc(u.bio||'')}</p><h2>Biblioteca de ${esc(u.name)}</h2>${u.priv?'<div class="empty">Esta biblioteca é privada.</div>':libList((u.library||[]).map(G).filter(Boolean))}`}
  const fr=user.friends||[];
  return `<h1>Amigos</h1><p class="sub">Veja a biblioteca de quem você segue.</p><div class="row" style="margin-bottom:20px"><input class="field" id="fname" placeholder="Nome de usuário" style="max-width:320px"><button class="btn pri" id="addf">Adicionar</button></div>
  ${fr.length?`<div class="box list">${fr.map(k=>`<div><span class="av">${esc(k[0].toUpperCase())}</span><a href="#/friends/${esc(k)}" style="flex:1">${esc(k)}</a><button class="btn sm" data-rf="${esc(k)}">Remover</button></div>`).join('')}</div>`:'<div class="empty">Você ainda não adicionou amigos.</div>'}`;
 },
 profile(){
  const g=lib().map(G).filter(Boolean),days=Math.max(1,Math.floor((Date.now()-(user.created||Date.now()))/864e5)),fr=(user.friends||[]).length;
  const fav=Object.entries(g.reduce((m,x)=>(x.style&&(m[x.style]=(m[x.style]||0)+1),m),{})).sort((a,b)=>b[1]-a[1])[0];
  const bd=[[g.length>=1,'Primeiro jogo'],[g.length>=5,'Colecionador'],[g.length>=10,'Biblioteca épica'],[fr>=3,'Sociável'],[days>=30,'Veterano'],[!!user.avatar,'Com a sua cara']].filter(b=>b[0]);
  const stt={on:'Online',away:'Ausente',busy:'Ocupado',off:'Invisível'};
  return `<div class="pban" style="${user.banner?`background-image:url(${user.banner})`:''}"><label class="btn sm pedit">Alterar capa<input type="file" accept="image/*" hidden id="p-ban"></label></div>
  <div class="phead"><div class="pav">${avatar(user,user.name)}</div><div style="flex:1;min-width:200px"><h1 style="margin:0">${esc(user.dname||user.name)}</h1><small>@${esc(key)} • ${stt[user.status||'on']}${user.loc?' • '+esc(user.loc):''}</small></div>
   <label class="btn">Trocar foto<input type="file" accept="image/*" hidden id="p-avf"></label>${user.avatar?'<button class="btn" id="p-rav">Remover foto</button>':''}</div>
  <div class="pgrid"><div>
   <div class="stats4"><div class="box"><b>${g.length}</b><small>Jogos</small></div><div class="box"><b>${fr}</b><small>Amigos</small></div><div class="box"><b>${days}</b><small>Dias de conta</small></div><div class="box"><b>${esc(fav?fav[0]:'—')}</b><small>Estilo favorito</small></div></div>
   <h2>Sobre</h2><div class="box"><p style="margin:0;line-height:1.7;white-space:pre-line">${esc(user.bio||'Nenhuma bio ainda.')}</p>${user.site?`<p style="margin:12px 0 0"><a href="${esc(user.site)}" target="_blank" rel="noopener" style="color:var(--a)">${esc(user.site)}</a></p>`:''}</div>
   <h2>Conquistas</h2><div>${bd.length?bd.map(b=>`<span class="tag" style="border-color:var(--a);padding:8px 14px;font-size:13px">★ ${b[1]}</span>`).join(''):'<span class="mut">Adicione jogos e amigos para ganhar conquistas.</span>'}</div>
   ${g.length?row('Na biblioteca',g.slice(-8).reverse()):''}</div>
  <div class="box" style="display:grid;gap:12px;align-self:start"><h3 style="margin:0">Editar perfil</h3>
   <input class="field" id="p-dn" placeholder="Nome de exibição" value="${esc(user.dname||'')}"><input class="field" id="p-loc" placeholder="Localização" value="${esc(user.loc||'')}"><input class="field" id="p-site" placeholder="Site ou rede social" value="${esc(user.site||'')}">
   <select id="p-st">${Object.entries(stt).map(([k,v])=>`<option value="${k}" ${(user.status||'on')===k?'selected':''}>${v}</option>`).join('')}</select>
   <textarea class="field" id="p-bio" placeholder="Bio">${esc(user.bio||'')}</textarea>
   <label class="sw" style="padding:6px 0">Biblioteca privada<input type="checkbox" id="p-priv" ${user.priv?'checked':''}></label>
   <button class="btn blue" id="p-save">Salvar perfil</button>
   <h3 style="margin:14px 0 0">Alterar senha</h3><input class="field" id="p-pw0" type="password" placeholder="Senha atual"><input class="field" id="p-pw1" type="password" placeholder="Nova senha (mín. 6)"><button class="btn" id="p-pw">Atualizar senha</button></div></div>`},
 settings(){const s=SET();return `<h1>Configurações</h1><div class="box" style="max-width:560px"><label class="sw">Atualizar a loja automaticamente<input type="checkbox" data-s="auto" ${s.auto?'checked':''}></label><label class="sw">Ocultar jogos 18+<input type="checkbox" data-s="hide18" ${s.hide18?'checked':''}></label>
  <div class="row" style="margin-top:20px"><button class="btn" id="out">Sair da conta</button><button class="btn" id="del" style="color:#f87171">Excluir conta</button></div></div>`}
};
const evCard=e=>`<div class="card">${img(e.banner,'cb')}<div style="padding:14px"><b>${esc(e.title)}</b><br><small>${esc(e.date||'')}</small><p class="mut" style="margin:8px 0 0">${esc(e.text)}</p></div></div>`;
const libList=(l,ro)=>l.length?`<div class="grid">${l.map(card).join('')}</div>`:'<div class="empty">Nada por aqui ainda. Explore a loja e adicione jogos.</div>';

/* ---------- router ---------- */
async function route(){
  const [,p='store',a]=location.hash.split('/');$$('nav a').forEach(x=>x.classList.toggle('on',x.dataset.p===(p==='game'?'store':p)));
  clearInterval(window.ht);const v=$('#view');if(!V[p]){location.hash='#/store';return}
  v.innerHTML=await V[p](a);bind(p,a);
}
function bind(p,a){
  if($('.hc')){let i=0;const n=$$('.slide').length,go=k=>{i=k%n;$$('.slide').forEach((x,j)=>x.classList.toggle('on',j===i));$$('.dots button').forEach((x,j)=>x.classList.toggle('on',j===i))};$$('.dots button').forEach(b=>b.onclick=()=>go(+b.dataset.s));window.ht=setInterval(()=>go(i+1),6000)}
  $$('[data-lb]').forEach(im=>im.onclick=()=>{const d=document.createElement('div');d.className='lb';d.innerHTML=`<img src="${im.src}" alt="">`;d.onclick=()=>d.remove();document.body.append(d)});
  $$('[data-tag]').forEach(b=>b.onclick=()=>{F.tag=b.dataset.tag;route()});
  $$('[data-lib]').forEach(b=>b.onclick=async()=>{const id=b.dataset.lib,l=lib().includes(id)?lib().filter(x=>x!==id):[...lib(),id];await saveUser({library:l});toast(l.includes(id)?'Adicionado à biblioteca':'Removido');route()});
  $('#addf')&&($('#addf').onclick=async()=>{const k=$('#fname').value.trim().toLowerCase();if(!k||k===key)return;if(!(await db('users/'+k)))return toast('Usuário não existe');await saveUser({friends:[...new Set([...(user.friends||[]),k])]});route()});
  $$('[data-rf]').forEach(b=>b.onclick=async()=>{await saveUser({friends:(user.friends||[]).filter(x=>x!==b.dataset.rf)});route()});
  const toImg=(f,w,h)=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const k=Math.max(w/i.width,h/i.height),dw=i.width*k,dh=i.height*k;c.getContext('2d').drawImage(i,(w-dw)/2,(h-dh)/2,dw,dh);r(c.toDataURL('image/jpeg',.85))};i.src=URL.createObjectURL(f)});
  $('#p-avf')&&($('#p-avf').onchange=async e=>{if(e.target.files[0]){await saveUser({avatar:await toImg(e.target.files[0],256,256)});head();toast('Foto atualizada');route()}});
  $('#p-ban')&&($('#p-ban').onchange=async e=>{if(e.target.files[0]){await saveUser({banner:await toImg(e.target.files[0],1200,320)});toast('Capa atualizada');route()}});
  $('#p-rav')&&($('#p-rav').onclick=async()=>{await saveUser({avatar:''});head();route()});
  $('#p-save')&&($('#p-save').onclick=async()=>{await saveUser({dname:$('#p-dn').value.trim(),loc:$('#p-loc').value.trim(),site:$('#p-site').value.trim(),status:$('#p-st').value,bio:$('#p-bio').value.trim(),priv:$('#p-priv').checked});head();toast('Perfil salvo');route()});
  $('#p-pw')&&($('#p-pw').onclick=async()=>{if(await sha($('#p-pw0').value)!==user.pass)return toast('Senha atual incorreta');if($('#p-pw1').value.length<6)return toast('Nova senha muito curta');await saveUser({pass:await sha($('#p-pw1').value)});toast('Senha alterada');route()});
  $$('[data-s]').forEach(c=>c.onchange=()=>{localStorage.evo_set=JSON.stringify({...SET(),[c.dataset.s]:c.checked});startTimer()});
  $('#out')&&($('#out').onclick=()=>{localStorage.removeItem('evo_user');location.reload()});
  $('#del')&&($('#del').onclick=async()=>{if(confirm('Excluir sua conta permanentemente?')){await db('users/'+key,'DELETE');localStorage.removeItem('evo_user');location.reload()}});
}
const head=()=>$('#me').innerHTML=`${avatar(user,user.name)}<span>${esc(user.dname||user.name)}</span>`;
let tm;function startTimer(){clearInterval(tm);if(SET().auto)tm=setInterval(async()=>{if(await loadCat()&&!/settings|profile|friends/.test(location.hash)&&document.activeElement.tagName!=='INPUT')route()},CFG.REFRESH)}
$('#q').oninput=e=>{F.q=e.target.value;if(!/^#\/store/.test(location.hash))location.hash='#/store';else route()};
window.onhashchange=route;

/* ---------- auth + mascote ---------- */
const chloe=$('#chloe'),eyes=[['#eyeL',-40],['#eyeR',40]].map(([s,x])=>[$(s),x]);
function look(x,y){const r=chloe.getBoundingClientRect(),cy=r.top+117;eyes.forEach(([e,bx])=>{const cx=r.left+116+bx,dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy),p=Math.min(1,d/400),an=Math.atan2(dy,dx);e.style.transform=`translateX(-50%) translateX(${bx}px) translate(${Math.cos(an)*16*p}px,${Math.sin(an)*20*p}px)`})}
document.addEventListener('pointermove',e=>{if(!document.activeElement.matches?.('.input'))look(e.clientX,e.clientY)});
const caret=i=>{const r=i.getBoundingClientRect();look(r.left+Math.min(r.width-20,20+i.value.length*10),r.top+r.height/2)};
$$('#af .input').forEach(i=>{i.addEventListener('input',()=>{caret(i);clearErr()});i.addEventListener('focus',()=>{chloe.classList.toggle('cover',i.type==='password');if(i.type!=='password')caret(i)});i.addEventListener('blur',()=>chloe.classList.remove('cover'))});
function err(t){$('#errtxt').textContent=t;$('.error-message').classList.add('is-active');$('#mouth').style.display='none';$('#mouthO').style.display=''}
function clearErr(){$('.error-message').classList.remove('is-active');$('#mouth').style.display='';$('#mouthO').style.display='none'}
let mode='login';
$$('.tabs button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;$('#auth').classList.toggle('reg',mode==='reg');$$('.tabs button').forEach(x=>x.classList.toggle('on',x===b));$('.abtn').textContent=mode==='reg'?'Criar conta':'Entrar';clearErr()});
$('#af').onsubmit=async e=>{
  e.preventDefault();const v=id=>$(id).value.trim(),pass=$('#f-pass').value;
  try{
    const users=await db('users')||{};
    if(mode==='reg'){
      const name=v('#f-name'),email=v('#f-email').toLowerCase(),k=name.toLowerCase().replace(/[^a-z0-9_]/g,'');
      if(!k)return err('Oops! Nome, por favor!');if(!/^\S+@\S+\.\S+$/.test(email))return err('Oops! Email, please!');if(pass.length<6)return err('Senha: mínimo 6 letras');
      if(users[k]||Object.values(users).some(u=>u.email===email))return err('Conta já existe!');
      await db('users/'+k,'PUT',{name,email,pass:await sha(pass),created:Date.now()});enter(k);
    }else{
      const id=v('#f-id').toLowerCase(),k=Object.keys(users).find(k=>k===id||users[k].email===id);
      if(!k||users[k].pass!==await sha(pass))return err('Oops! Dados incorretos');enter(k);
    }
  }catch(x){err('Sem conexão')}
};
async function enter(k){
  key=k;user=await db('users/'+k);localStorage.evo_user=k;
  $('#auth').hidden=true;$('#app').hidden=false;head();await loadCat();if(!location.hash)location.hash='#/store';route();startTimer();
}
(async()=>{const k=localStorage.evo_user;if(k&&await db('users/'+k))enter(k)})();