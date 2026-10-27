/* Petites fonctions de création DOM : les textes restent des textes et ne sont
   jamais exécutés comme du HTML. Les données proviennent de content.js. */
const projects = window.PORTFOLIO || [];
const main = document.querySelector('main');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer:fine)');
function node(tag, className, text) { const el=document.createElement(tag); if(className) el.className=className; if(text) el.textContent=text; return el; }
function link(text,href,className='') { const a=node('a',className,text); a.href=href; return a; }
function image(src,alt) { const img=node('img'); img.src=src; img.alt=alt; img.loading='lazy'; img.decoding='async'; return img; }
function heading(text,level=2) { return node('h'+level,'',text); }
function contacts() {
  const section=node('section','contact-strip'); section.append(heading('Échangeons sur votre prochain projet.'));
  const row=node('div','contact-links');
  row.append(link('E-mail ↗','mailto:kevidudk@yahoo.com','pill'),link('LinkedIn ↗','https://www.linkedin.com/in/kevidu-d-kussiyage-8ba806270/','pill'));
  const cv=link('Télécharger le CV ↓','assets/cv-kevidu-kussiyage.pdf','pill'); cv.download=''; row.append(cv); section.append(row); return section;
}

/* Vue Projets : la fenêtre introductive, les cinq cas et tous les travaux
   complémentaires possèdent la même charte, sans renvoi vers l’ancien site. */
function work(view) {
  const hero=node('section','window'); hero.setAttribute('aria-label','Présentation');
  const bar=node('div','window-bar'); bar.setAttribute('aria-hidden','true'); bar.append(node('i','dot'),node('i','dot'),node('i','dot'),node('span','','+')); hero.append(bar);
  const content=node('div','hero-content'); const title=heading('',1); title.append(document.createTextNode('Je conçois des objets,'),node('br'),document.createTextNode('des expériences & '),node('em','','des usages.'));
  const copy=node('p','hero-copy','Un double diplôme ingénieur·designer.'); copy.append(node('span','','À la recherche d’un stage de six mois.'));
  const down=link('↓','#selected','down'); down.setAttribute('aria-label','Découvrir les projets'); content.append(title,copy,down); hero.append(content); view.append(hero);
  const label=node('div','selection'); label.id='selected'; label.append(heading('Sélection de projets / 2026'),node('span','','01 — 05')); view.append(label);
  const grid=node('section','projects'); grid.setAttribute('aria-label','Études de cas');
  const tones=['#45524f','#e1d7bc','#949e88','#bfc4d4','#c7b6db'];
  projects.slice(0,5).forEach((p,i)=>{
    const card=link('',`#project/${p.id}`,'project-card reveal'); card.style.setProperty('--tone',tones[i]);
    const head=node('div','card-head'); head.append(heading(p.title,3),node('span','arrow','↗'));
    const copy=node('p','',p.category+' — '+p.summary); const media=node('div','card-media'); if(p.cover) media.append(image(p.cover,'Aperçu du projet '+p.title));
    card.append(head,copy,media); card.dataset.cursor='true'; grid.append(card);
  }); view.append(grid);
  const explore=node('section','explore'); explore.append(node('p','label','Autres travaux'),heading('Explorations créatives & techniques.'));
  const all=node('div','explore-grid'); projects.slice(5).forEach(p=>{const a=link('',`#project/${p.id}`,'small-project reveal'); const t=node('div','',p.title); t.append(node('small','',p.category)); a.append(t,node('span','','↗')); all.append(a);}); explore.append(all); view.append(explore,contacts());
}

/* Profil : uniquement des informations déjà fournies, sans inventer de poste,
   de rôle individuel, de dates de projet ou de résultats chiffrés. */
function info(view) {
  view.append(node('p','label','Profil'),heading('Entre ingénierie, design et usages.',1)); view.lastChild.className='info-title';
  const panel=node('section','profile-panel'); panel.append(heading('Kevidu Kussiyage'),node('p','','Après six années dans un double cursus ingénieur·designer, je cherche un stage de six mois en ingénierie, design ou conception hybride.'));
  panel.append(node('p','','Mes projets explorent les interactions automobiles, l’adoption du numérique en agriculture, les matériaux recyclés, la collecte de données et les expériences immersives.'));
  const columns=node('div','profile-columns'); const a=node('div'); a.append(node('p','label','Pratique du design'),node('p','','Graphisme · Matière · Sculpture · Croquis · Animation · Modélisation 3D'));
  const b=node('div'); b.append(node('p','label','Pratique informatique'),node('p','','C · HTML / CSS / JavaScript · Python · Java · SQL · Unix')); columns.append(a,b);panel.append(columns);view.append(panel,contacts());
}

/* Étude de cas : les textes et médias de chaque projet sont lus dans leur
   ordre original. Les PDF s’ouvrent comme documents, jamais comme images. */
