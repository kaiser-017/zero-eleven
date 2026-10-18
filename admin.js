/* Zero 11 owner dashboard.
   SECURITY NOTE: this login is a front-end gate only (salted password hash, recovery-key reset,
   lockout, auto logout). It cannot stop someone with access to the same browser/dev tools.
   For real owner-only access, e-mail password reset and authorization rules, connect a backend
   (e.g. Firebase Auth + Firestore rules, or Supabase Auth + row-level security). */
(()=>{
if(document.body.dataset.page!=='admin')return;
const $=q=>document.querySelector(q),AK='zero11:auth',TABS=['Products','Reviews','Store','Security'];
let d=load(),ed=null,auth=JSON.parse(localStorage.getItem(AK)||'null'),idleT;
const toast=t=>{const e=$('#toast');e.textContent=t;e.className='on';clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2200)};
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const rnd=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
const setAuth=async pw=>{const salt=rnd(16),rec=rnd(10).replace(/(.{5})(.{5})/,'$1-$2');
 auth={salt,hash:await sha(salt+pw),rhash:await sha(salt+'R'+rec)};localStorage.setItem(AK,JSON.stringify(auth));return rec};
const showKey=rec=>{$('#kv').textContent=rec;$('#key').showModal()};
$('#key').oncancel=e=>e.preventDefault();
$('#kok').onclick=()=>{$('#key').close();boot()};
const locked=()=>{const t=+localStorage.getItem('zero11:lock')||0;return t>Date.now()?Math.ceil((t-Date.now())/1000):0};
const fail=()=>{const n=(+sessionStorage.n||0)+1;sessionStorage.n=n;if(n>=5){localStorage.setItem('zero11:lock',Date.now()+60000);sessionStorage.n=0}};

/* ----- login / setup / reset ----- */
const gate=m=>{
 const T={setup:['Set up owner access','Create a password for this dashboard.','Create password'],login:['Owner login','Authorised access only.','Log in'],reset:['Reset password','Enter your recovery key and choose a new password.','Reset password']}[m];
 $('#app').hidden=true;$('#gate').hidden=false;
 $('#gate').innerHTML=`<form id="fa" class="gcard"><div class="brand">ZERO 11</div><h1>${T[0]}</h1><p>${T[1]}</p>
 ${m==='reset'?'<input name="rk" placeholder="Recovery key (XXXXX-XXXXX)" autocomplete="off" required>':''}
 <input type="password" name="pw" placeholder="${m==='login'?'Password':'New password (at least 8 characters)'}" minlength="${m==='login'?1:8}" autocomplete="${m==='login'?'current-password':'new-password'}" required>
 ${m==='setup'?'<input type="password" name="pw2" placeholder="Confirm password" required>':''}
 <p class="err" id="er"></p><button class="btn">${T[2]}</button>
 ${m==='login'?'<a href="#" id="fg">Forgot password?</a>':m==='reset'?'<a href="#" id="bk">Back to login</a>':''}</form>`;
 const fg=$('#fg'),bk=$('#bk');
 if(fg)fg.onclick=e=>{e.preventDefault();gate('reset')};
 if(bk)bk.onclick=e=>{e.preventDefault();gate('login')};
 $('#fa').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),pw=f.get('pw'),er=$('#er');er.textContent='';
  if(m!=='setup'&&locked())return er.textContent=`Too many attempts. Try again in ${locked()} seconds.`;
  if(m==='setup'){if(pw!==f.get('pw2'))return er.textContent='Passwords do not match.';return showKey(await setAuth(pw))}
  if(m==='login'){if(await sha(auth.salt+pw)===auth.hash){sessionStorage.s='1';sessionStorage.n=0;enter()}else{fail();er.textContent='Wrong password.'}return}
  if(await sha(auth.salt+'R'+String(f.get('rk')).trim().toUpperCase())===auth.rhash)showKey(await setAuth(pw));
  else{fail();er.textContent='That recovery key is not valid.'}};
};
const boot=()=>!auth?gate('setup'):sessionStorage.s==='1'?enter():gate('login');
const out=()=>{sessionStorage.clear();location.reload()};
const idle=()=>{clearTimeout(idleT);idleT=setTimeout(out,15*60000)};
['click','keydown'].forEach(ev=>addEventListener(ev,()=>sessionStorage.s&&idle()));
const enter=()=>{$('#gate').hidden=true;$('#app').hidden=false;rP();rR();fS();idle()};
$('#lo').onclick=out;
$('#tabs').onclick=e=>{const t=e.target.dataset.t;if(!t)return;
 TABS.forEach(n=>$('#t-'+n).hidden=n!==t);document.querySelectorAll('#tabs [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===t))};

/* ----- products ----- */
const rP=()=>{
 $('#smp').hidden=!d.products.some(p=>p.sample);
 $('#pl').innerHTML=d.products.length?d.products.map(p=>`<tr data-id="${p.id}"><td class="th">${p.imgs?.[0]?`<img src="${p.imgs[0]}" alt="">`:''}</td><td><b>${esc(p.name)}</b><small>${esc(p.cat)}</small></td><td>${inr(p.price)}</td><td class="${stock(p)<1?'low':''}">${stock(p)}</td>
 <td><label><input type="checkbox" data-f="published"${p.published?' checked':''}> Published</label><label><input type="checkbox" data-f="isNew"${p.isNew?' checked':''}> New arrival</label></td>
 <td class="ac"><button data-a="edit">Edit</button><button data-a="del" class="dn">Delete</button></td></tr>`).join(''):'<tr><td colspan="6">No products yet. Press "Add product" to start.</td></tr>';
};
const find=el=>d.products.find(x=>x.id===el.closest('tr').dataset.id);
$('#pl').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=find(b);
 if(b.dataset.a==='edit')openP(p);
 else if(confirm(`Delete "${p.name}"? This cannot be undone.`)){d.products=d.products.filter(x=>x!==p);save(d);rP();toast('Product deleted')}};
$('#pl').onchange=e=>{const c=e.target.closest('[data-f]');if(!c)return;find(c)[c.dataset.f]=c.checked;save(d);toast('Updated')};
$('#np').onclick=()=>openP();
$('#pc').onclick=()=>$('#pf').close();
$('#pform').elements.cat.innerHTML=CATS.map(c=>`<option>${esc(c)}</option>`).join('');

const rI=()=>{$('#pv').innerHTML=ed.imgs.map((s,i)=>`<div><img src="${s}" alt=""><button type="button" data-rm="${i}" aria-label="Remove photo">x</button></div>`).join('')};
const rV=()=>{$('#vr').innerHTML=ed.variants.map((v,i)=>`<div class="vrow"><select data-i="${i}" data-k="size" aria-label="Size">${SIZES.map(z=>`<option${z===v.size?' selected':''}>${z}</option>`).join('')}</select><input data-i="${i}" data-k="color" value="${esc(v.color)}" placeholder="Colour" aria-label="Colour"><input type="number" min="0" data-i="${i}" data-k="qty" value="${v.qty}" aria-label="Quantity"><button type="button" data-s="${i}" title="Record one sale">-1</button><button type="button" data-x="${i}" aria-label="Remove row">x</button></div>`).join('')};
const openP=p=>{
 ed=p?structuredClone(p):{id:'p'+Date.now().toString(36),imgs:[],variants:[{size:'M',color:'',qty:0}],published:true,isNew:false,cat:CATS[0]};
 const E=$('#pform').elements;$('#pt').textContent=p?'Edit product':'Add product';
 E.pname.value=ed.name||'';E.cat.value=ed.cat;E.price.value=ed.price||'';E.desc.value=ed.desc||'';E.isNew.checked=!!ed.isNew;E.published.checked=!!ed.published;
 rI();rV();$('#pf').showModal()};
$('#ph').onchange=async e=>{for(const f of e.target.files){if(ed.imgs.length>=5)break;const s=await rs(f);s&&ed.imgs.push(s)}e.target.value='';rI()};
const rs=f=>new Promise(r=>{const i=new Image,u=URL.createObjectURL(f);
 i.onload=()=>{const k=Math.min(1,900/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;
  c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);r(c.toDataURL('image/jpeg',.72))};
 i.onerror=()=>r(null);i.src=u});
$('#pv').onclick=e=>{const b=e.target.closest('button');if(b){ed.imgs.splice(+b.dataset.rm,1);rI()}};
$('#vr').oninput=e=>{const t=e.target,i=t.dataset.i;if(i==null)return;ed.variants[i][t.dataset.k]=t.dataset.k==='qty'?Math.max(0,+t.value||0):t.value};
$('#vr').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.s!=null){const v=ed.variants[b.dataset.s];v.qty=Math.max(0,v.qty-1)}
 if(b.dataset.x!=null)ed.variants.splice(b.dataset.x,1);rV()};
