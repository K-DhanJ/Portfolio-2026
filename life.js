/* Jeu de la vie : adaptation du principe de la grille JavaScript du portfolio
   initial, avec contrôles, dessin tactile et arrêt lors du départ de la page. */
(() => {
  // Une génération est calculée dans un autre tableau : toutes les cellules
  // évoluent simultanément. Les cellules hors grille sont considérées mortes.
  function nextGeneration(grid, cols, rows) {
    const next = new Uint8Array(cols * rows);
    for (let y=0; y<rows; y++) for (let x=0; x<cols; x++) {
      let neighbors=0;
      for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) {
        const nx=x+dx, ny=y+dy;
        if((dx||dy)&&nx>=0&&nx<cols&&ny>=0&&ny<rows) neighbors+=grid[ny*cols+nx];
      }
      const i=y*cols+x;
      next[i]=neighbors===3||(grid[i]&&neighbors===2)?1:0;
    }
    return next;
  }

  function mount(root) {
    const cols=50, rows=25, cell=16;
    let grid=new Uint8Array(cols*rows), generation=0, timer=null;
    let selection={x:24,y:12}, drawing=false, paintValue=1, lastCell=-1;
    const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
    const title=el('h2','','À vous de jouer.');title.id='life-title';root.setAttribute('aria-labelledby',title.id);
    const help=el('p','life-help','Dessinez des cellules sur la grille, choisissez un motif, puis lancez la simulation.');
    const toolbar=el('div','life-toolbar');
    function button(label,action,primary=false){const b=el('button',primary?'life-button primary':'life-button',label);b.type='button';b.addEventListener('click',action);return b;}
    const play=button('Démarrer',()=>timer?pause():start(),true);play.setAttribute('aria-pressed','false');
    const step=button('Un pas',()=>{pause();advance();});
    const random=button('Aléatoire',()=>{pause();generation=0;grid=Uint8Array.from(grid,()=>Math.random()<.24?1:0);draw();announce('Grille aléatoire prête.');});
    const clear=button('Effacer',()=>{pause();grid.fill(0);generation=0;draw();announce('Grille effacée.');});
    toolbar.append(play,step,random,clear);
    const options=el('div','life-options');
    const patternLabel=el('label','','Motif de départ');const pattern=el('select');pattern.setAttribute('aria-label','Motif de départ');
    [['glider','Planeur'],['blinker','Clignotant'],['pulsar','Pulsar'],['empty','Grille vide']].forEach(([value,label])=>{const o=el('option','',label);o.value=value;pattern.append(o);});patternLabel.append(pattern);
    const speedLabel=el('label','','Vitesse');const speed=el('input');speed.type='range';speed.min='1';speed.max='20';speed.value='6';speed.setAttribute('aria-label','Vitesse de simulation');
    const speedValue=el('output','','6 générations/s');speedLabel.append(speed,speedValue);options.append(patternLabel,speedLabel);
    const canvas=el('canvas','life-canvas');canvas.width=cols*cell;canvas.height=rows*cell;canvas.tabIndex=0;
    canvas.setAttribute('role','group');canvas.setAttribute('aria-label','Grille de 50 colonnes et 25 lignes. Flèches pour déplacer la sélection, espace pour activer ou désactiver une cellule.');
    const instruction=el('p','life-help','Souris ou doigt : cliquer / glisser pour dessiner. Au clavier : flèches pour se déplacer, espace pour changer une cellule. Bords fermés : les cellules extérieures sont mortes.');instruction.id='life-instructions';canvas.setAttribute('aria-describedby',instruction.id);
    const stats=el('p','life-stats');const status=el('p','life-status','Simulation en pause.');status.setAttribute('role','status');
    const rules=el('details','life-rules');rules.append(el('summary','','Comprendre les règles'),el('p','','Une cellule vivante survit avec 2 ou 3 voisines. Une cellule morte naît avec exactement 3 voisines. Dans les autres cas, elle reste ou devient morte. À chaque génération, toutes les cellules évoluent en même temps.'));
    root.append(title,help,toolbar,options,canvas,stats,status,instruction,rules);
    const ctx=canvas.getContext('2d');
    function announce(text){status.textContent=text;}
    function draw(){
      ctx.fillStyle='#151719';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#c2caff';grid.forEach((alive,i)=>{if(alive)ctx.fillRect((i%cols)*cell+1,Math.floor(i/cols)*cell+1,cell-2,cell-2);});
      ctx.strokeStyle='#ffffff12';ctx.lineWidth=1;ctx.beginPath();
      for(let x=0;x<=cols;x++){ctx.moveTo(x*cell+.5,0);ctx.lineTo(x*cell+.5,rows*cell);}
      for(let y=0;y<=rows;y++){ctx.moveTo(0,y*cell+.5);ctx.lineTo(cols*cell,y*cell+.5);}ctx.stroke();
      if(document.activeElement===canvas){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(selection.x*cell+1,selection.y*cell+1,cell-2,cell-2);}
      const alive=grid.reduce((sum,v)=>sum+v,0);stats.textContent=`Génération ${generation} · ${alive} cellule${alive===1?'':'s'} vivante${alive===1?'':'s'}`;
    }
    function pause(){if(timer!==null)clearInterval(timer);timer=null;play.textContent='Démarrer';play.setAttribute('aria-pressed','false');announce('Simulation en pause.');}
    function start(){if(timer!==null)return;timer=setInterval(advance,1000/Number(speed.value));play.textContent='Pause';play.setAttribute('aria-pressed','true');announce('Simulation en cours.');}
    function advance(){
      const next=nextGeneration(grid,cols,rows);const stable=next.every((v,i)=>v===grid[i]);grid=next;generation++;draw();
      if(stable){pause();announce('État stable atteint. Dessinez de nouvelles cellules ou choisissez un motif.');}
    }
    // Les motifs remplacent la grille et se chargent en pause : aucune animation
    // n’est imposée à l’arrivée sur la page ou pendant le dessin.
    function loadPattern(){
      pause();grid.fill(0);generation=0;const points=[];
      if(pattern.value==='glider')points.push([1,0],[2,1],[0,2],[1,2],[2,2]);
      if(pattern.value==='blinker')points.push([0,1],[1,1],[2,1]);
      if(pattern.value==='pulsar'){
        for(const a of [2,3,4,8,9,10])for(const b of [0,5,7,12])points.push([a,b],[b,a]);
      }
      const offset=pattern.value==='pulsar'?{x:18,y:6}:{x:23,y:11};
      points.forEach(([x,y])=>grid[(y+offset.y)*cols+x+offset.x]=1);draw();announce(pattern.value==='empty'?'Grille vide prête à dessiner.':'Motif '+pattern.selectedOptions[0].textContent+' chargé.');
    }
    pattern.addEventListener('change',loadPattern);
    speed.addEventListener('input',()=>{speedValue.textContent=speed.value+' générations/s';if(timer!==null){pause();start();}});
    // Les coordonnées utilisent le rectangle affiché : le dessin reste exact
    // lorsque le canvas est réduit sur un écran mobile.
    function paint(event){const r=canvas.getBoundingClientRect();const x=Math.floor((event.clientX-r.left)/r.width*cols),y=Math.floor((event.clientY-r.top)/r.height*rows);if(x<0||y<0||x>=cols||y>=rows)return;const i=y*cols+x;if(i===lastCell)return;lastCell=i;selection={x,y};grid[i]=paintValue;draw();}
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;pause();canvas.focus({preventScroll:true});const r=canvas.getBoundingClientRect(),x=Math.min(cols-1,Math.max(0,Math.floor((e.clientX-r.left)/r.width*cols))),y=Math.min(rows-1,Math.max(0,Math.floor((e.clientY-r.top)/r.height*rows)));paintValue=1-grid[y*cols+x];lastCell=-1;drawing=true;canvas.setPointerCapture(e.pointerId);paint(e);});
    canvas.addEventListener('pointermove',e=>{if(drawing)paint(e);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drawing=false;lastCell=-1;});
    canvas.addEventListener('keydown',e=>{
      const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(delta){e.preventDefault();selection.x=Math.max(0,Math.min(cols-1,selection.x+delta[0]));selection.y=Math.max(0,Math.min(rows-1,selection.y+delta[1]));}
      else if(e.key===' '||e.key==='Enter'){e.preventDefault();pause();grid[selection.y*cols+selection.x]^=1;}else return;
      draw();announce(`Ligne ${selection.y+1}, colonne ${selection.x+1} : cellule ${grid[selection.y*cols+selection.x]?'vivante':'morte'}.`);
    });
    canvas.addEventListener('focus',draw);canvas.addEventListener('blur',draw);
    const onHidden=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',onHidden);
    window.addEventListener('pagehide',pause);loadPattern();
    // La vue du portfolio appelle ce nettoyage au changement de projet.
    return ()=>{pause();document.removeEventListener('visibilitychange',onHidden);window.removeEventListener('pagehide',pause);};
  }
  window.GameOfLife={nextGeneration,mount};
})();
