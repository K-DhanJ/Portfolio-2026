/* Petites fonctions de création DOM : les textes restent des textes et ne sont
   jamais exécutés comme du HTML. Les données proviennent de content.js. */
const messages={
  skip:['Aller au contenu','Skip to content'],identity:['Ingénierie & Design','Engineering & Design'],navigation:['Navigation principale','Main navigation'],footerNav:['NAVIGATION','NAVIGATION'],language:['Langue','Language'],projects:['Projets','Projects'],profile:['Profil','About'],headerCv:['CV ↗','CV ↗'],downloadCv:['Télécharger le CV ↓','Download CV ↓'],tagline:['Ingénierie, design et usages.','Engineering, design and people.'],backToProjects:['↑ Retour aux projets','↑ Back to projects'],open:['Ouvrir ↗','Open ↗'],enlarged:['Vue agrandie','Enlarged image'],close:['Fermer ×','Close ×'],closeLabel:['Fermer la vue agrandie','Close enlarged image']
};
const params=new URLSearchParams(location.search);
let storedLanguage='fr';try{storedLanguage=localStorage.getItem('portfolio-language')||'fr';}catch{}
let language=['fr','en'].includes(params.get('lang'))?params.get('lang'):storedLanguage==='en'?'en':'fr';
window.portfolioLanguage=language;
let projects=language==='en'?window.PORTFOLIO_EN:window.PORTFOLIO;
const tr=(fr,en)=>language==='en'?en:fr;
// Force la présentation typographique des flèches sur les systèmes mobiles.
const textArrows=value=>value.replace(/[\u2190-\u2199]/g,arrow=>arrow+'\uFE0E');
const cvHref=()=>tr('assets/cv-kevidu-kussiyage.pdf?v=2026-11-corrected','assets/cv-kevidu-kussiyage-en.pdf?v=2026-11-corrected');
function translateShell(){
  document.documentElement.lang=language;
  document.querySelector('meta[name=description]').content=tr('Kevidu Kussiyage — ingénierie, design et usages. Projets et explorations d’un double cursus ingénieur-designer.','Kevidu Kussiyage — engineering, design and user experiences. Projects from a dual engineering and design degree.');
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=textArrows(messages[el.dataset.i18n][language==='en'?1:0]);});
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',messages[el.dataset.i18nAria][language==='en'?1:0]);});
  document.querySelectorAll('[data-cv]').forEach(el=>{el.href=cvHref();});
  document.querySelectorAll('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===language)));
}
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
  if(button.dataset.lang===language)return;
  language=button.dataset.lang;window.portfolioLanguage=language;projects=language==='en'?window.PORTFOLIO_EN:window.PORTFOLIO;
  try{localStorage.setItem('portfolio-language',language);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  translateShell();route='';render(true);
}));
translateShell();
const main = document.querySelector('main');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer:fine)');
function node(tag, className, text) { const el=document.createElement(tag); if(className) el.className=className; if(text) el.textContent=textArrows(text); return el; }
function link(text,href,className='') { const a=node('a',className,text); a.href=href; return a; }
function image(src,alt) { const img=node('img'); img.src=src; img.alt=alt; img.loading='lazy'; img.decoding='async'; return img; }
function heading(text,level=2) { return node('h'+level,'',text); }
function contacts() {
  const section=node('section','contact-strip'); section.append(heading(tr('Échangeons sur votre prochain projet.','Let’s talk about your next project.')));
  const row=node('div','contact-links');
  row.append(link('E-mail ↗','mailto:kevidudk@yahoo.com','pill'),link('LinkedIn ↗','https://www.linkedin.com/in/kevidu-d-kussiyage-8ba806270/','pill'));
  const cv=link(tr('Télécharger le CV ↓','Download CV ↓'),cvHref(),'pill'); cv.download=''; row.append(cv); section.append(row); return section;
}

/* Vue Projets : la fenêtre introductive, les cinq cas et tous les travaux
   complémentaires possèdent la même charte, sans renvoi vers l’ancien site. */