$('#av').onclick=()=>{ed.variants.push({size:'M',color:ed.variants.at(-1)?.color||'',qty:0});rV()};
$('#pform').onsubmit=e=>{e.preventDefault();const E=e.target.elements;
 Object.assign(ed,{name:E.pname.value.trim(),cat:E.cat.value,price:Math.round(+E.price.value),desc:E.desc.value.trim(),isNew:E.isNew.checked,published:E.published.checked});
 ed.variants=ed.variants.map(v=>({...v,color:v.color.trim()})).filter(v=>v.color||v.qty>0);
 delete ed.sample;const i=d.products.findIndex(x=>x.id===ed.id);i<0?d.products.unshift(ed):d.products[i]=ed;
 if(save(d)){$('#pf').close();rP();toast('Product saved')}};

/* ----- reviews ----- */
const rR=()=>{$('#rl').innerHTML=d.reviews.length?d.reviews.map((r,i)=>`<div class="rr"><div><b>${esc(r.name)}</b>${r.city?', '+esc(r.city):''} <span class="st">${'\u2605'.repeat(r.rating)}</span><p>${esc(r.text)}</p></div><div class="ac"><button data-i="${i}" data-a="tg">${r.published?'Hide':'Publish'}</button><button class="dn" data-i="${i}" data-a="rm">Delete</button></div></div>`).join(''):'<p class="note">No reviews yet. The Reviews section stays hidden on the website.</p>'};
$('#rf').onsubmit=e=>{e.preventDefault();const E=e.target.elements;
 d.reviews.unshift({name:E.n.value.trim(),city:E.c.value.trim(),rating:+E.r.value,text:E.t.value.trim(),published:true});
 save(d);e.target.reset();rR();toast('Review added')};
