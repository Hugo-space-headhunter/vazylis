# Idées

Notes et améliorations hors périmètre de l'étape en cours, à reprendre plus tard.

- Le fichier JavaScript final fait environ 1,2 Mo compressé (Babylon.js complet). À surveiller pour le temps de chargement sur iPhone : on pourra n'importer que les briques de Babylon.js réellement utilisées (import plus précis) une fois qu'on connaît tous les besoins (particules, physique, etc.).
- La bibliothèque d'animations (`locomotion.glb`) fait environ 7,3 Mo et contient 41 animations alors qu'on n'en utilise que 2 pour l'instant (repos, marche). On pourra la retailler pour ne garder que les animations utilisées une fois le roster d'animations stabilisé (course, saut, combat...).
- Caméra : actuellement, elle suit automatiquement le personnage sans qu'on puisse la tourner. Le document de design prévoit en option de la tourner avec un deuxième doigt — à ajouter plus tard si besoin.
- Le personnage n'a pas encore de vêtements (corps de base nu/sous-vêtements) : normal pour cette étape, les habits arriveront avec l'équipement visible (étape 4), via le pack "Modular Character Outfits".
- Transition d'animation un peu abrupte entre repos et marche (pas de fondu). À améliorer plus tard si ça se voit trop en jeu.