function work(view) {
  const hero=node('section','window'); hero.setAttribute('aria-label',tr('Présentation','Introduction'));
  const bar=node('div','window-bar'); bar.setAttribute('aria-hidden','true'); bar.append(node('i','dot'),node('i','dot'),node('i','dot'),node('span','','+')); hero.append(bar);
  const content=node('div','hero-content'); const title=heading('',1); title.append(document.createTextNode(tr('Je conçois des objets,','I design objects,')),node('br'),document.createTextNode(tr('des expériences & ','experiences & ')),node('em','',tr('des usages.','human interactions.')));
  const copy=node('p','hero-copy',tr('Un double diplôme ingénieur·designer.','A dual degree in engineering and design.')); copy.append(node('span','',tr('À la recherche d’un stage de six mois.','Seeking a six-month internship.')));
  const down=link('↓','#selected','down'); down.setAttribute('aria-label',tr('Découvrir les projets','Explore the projects')); content.append(title,copy,down); hero.append(content); view.append(hero);
  const label=node('div','selection'); label.id='selected'; label.append(heading(tr('Sélection de projets / 2026','Selected projects / 2026')),node('span','','01 — 05')); view.append(label);
  const grid=node('section','projects'); grid.setAttribute('aria-label',tr('Études de cas','Case studies'));
  const tones=['#45524f','#e1d7bc','#949e88','#bfc4d4','#c7b6db'];
  // Les illustrations de l'accueil sont indépendantes des visuels des études de cas.
  const homeThumbnails={renault:'assets/projects/home-renault.jpg',inrae:'assets/projects/home-inrae.jpg','epopee-temporelle':'assets/projects/home-epopee-temporelle.jpg',mgp:'assets/projects/home-mgp.jpg',numix:'assets/projects/home-numix.jpg'};
  projects.slice(0,5).forEach((p,i)=>{
    const card=link('',`#project/${p.id}`,'project-card reveal'); card.style.setProperty('--tone',tones[i]);
    const head=node('div','card-head'); head.append(heading(p.title,3),node('span','arrow','↗'));
    const copy=node('p','',p.category+' — '+p.summary); const media=node('div','card-media'); const thumbnail=homeThumbnails[p.id]||p.cover; if(thumbnail){if(homeThumbnails[p.id])media.classList.add('card-media--illustration');media.append(image(thumbnail,tr('Illustration du projet ','Illustration for project ')+p.title));}
    card.append(head,copy,media); card.dataset.cursor='true'; grid.append(card);
  }); view.append(grid);
  const explore=node('section','explore'); explore.append(node('p','label',tr('Autres travaux','Other work')),heading(tr('Explorations créatives & techniques.','Creative & technical explorations.')));
  const all=node('div','explore-grid'); projects.slice(5).forEach(p=>{const a=link('',`#project/${p.id}`,'small-project reveal'); const t=node('div','',p.title); t.append(node('small','',p.category)); a.append(t,node('span','','↗')); all.append(a);}); explore.append(all); view.append(explore,contacts());
}

/* Profil : uniquement des informations déjà fournies, sans inventer de poste,
   de rôle individuel, de dates de projet ou de résultats chiffrés. */
function info(view) {
  view.append(node('p','label',tr('Profil','About')),heading(tr('Entre ingénierie, design et usages.','Where engineering meets design and people.'),1)); view.lastChild.className='info-title';
  const panel=node('section','profile-panel'); panel.append(heading('Kevidu Kussiyage'),node('p','',tr('Après six années dans un double cursus ingénieur·designer, je cherche un stage de six mois en ingénierie, design ou conception hybride.','After six years in a dual engineering and design programme, I am seeking a six-month internship in engineering, design or a role combining both.')));
  panel.append(node('p','',tr('Mes projets explorent les interactions automobiles, l’adoption du numérique en agriculture, la mise en valeur du patrimoine, la collecte de données et les expériences immersives.','My projects explore automotive interaction, digital tools in agriculture, cultural heritage, data collection and immersive experiences.')));
  const columns=node('div','profile-columns'); const a=node('div'); a.append(node('p','label',tr('Pratique du design','Design practice')),node('p','',tr('Graphisme · Matière · Sculpture · Croquis · Animation · Modélisation 3D','Graphic design · Materials · Sculpture · Sketching · Animation · 3D modelling')));
  const b=node('div'); b.append(node('p','label',tr('Pratique informatique','Computing practice')),node('p','','C · HTML / CSS / JavaScript · Python · Java · SQL · Unix')); columns.append(a,b);panel.append(columns);view.append(panel,contacts());
}

/* Étude de cas : les textes et médias de chaque projet sont lus dans leur
   ordre original. Les PDF s’ouvrent comme documents, jamais comme images. */