$('#rl').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i;
 if(b.dataset.a==='tg')d.reviews[i].published=!d.reviews[i].published;else if(confirm('Delete this review?'))d.reviews.splice(i,1);else return;
 save(d);rR()};

/* ----- store details + backup ----- */
const fS=()=>{const E=$('#sf').elements,s=d.store;E.sname.value=s.name;E.tagline.value=s.tagline;E.phone.value=s.phone;E.address.value=s.address;E.instagram.value=s.instagram;E.ship.value=s.ship};
$('#sf').onsubmit=e=>{e.preventDefault();const E=e.target.elements;
 let ph=E.phone.value.replace(/\D/g,'');if(ph.length===10)ph='91'+ph;if(ph.length<11)return toast('Enter a valid WhatsApp number');
 let ig=E.instagram.value.trim();if(ig&&!/^https?:\/\//i.test(ig))ig='https://'+ig;
 Object.assign(d.store,{name:E.sname.value.trim(),tagline:E.tagline.value.trim(),phone:ph,address:E.address.value.trim(),instagram:ig,ship:E.ship.value.trim()});
 save(d)&&toast('Store details saved')};
$('#ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));a.download='zero11-backup.json';a.click()};
$('#im').onchange=async e=>{try{const x=JSON.parse(await e.target.files[0].text());if(!x.products||!x.store)throw 0;d=x;save(d);rP();rR();fS();toast('Backup restored')}catch{toast('That is not a valid backup file')}e.target.value=''};

/* ----- change password ----- */
$('#cf').onsubmit=async e=>{e.preventDefault();const E=e.target.elements,er=$('#ce');er.textContent='';
 if(await sha(auth.salt+E.cur.value)!==auth.hash)return er.textContent='Current password is wrong.';
 const rec=await setAuth(E.nw.value);e.target.reset();showKey(rec)};

boot();
})();
