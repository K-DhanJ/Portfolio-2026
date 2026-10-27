// Vérifie les règles simultanées, les motifs connus et les limites de grille.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};vm.runInNewContext(fs.readFileSync('life.js','utf8'),context);
const next=context.window.GameOfLife.nextGeneration;
function grid(points,w=8,h=8){const g=new Uint8Array(w*h);points.forEach(([x,y])=>g[y*w+x]=1);return g;}
function equal(a,b){assert.deepEqual(Array.from(a),Array.from(b));}
const block=grid([[2,2],[3,2],[2,3],[3,3]]);equal(next(block,8,8),block);
const blinker=grid([[2,3],[3,3],[4,3]]),vertical=grid([[3,2],[3,3],[3,4]]);
equal(next(blinker,8,8),vertical);equal(next(vertical,8,8),blinker);
equal(next(grid([[3,3]]),8,8),grid([]));
let glider=grid([[2,1],[3,2],[1,3],[2,3],[3,3]]);for(let i=0;i<4;i++)glider=next(glider,8,8);
equal(glider,grid([[3,2],[4,3],[2,4],[3,4],[4,4]]));
const edge=grid([[0,0],[7,0],[0,7]],8,8);equal(next(edge,8,8),grid([]));
const original=grid([[2,3],[3,3],[4,3]]);next(original,8,8);equal(original,blinker);
console.log('Jeu de la vie : bloc stable, oscillateur, isolement, planeur, bords fermés et état précédent vérifiés.');
