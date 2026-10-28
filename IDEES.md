# Idées

Notes et améliorations hors périmètre de l'étape en cours, à reprendre plus tard.

- Le fichier JavaScript final fait environ 1,2 Mo compressé (Babylon.js complet). À surveiller pour le temps de chargement sur iPhone : on pourra n'importer que les briques de Babylon.js réellement utilisées (import plus précis) une fois qu'on connaît tous les besoins (particules, physique, etc.).
- La bibliothèque d'animations (`locomotion.glb`) fait environ 7,3 Mo et contient 41 animations alors qu'on n'en utilise que 2 pour l'instant (repos, marche). On pourra la retailler pour ne garder que les animations utilisées une fois le roster d'animations stabilisé (course, saut, combat...).
- Le personnage n'a pas encore de vêtements (corps de base nu/sous-vêtements) : normal pour cette étape, les habits arriveront avec l'équipement visible (étape 4), via le pack "Modular Character Outfits".
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
- **À refaire : la tenue des armes en main n'est toujours pas bonne**, malgré deux passages de réglage (`src/config/items.ts`, `gripPosition`/`gripRotationDeg`/`gripScale`). Les tests faits depuis l'ordinateur (caméra rapprochée, personnage homme, animation figée) avaient l'air corrects, mais Hugo voit encore un problème sur son iPhone en conditions réelles de jeu — probablement un détail qui ne se voit pas depuis les angles et la pose utilisés pour les tests. À reprendre lors d'un passage de réglages dédié en fin de projet, en testant directement sur iPhone en conditions de jeu normales (caméra par défaut, personnage qui bouge, les deux genres).
- Toutes les armes de corps à corps (dagues, épée 2 mains, hache 2 mains, épée et bouclier) partagent la même animation de coup ("Sword_Attack") : un seul mouvement de base dans la bibliothèque d'animations, pas de variante par arme ni de vrai enchaînement de coups (combo). L'Arc garde "Punch_Cross" faute d'animation de tir disponible.
- Le sac à dos (30 cases) ne prévient pas quand il est plein : un item qui tombe alors que le sac est plein est simplement perdu, sans message. À corriger si ça arrive souvent en jouant.
- Le recyclage ne donne encore ni or ni matériaux (l'économie et les ressources arrivent à l'étape 7) : pour l'instant, recycler détruit juste l'item.
- "Ignore 15 % de la défense adverse" (particularité de la hache à deux mains) n'a pas d'effet pour l'instant, car les monstres n'ont pas de défense dans le prototype.
- Les modèles d'armes ajoutent environ 12 Mo (pas encore compressés comme les textures des personnages à l'étape 1) : à optimiser si le chargement devient trop long sur iPhone.

### Étape 5 — sauvegarde en ligne

- Dès qu'une sauvegarde existe, l'écran "Homme/Femme" n'apparaît plus : impossible de recommencer une nouvelle partie ou de changer de genre sans vider soi-même la sauvegarde (dans les réglages de Safari, ou via un futur bouton "Nouvelle partie"). À ajouter plus tard si Hugo veut tester les deux genres facilement.
- Pas de message à l'écran si la sauvegarde en ligne échoue (pas de réseau, Supabase indisponible) : le jeu continue normalement grâce à la sauvegarde locale, mais Hugo ne voit aucune indication que la synchronisation en ligne a un problème.

### Étape 6 — zone 1 complète (1/4 : mécanismes communs)

- **Vazylis** n'est pour l'instant qu'un simple puits de pierre sur une petite place, en attendant un vrai décor de village (prévu "simple pour l'instant" par Hugo, à détailler en finition).
- **Pomelin Royal** (sous-boss) est juste un Pomelin plus gros et plus résistant : sa capacité spéciale "invoque des Pomelins" décrite dans le document de design n'est pas encore codée. À ajouter si ça manque en jouant.
- Le **mode AFK** fait marcher le personnage en ligne droite vers le monstre le plus proche (même limite que le déplacement des monstres agressifs, voir plus haut) : pas de recherche de chemin, il peut rester bloqué contre un obstacle. Pas de filtre de recyclage automatique non plus pour l'instant (prévu dans le document de design pour éviter que le sac se remplisse en AFK) : pour l'instant, le butin s'accumule normalement, sans vidage automatique.
- Les **monstres champions** (1 sur 200) sont testés par la logique (tests automatisés) mais pas encore vus en jeu sur iPhone, vu leur rareté : à surveiller la première fois que Hugo en croise un (taille, aura orange, butin).
- Les 2 sous-zones restantes (Ruines du Guet, Lisière pourpre) utilisent encore le même terrain nu que "Les Prés de Vazylis" : pas de décor pour l'instant, ça viendra avec leurs propres monstres (prochains morceaux de l'étape 6).