function detail(view,id) {
  const p=projects.find(p=>p.id===id); if(!p){ view.append(heading(tr('Projet introuvable','Project not found'),1),link(tr('Retour aux projets','Back to projects'),'#work','pill')); return; }
  document.title=p.title+' — Kevidu Kussiyage';
  const top=node('section','case-top'); top.append(link(tr('← Tous les projets','← All projects'),'#work','back'),node('p','label',p.category),heading(p.title,1)); if(p.summary) top.append(node('p','summary',p.summary)); view.append(top);
  if(p.cover){ const cover=image(p.cover,p.title); cover.className='case-cover'; cover.loading='eager'; view.append(cover); }
  // Le démonstrateur utilise le même thème que le projet et vit dans cette vue.
  if(id==='jeudelavie'){const demo=node('section','life-root');demo.setAttribute('aria-label',tr('Jeu de la vie interactif','Interactive Game of Life'));view.append(demo);}
  // Une iframe isole l’exécution Python : elle se charge seulement pour 2048
  // et son contexte est automatiquement détruit quand le visiteur quitte la vue.
  if(id==='2048'){const demo=node('section','python-demo');const frame=node('iframe','python-game-frame');frame.src='games/2048/index.html?lang='+language;frame.title=tr('Jeu 2048 interactif codé en Python','Interactive 2048 game coded in Python');frame.loading='lazy';demo.append(frame);view.append(demo);}
  const layout=node('div','case-layout'); const toc=node('nav','case-index'); toc.setAttribute('aria-label',tr('Sommaire du projet','Project contents')); const body=node('article','case-body'); let sections=0, mediaIndex=0;
  // Une même figure gère les légendes, les images isolées et les galeries.
  function mediaFigure(item){const fig=node('figure','reveal');const img=image(item.src,item.alt||p.title+tr(' — visuel ',' — visual ')+(++mediaIndex));img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',tr('Agrandir : ','Enlarge: ')+img.alt);img.dataset.enlarge='true';fig.append(img);if(item.caption)fig.append(node('figcaption','',item.caption));return fig;}
  p.blocks.forEach(block=>{
    if(block.type==='text'){body.append(node('p','',block.text));}
    if(block.type==='heading'){const h=heading(block.text); h.id='section-'+sections++; body.append(h); if(sections<8){const a=link(block.text,`#project/${id}`);a.addEventListener('click',e=>{e.preventDefault();h.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});});toc.append(a);}}
    if(block.type==='image')body.append(mediaFigure(block));
    if(block.type==='gallery'){const gallery=node('div','case-gallery'+(block.variant==='phone'?' case-gallery--phone':''));block.items.forEach(item=>gallery.append(mediaFigure(item)));body.append(gallery);}
    if(block.type==='flow'){const flow=node('ol','case-flow');flow.setAttribute('aria-label',tr('Fonctionnement du système','How the system works'));block.items.forEach(item=>{const step=node('li');step.append(node('strong','',item.title),node('span','',item.text));flow.append(step);});body.append(flow);}
    if(block.type==='video'){const fig=node('figure','reveal'); const video=node('video'); video.src=block.src;video.controls=true;video.playsInline=true;video.preload='metadata';if(block.caption)video.setAttribute('aria-label',block.caption);fig.append(video);if(block.caption)fig.append(node('figcaption','',block.caption));body.append(fig);}
    if(block.type==='link'){const a=link(block.text,block.href,'document');a.target='_blank';a.rel='noopener noreferrer';body.append(a);}
    if(block.type==='document'){const a=link(tr('Consulter le document ↗','View document ↗'),block.src,'document');a.target='_blank';a.rel='noopener';body.append(a);}
  });
  if(!p.blocks.length)body.append(node('p','empty',tr('Les éléments de ce projet ne sont pas disponibles dans les fichiers du portfolio source.','Details for this project were not available in the source portfolio.')));
  if(!toc.children.length)toc.append(link(tr('Tous les projets','All projects'),'#work'));layout.append(toc,body);view.append(layout);
  const next=projects[(projects.indexOf(p)+1)%projects.length]; const a=link('',`#project/${next.id}`,'case-next');a.append(node('span','muted',tr('Projet suivant','Next project')),node('strong','',next.title+' ↗'));view.append(a);
}

/* Navigation par fragment : fonctionne sur un hébergement statique, avec
   historique et liens directs vers chacune des dix-neuf études de cas. */
let route='';
let disposeView=()=>{};
function render(preserveScroll=false){
  const hash=decodeURIComponent(location.hash.slice(1)||'work');
  // Les liens déjà partagés vers PetApp ouvrent le projet qui le remplace.
  if(hash==='project/petapp'){location.replace('#project/surveillance');return;}
  // Les liens vers les deux anciennes études de cas ouvrent désormais le projet de Maubuisson.
  if(hash==='project/recnorec'||hash==='project/compagnons'){location.replace('#project/epopee-temporelle');return;}
  if(hash==='selected'||hash==='main'||hash.startsWith('section-'))return;
  if(route===hash)return;disposeView();disposeView=()=>{};route=hash;document.title=tr('Kevidu Kussiyage — Ingénierie & Design','Kevidu Kussiyage — Engineering & Design');
  const view=node('div','view'); if(hash==='info')info(view);else if(hash.startsWith('project/'))detail(view,hash.slice(8));else work(view);
  main.replaceChildren(view); document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===(hash==='info'?'info':'work');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const lifeRoot=view.querySelector('.life-root');if(lifeRoot)disposeView=window.GameOfLife.mount(lifeRoot);
  if(!preserveScroll)window.scrollTo({top:0,behavior:'instant'});setupInteractions();
}
window.addEventListener('hashchange',()=>render());render();
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
