# Portfolio 2026 — Kevidu Kussiyage

Portfolio statique : ingénierie, design et usages.

## Publication

Le site est publié sur https://k-dhanj.github.io/Portfolio-2026/ depuis la branche
`main`, dossier racine. `.nojekyll` permet de servir directement les fichiers.

## Fichiers

- `index.html` : structure commune, navigation et dialogue d’agrandissement.
- `style.css` : charte sombre, verre, responsive et préférences de mouvement.
- `app.js` : navigation, cartes interactives et affichage des études de cas.
- `content.js` : textes et médias issus des 19 pages du portfolio précédent.
- `life.js` et `life.css` : Jeu de la vie interactif intégré au projet informatique.
- `games/2048/` : moteur et interface en Python ; Brython 3.14.1 est fourni
  localement dans `vendor/` avec sa licence BSD. Le jeu est chargé uniquement
  lorsque sa page est ouverte.
- `assets/` : CV, images, vidéos et documents disponibles.
- `pages/` : redirections des anciennes adresses vers les nouvelles études.

Les fichiers de présentation contiennent des commentaires explicatifs.
Les versions précédentes restent récupérables dans l’historique Git.

## Aperçu local

Lancer `python -m http.server 4175` dans ce dossier puis ouvrir
http://127.0.0.1:4175/.

Vérifier les règles du Jeu de la vie avec `node tests/life.test.cjs`.
Vérifier le moteur du 2048 avec `python -B tests/test_2048.py`.

## Médias absents des sources initiales

`3d/video.avi`, `After/ExoVélo.mp4`, `Numix/Numix Portfolio.mp4`,
`poster/affiches.pdf` restent à fournir.