### Étape 6 — zone 1 complète (2/4 : Le Bois des Lucioles)

- Pas de modèle CC0 trouvé littéralement nommé "gobelin" : le Gobelin chapardeur et le Gobelin chaman réutilisent deux créatures du pack "Ultimate Monsters" (Monkroose, Tribal) choisies pour leur ressemblance (oreilles, masque à plumes), voir `ASSETS.md`. À remplacer si un vrai modèle de gobelin CC0 est trouvé plus tard.
- Le **Gobelin chaman** "attaque à distance" en jouant simplement l'animation de coup de poing avec une grande portée : pas de vraie boule verte qui vole jusqu'au joueur (pas de système de projectile pour l'instant).
- La **Ronce-gueule** et la **Gueule-Fleur** sont immobiles (comme prévu dans le document de design), mais elles ne se défendent qu'une fois touchées une première fois (comme le Cochonnet/Corbac) : impossible de se faire surprendre en marchant dessus sans les avoir attaquées.

### Pause fluidité et rendu (après l'étape 6, 2/4)

Hugo a signalé des personnages tout blancs/un sol tout noir sur iPhone, un déplacement "robotique", et a demandé un décor minimal pour s'y retrouver. Corrigé :
- **Cause du rendu blanc/noir** : les modèles importés (glTF) utilisent des matériaux PBR, qui ont besoin d'une texture d'environnement (reflets du ciel) pour s'éclairer correctement. On n'en charge pas (pour rester léger et jouable hors ligne), donc sans ce réglage les faces éclairées partent en blanc et les faces à l'ombre tombent au noir : on ne voit plus que des silhouettes. Remplacé par des matériaux simples (`src/render/materialUtils.ts`), qui s'éclairent correctement avec juste la lumière de la scène et coûtent aussi moins cher à afficher.
- **Le sol s'arrêtait à 40×40 unités autour de Vazylis**, alors que Le Bois des Lucioles est bien au-delà (jusqu'à x=35) : en s'y rendant, le joueur marchait dans le vide (fond noir de la scène). Le sol a été agrandi pour couvrir les deux sous-zones.
- **Transitions d'animation saccadées** (repos/marche/attaque) : un vrai fondu est maintenant activé (`src/render/animationUtils.ts`), pour un mouvement plus humain.
- **Bug découvert en même temps** : l'animation d'attaque de la Ronce-gueule/Gueule-Fleur ("Bite_Front") ne se déclenchait jamais, à cause d'un bout de code qui raccourcissait les noms d'animation pensé pour le Pomelin (format "Armature|Slime_Attack") et qui coupait les noms à rallonge des autres monstres. Corrigé.
- **Décor du Bois des Lucioles** : sol plus vert et quelques sapins simples tout autour de la clairière, pour distinguer la sous-zone des Prés de Vazylis. Toujours des formes de base (voir ASSETS.md), un vrai décor de forêt viendra en finition.
- **Déplacement du joueur** : accélération progressive au départ (`PLAYER_MOVEMENT.accelerationSpeed`) plutôt qu'un démarrage instantané à pleine vitesse.
- **Important pour Hugo** : un "service worker" (qui permet de jouer hors ligne) peut garder une ancienne version du jeu en cache sur l'iPhone. Si après cette mise à jour le jeu a toujours l'air cassé ou pas à jour, il faut fermer complètement l'app (pas juste la mettre en arrière-plan) et la rouvrir, ou en dernier recours la supprimer de l'écran d'accueil et la réinstaller.
- **Pas de vrai enchaînement de coups (combo)** : une seule animation de coup d'épée existe dans la bibliothèque. Un vrai système de combo (plusieurs mouvements qui s'enchaînent) demanderait d'autres animations, à chercher plus tard si Hugo le souhaite.