function detail(view,id) {
  const p=projects.find(p=>p.id===id); if(!p){ view.append(heading('Projet introuvable',1),link('Retour aux projets','#work','pill')); return; }
  document.title=p.title+' — Kevidu Kussiyage';
  const top=node('section','case-top'); top.append(link('← Tous les projets','#work','back'),node('p','label',p.category),heading(p.title,1)); if(p.summary) top.append(node('p','summary',p.summary)); view.append(top);
  if(p.cover){ const cover=image(p.cover,p.title); cover.className='case-cover'; cover.loading='eager'; view.append(cover); }
  // Le démonstrateur utilise le même thème que le projet et vit dans cette vue.
  if(id==='jeudelavie'){const demo=node('section','life-root');demo.setAttribute('aria-label','Jeu de la vie interactif');view.append(demo);}
  const layout=node('div','case-layout'); const toc=node('nav','case-index'); toc.setAttribute('aria-label','Sommaire du projet'); const body=node('article','case-body'); let sections=0, mediaIndex=0;
  p.blocks.forEach(block=>{
    if(block.type==='text'){body.append(node('p','',block.text));}
    if(block.type==='heading'){const h=heading(block.text); h.id='section-'+sections++; body.append(h); if(sections<7){const a=link(block.text,`#project/${id}`);a.addEventListener('click',e=>{e.preventDefault();h.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});});toc.append(a);}}
    if(block.type==='image'){const fig=node('figure','reveal'); const img=image(block.src,p.title+' — visuel '+(++mediaIndex)); img.tabIndex=0; img.setAttribute('role','button'); img.setAttribute('aria-label','Agrandir le visuel '+mediaIndex); img.dataset.enlarge='true';fig.append(img);body.append(fig);}
    if(block.type==='video'){const fig=node('figure','reveal'); const video=node('video'); video.src=block.src;video.controls=true;video.playsInline=true;video.preload='metadata'; fig.append(video);body.append(fig);}
    if(block.type==='document'){const a=link('Consulter le document ↗',block.src,'document');a.target='_blank';a.rel='noopener';body.append(a);}
  });
  if(!p.blocks.length)body.append(node('p','empty','Les éléments de ce projet ne sont pas disponibles dans les fichiers du portfolio source.'));
  if(!toc.children.length)toc.append(link('Tous les projets','#work'));layout.append(toc,body);view.append(layout);
  const next=projects[(projects.indexOf(p)+1)%projects.length]; const a=link('',`#project/${next.id}`,'case-next');a.append(node('span','muted','Projet suivant'),node('strong','',next.title+' ↗'));view.append(a);
}

/* Navigation par fragment : fonctionne sur un hébergement statique, avec
   historique et liens directs vers chacune des dix-neuf études de cas. */
let route='';
let disposeView=()=>{};
function render(){
  const hash=decodeURIComponent(location.hash.slice(1)||'work');
  if(hash==='selected'||hash==='main'||hash.startsWith('section-'))return;
  if(route===hash)return;disposeView();disposeView=()=>{};route=hash;document.title='Kevidu Kussiyage — Ingénierie & Design';
  const view=node('div','view'); if(hash==='info')info(view);else if(hash.startsWith('project/'))detail(view,hash.slice(8));else work(view);
  main.replaceChildren(view); document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===(hash==='info'?'info':'work');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const lifeRoot=view.querySelector('.life-root');if(lifeRoot)disposeView=window.GameOfLife.mount(lifeRoot);
  window.scrollTo({top:0,behavior:'instant'});setupInteractions();
}
window.addEventListener('hashchange',render);render();
// Un deuxième clic sur l’onglet actif revient en haut même si l’URL est identique.
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!e.defaultPrevented&&a&&a.getAttribute('href')==='#'+route){window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});}});

/* Révélation au défilement : le contenu reste visible sans observateur ou avec
   la préférence de réduction des animations. */
function setupInteractions(){
  if(!reduced.matches&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}});},{rootMargin:'50px'});document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('pending');observer.observe(el);});}
  if(!finePointer.matches||reduced.matches)return;
  document.querySelectorAll('.project-card').forEach(card=>{
    card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;card.style.setProperty('--x',x*100+'%');card.style.setProperty('--y',y*100+'%');card.style.transform=`perspective(1400px) rotateX(${(0.5-y)*2}deg) rotateY(${(x-0.5)*2}deg)`;});
    card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });
}
const cursor=document.querySelector('.cursor');
document.addEventListener('pointermove',e=>{if(!finePointer.matches)return;cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';cursor.classList.toggle('visible',Boolean(e.target.closest('[data-cursor]')));});
window.addEventListener('scroll',()=>{const extent=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.transform=`scaleX(${extent>0?scrollY/extent:0})`;cursor.classList.remove('visible');},{passive:true});

/* Agrandissement natif : fermeture avec Échap, bouton ou clic hors image.
   Le navigateur gère le focus du dialogue et le rend au visuel d’origine. */
const dialog=document.querySelector('.lightbox');
function enlarge(img){dialog.querySelector('img').src=img.src;dialog.querySelector('img').alt=img.alt;dialog.showModal();}
main.addEventListener('click',e=>{if(e.target.matches('[data-enlarge]'))enlarge(e.target);});
main.addEventListener('keydown',e=>{if(e.target.matches('[data-enlarge]')&&['Enter',' '].includes(e.key)){e.preventDefault();enlarge(e.target);}});
dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
