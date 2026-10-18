/* Zero 11 - shared data layer + storefront.
   PROTOTYPE NOTE: data is saved in this browser's localStorage. For a live shop where every
   visitor sees the owner's edits, swap load()/save() for a backend (Firebase, Supabase, etc.). */
const KEY='zero11:v1',
CATS=['Jeans','Cargo Pants','T-Shirts','Shirts','Hoodies & Sweatshirts'],
SIZES=['S','M','L','XL','XXL','28','30','32','34','36'],
TOP=['S','M','L','XL'],BOT=['30','32','34','36'],
vs=(sz,color,...q)=>sz.map((size,i)=>({size,color,qty:q[i]??0}));
const DEF=()=>({
 store:{name:'Zero 11',tagline:'Trendy men\'s fashion for ages 18 to 30. Delivered across India.',phone:'919999999999',
  address:'Pillar No. 1134, Modinagar, Ghaziabad, Uttar Pradesh - 201204',instagram:'https://www.instagram.com/zero11.in/',
  ship:'Delivery across India. Shipping charges depend on your location and order. Sizes, colours, availability, delivery time and return or exchange details are confirmed on WhatsApp.'},
 products:[
 {id:'s1',name:'Baggy wide-leg jeans',cat:'Jeans',price:1599,desc:'Relaxed wide-leg fit in heavy washed denim.',imgs:[],variants:[...vs(BOT,'Washed blue',4,6,5,2),...vs(BOT,'Black',3,5,4,0)],isNew:true,published:true,sample:true},
 {id:'s2',name:'Utility cargo pants',cat:'Cargo Pants',price:1399,desc:'Six-pocket cargos with a loose street fit.',imgs:[],variants:[...vs(BOT,'Olive',5,5,3,2),...vs(BOT,'Khaki',2,4,4,1)],isNew:true,published:true,sample:true},
 {id:'s3',name:'Oversized graphic tee',cat:'T-Shirts',price:799,desc:'Drop-shoulder oversized tee in heavy cotton.',imgs:[],variants:[...vs(TOP,'White',6,8,8,4),...vs(TOP,'Black',5,9,7,3)],isNew:false,published:true,sample:true},
 {id:'s4',name:'Regular fit tee',cat:'T-Shirts',price:599,desc:'Everyday regular-fit cotton tee.',imgs:[],variants:vs(TOP,'Grey',4,6,6,2),isNew:false,published:true,sample:true},
 {id:'s5',name:'Boxy camp-collar shirt',cat:'Shirts',price:1199,desc:'Relaxed boxy shirt with a camp collar.',imgs:[],variants:vs(TOP,'Cream',3,5,4,2),isNew:false,published:true,sample:true},
 {id:'s6',name:'Heavyweight hoodie',cat:'Hoodies & Sweatshirts',price:1799,desc:'Fleece-lined oversized hoodie.',imgs:[],variants:[...vs(TOP,'Black',3,5,5,2),...vs(TOP,'Charcoal',2,4,3,0)],isNew:true,published:true,sample:true}
 ],reviews:[]});
