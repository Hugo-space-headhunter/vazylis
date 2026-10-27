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
- Le décor de donjon (KayKit) reste à utiliser aux étapes 6/8.
- Pas de parchemin de réinitialisation des statistiques pour l'instant (prévu "plus tard" dans le document de design) : une fois validés, les points ne peuvent plus être changés du tout dans le prototype.

### Étape 4 — butin et inventaire

- Pas de vrai glisser-déposer pour équiper un item (choix de Hugo pour aller plus vite) : on touche un item, une fiche s'ouvre avec un bouton Équiper. Le glisser-déposer pourra être ajouté plus tard en finition.
- L'**Arc** n'a pas de modèle visible (aucune arme à distance dans le pack téléchargé) : il existe comme famille d'arme (stats, vitesse...) mais rien ne s'affiche en main. Pareil pour le **bouclier** de "épée et bouclier" (seule l'épée est visible).
- L'armure (casque, plastron...) n'a pas encore d'apparence sur le personnage : elle donne un bonus de défense, mais ne change rien visuellement. Le pack "Modular Character Outfits" déjà téléchargé permettra de l'ajouter plus tard.
- La position de l'arme dans la main est réglée à l'œil, arme par arme (`src/config/items.ts`, `gripPosition`/`gripRotationDeg`/`gripScale`), vérifiée en zoomant sur chacune : dagues, épée à deux mains, hache à deux mains et épée et bouclier tiennent maintenant correctement par le manche. Si une nouvelle arme est ajoutée plus tard, il faudra probablement refaire ce réglage à la main (chaque modèle du pack n'est pas orienté pareil).
- Les animations d'attaque sont réparties en 2 groupes faute de mieux : "Punch_Jab"/"Punch_Cross" pour les dagues et l'arc (pas d'animation de tir à l'arc disponible), "Sword_Attack" pour les 3 armes à lame/tranchantes (épée 2 mains, hache 2 mains, épée et bouclier) — pas d'animation différente pour chaque arme précise, juste 2 familles de mouvement.
- Le sac à dos (30 cases) ne prévient pas quand il est plein : un item qui tombe alors que le sac est plein est simplement perdu, sans message. À corriger si ça arrive souvent en jouant.
- Le recyclage ne donne encore ni or ni matériaux (l'économie et les ressources arrivent à l'étape 7) : pour l'instant, recycler détruit juste l'item.
- "Ignore 15 % de la défense adverse" (particularité de la hache à deux mains) n'a pas d'effet pour l'instant, car les monstres n'ont pas de défense dans le prototype.
- Les modèles d'armes ajoutent environ 12 Mo (pas encore compressés comme les textures des personnages à l'étape 1) : à optimiser si le chargement devient trop long sur iPhone.
