# Idées

Notes et améliorations hors périmètre de l'étape en cours, à reprendre plus tard.

- Le fichier JavaScript final fait environ 1,2 Mo compressé (Babylon.js complet). À surveiller pour le temps de chargement sur iPhone : on pourra n'importer que les briques de Babylon.js réellement utilisées (import plus précis) une fois qu'on connaît tous les besoins (particules, physique, etc.).
- La bibliothèque d'animations (`locomotion.glb`) fait environ 7,3 Mo et contient 41 animations alors qu'on n'en utilise que 2 pour l'instant (repos, marche). On pourra la retailler pour ne garder que les animations utilisées une fois le roster d'animations stabilisé (course, saut, combat...).
- Le personnage n'a pas encore de vêtements (corps de base nu/sous-vêtements) : normal pour cette étape, les habits arriveront avec l'équipement visible (étape 4), via le pack "Modular Character Outfits".
- Transition d'animation un peu abrupte entre repos et marche (pas de fondu). À améliorer plus tard si ça se voit trop en jeu.
- Le Cochonnet de suie et le Corbac sont pour l'instant deux sphères sombres assez difficiles à distinguer l'une de l'autre. À remplacer dès qu'on trouve ou crée de vrais modèles.
- Un monstre tué disparaît immédiatement (pas d'animation de mort visible), pour rester simple et robuste. On pourrait la réactiver plus tard (le Pomelin a déjà une vraie animation de mort disponible).
- Pas de recherche de chemin (pathfinding) pour les monstres qui chargent : ils foncent en ligne droite vers le joueur, donc ils peuvent rester bloqués contre un obstacle. À revoir quand le terrain aura de vrais obstacles.
- Les monstres passifs touchés restent "engagés" (ils ripostent) jusqu'à leur mort, même si le joueur s'éloigne. Pas de désengagement après un délai pour l'instant.
- Hugo a déjà téléchargé des packs d'**armes** et de **décors de donjon** (Quaternius). Pas encore déposés dans `assets/quaternius/` ni utilisés : à reprendre aux étapes 4 (armes, butin) et 6/8 (décors de zone et de donjon). Penser à vérifier leur licence (CC0) à ce moment-là.
- Pas de parchemin de réinitialisation des statistiques pour l'instant (prévu "plus tard" dans le document de design) : une fois validés, les points ne peuvent plus être changés du tout dans le prototype.
- L'affinité d'arme (ex. +0,3 % de dégâts par point d'Agilité avec des dagues) n'est pas encore appliquée : elle arrivera avec les vraies armes à l'étape 4.