const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.products&&x.store)return x}catch{}return DEF()};
const save=d=>{try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch{alert('Storage is full. Remove a few photos or use smaller ones.');return false}};
const inr=n=>'\u20B9'+Number(n).toLocaleString('en-IN');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stock=p=>p.variants.reduce((a,v)=>a+(+v.qty||0),0);
const wa=(phone,text)=>`https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

/* ---------- storefront ---------- */
if(document.body.dataset.page==='shop')(()=>{
 const d=load(),s=d.store,$=q=>document.querySelector(q),m=$('#m');
 const link=t=>wa(s.phone,t);
 const img=(p,i=0)=>p.imgs[i]?`<img src="${p.imgs[i]}" alt="${esc(p.name)}" loading="lazy">`:'<div class="ph">ZERO 11</div>';
 document.title=`${s.name} | Men's streetwear in Modinagar, delivered across India`;
 $('#waTop').href=$('#waF').href=link(`Hi ${s.name}! I have a question.`);
 $('#tag').textContent=s.tagline;$('#addr').textContent=s.address;$('#shipNote').textContent=s.ship;
 $('#ig').href=s.instagram;$('#ig').textContent='@'+s.instagram.replace(/\/$/,'').split('/').pop();
 $('#yr').textContent=new Date().getFullYear();

 const pubs=d.products.filter(p=>p.published);let cat='All';
 $('#chips').innerHTML=['All','New arrivals',...CATS].map(c=>`<button class="chip${c==='All'?' on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
 const card=p=>`<article class="card${stock(p)<1?' out':''}" data-id="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)}"><div class="im">${img(p)}${p.isNew?'<span class="tag">New</span>':''}${stock(p)<1?'<span class="tag sold">Sold out</span>':''}</div><h3>${esc(p.name)}</h3><p class="pr">${inr(p.price)}</p></article>`;
 const grid=()=>{const l=pubs.filter(p=>cat==='All'||(cat==='New arrivals'?p.isNew:p.cat===cat));
  $('#grid').innerHTML=l.length?l.map(card).join(''):'<p class="empty">Nothing here yet. Check back soon or message us on WhatsApp.</p>'};
 $('#chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;cat=b.dataset.c;
  document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));grid()};

 const open=id=>{const p=d.products.find(x=>x.id===id);if(!p)return;
  const by={};p.variants.forEach(v=>(by[v.color||'Standard']??=[]).push(v));
  const msg=`Hi ${s.name}! I want to order:\n${p.name} - ${inr(p.price)}\nSize:\nColour:\nCity and PIN code:`;
  m.innerHTML=`<div class="pm"><div class="g"><div class="im" id="mi">${img(p)}</div>${p.imgs.length>1?`<div class="mt">${p.imgs.map((x,i)=>`<img src="${x}" alt="" data-i="${i}" class="${i?'':'on'}">`).join('')}</div>`:''}</div>
  <div class="pi"><button class="cl" id="mc">Close</button><h2>${esc(p.name)}</h2><p class="pr big">${inr(p.price)}</p><p>${esc(p.desc)}</p>
  ${Object.entries(by).map(([c,a])=>`<div class="vr"><span>${esc(c)}</span>${a.map(v=>`<i class="${v.qty>0?'':'x'}">${esc(v.size)}</i>`).join('')}</div>`).join('')}
  <p class="note">Crossed-out sizes are sold out. We confirm final availability on WhatsApp.</p>
  <a class="btn" target="_blank" rel="noopener" href="${link(msg)}">${stock(p)<1?'Ask about restock':'Order on WhatsApp'}</a>
  <p class="note">Tip: screenshot this product and send it with your order.</p></div></div>`;
  m.showModal();$('#mc').onclick=()=>m.close();
  m.querySelector('.mt')?.addEventListener('click',e=>{const i=e.target.dataset.i;if(i==null)return;
   $('#mi').innerHTML=img(p,+i);m.querySelectorAll('.mt img').forEach(t=>t.classList.toggle('on',t.dataset.i===i))})};
 m.onclick=e=>{if(e.target===m)m.close()};
 $('#grid').onclick=e=>{const c=e.target.closest('.card');c&&open(c.dataset.id)};
 $('#grid').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){const c=e.target.closest('.card');if(c){e.preventDefault();open(c.dataset.id)}}};

 const rv=d.reviews.filter(r=>r.published); /* reviews stay hidden until a genuine one is published */
 if(rv.length){$('#reviews').hidden=false;$('#nrev').hidden=false;
  $('#rv').innerHTML=rv.map(r=>`<blockquote><div class="st" aria-label="${r.rating} out of 5">${'\u2605'.repeat(r.rating)}${'\u2606'.repeat(5-r.rating)}</div><p>${esc(r.text)}</p><cite>${esc(r.name)}${r.city?', '+esc(r.city):''}</cite></blockquote>`).join('')}
 grid();
})();
