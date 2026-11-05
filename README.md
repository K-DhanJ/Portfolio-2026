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
- `content-en.js` : version anglaise des 19 projets. Le bouton FR/EN conserve
  la page ouverte et mémorise la langue dans le navigateur. `?lang=en` fournit
  un lien direct vers la version anglaise. Les diapositives d'origine restent
  en français ; les deux versions du CV suivent la langue choisie.
- `life.js` et `life.css` : Jeu de la vie interactif intégré au projet informatique.
- `games/2048/` : moteur et interface en Python ; Brython 3.14.1 est fourni
  localement dans `vendor/` avec sa licence BSD. Le jeu est chargé uniquement
  lorsque sa page est ouverte.
- `assets/cv-kevidu-kussiyage.pdf` : CV français corrigé à partir du dernier document fourni.
- `assets/cv-kevidu-kussiyage-en.pdf` : traduction anglaise sur une page.
- `assets/cv-portrait.png` : portrait extrait du CV fourni pour les deux versions.
- `scripts/generate_cv_fr.py` et `scripts/generate_cv_en.py` : sources reproductibles des deux CV.
- `assets/` : images, vidéos et autres documents disponibles.
- `pages/` : redirections des anciennes adresses vers les nouvelles études.

Les fichiers de présentation contiennent des commentaires explicatifs.
Les versions précédentes restent récupérables dans l’historique Git.

L’Épopée Temporelle remplace le troisième projet de la sélection. Les visuels
WebP de `assets/epopee-temporelle/` proviennent du PDF fourni « Stratégie réseaux
sociaux », qui présente en réalité un workshop pour l’abbaye de Maubuisson.
Le PDF entier n’est pas publié : certaines pages d’enquête identifient des
personnes interrogées. Les liens Recnorec et Comp-AI-gnons redirigent vers le
nouveau projet. Les diapositives suivent l’enquête, le concept, la scénographie
et le parcours proposé ; elles s’agrandissent au clic.

## Aperçu local

Lancer `python -m http.server 4175` dans ce dossier puis ouvrir
http://127.0.0.1:4175/.

Vérifier les règles du Jeu de la vie avec `node tests/life.test.cjs`.
Vérifier le moteur du 2048 avec `python -B tests/test_2048.py`.

## Médias absents des sources initiales

`3d/video.avi`, `After/ExoVélo.mp4`, `Numix/Numix Portfolio.mp4`,
`poster/affiches.pdf` restent à fournir.
