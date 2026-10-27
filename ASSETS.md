# Assets

Liste des packs utilisés dans le jeu (nom, source, licence).

## Modèles 3D

### Personnage (étape 1)

- **Universal Base Characters** — Quaternius (https://quaternius.com/packs/universalbasecharacters.html), licence CC0. Corps de base homme et femme, avec squelette (rig).
- **Universal Animation Library** (la première version, pas la "2") — Quaternius (https://quaternius.itch.io/), licence CC0. Animations compatibles avec le squelette ci-dessus : `Idle_Loop` (repos) et `Walk_Loop` (marche) sont utilisées pour l'instant. Le pack contient aussi `Jog_Fwd_Loop`, `Sprint_Loop`, `Sword_Attack`, `Jump_*`, etc., réutilisables plus tard pour la course, le combat ou les sauts.
- **Modular Character Outfits - Fantasy** — Quaternius, licence CC0. Téléchargé et disponible pour plus tard (habits/armures), pas encore utilisé dans le jeu : à l'étape 1, le personnage porte son corps de base, sans vêtements. Les vêtements viendront avec l'équipement visible (étape 4).

Les packs sources téléchargés sont dans `assets/quaternius/` (non suivis par git, trop volumineux — voir `.gitignore`). Les fichiers réellement utilisés par le jeu sont dans `public/models/` :
- `public/models/characters/male/` et `.../female/` : le corps de base retravaillé (textures redimensionnées et compressées pour le mobile : environ 1,3 à 1,5 Mo par personnage au lieu de 15 Mo+ dans le pack d'origine).
- `public/models/animations/locomotion.glb` : la bibliothèque d'animations, copiée telle quelle (pas de perte de qualité sur les animations).

### Monstres (étape 2)

- **Monster Pack Animated** — Quaternius (https://quaternius.itch.io/), licence CC0 (confirmée sur la page du pack : https://creativecommons.org/publicdomain/zero/1.0/). Contient Bat, Dragon, Skeleton et **Slime**, avec animations (attaque, mort, repos, marche). Fourni en FBX/OBJ/Blend (pas de glTF) : converti en `.glb` avec l'outil `fbx2gltf` pour pouvoir le charger dans Babylon.js.
  - Le **Slime** est utilisé pour le **Pomelin** (boule qui charge le joueur) : `public/models/monsters/pomelin/slime.glb`.
  - Bat, Dragon et Skeleton ne sont pas encore utilisés, mais pourront servir plus tard (par exemple pour les chauves-souris de la zone 2 ou les squelettes de la zone 3).
- **Cochonnet de suie** et **Corbac** : aucun modèle CC0 trouvé chez Quaternius ou KayKit pour l'instant. Formes provisoires simples (sphères), générées dans `src/render/monster.ts`, en attendant un modèle adapté.
- Pack écarté : **Bestiary - Dungeon Monsters Kit** (Quaternius) — téléchargé mais non utilisé, car il est sous licence « Quaternius Asset License (QAL) » (pas CC0) et ne contient aucune animation.

### Armes (étape 4)

- **3D Fantasy Weapons Pack (version "low", basse définition)** — Polyy (https://polyy.ai), licence CC0 (confirmée dans `LICENSE.txt` du pack). 25 armes fantasy, déjà en `.glb`, pensées pour mobile. Quatre sont utilisées pour l'instant :
  - **Paire de dagues** → `rogues_dagger_low.glb`
  - **Épée à deux mains** → `highland_claymore_low.glb`
  - **Hache à deux mains** → `twin_moon_battle_axe_low.glb`
  - **Épée et bouclier** → `knights_longsword_low.glb` (le bouclier n'a pas de modèle, voir IDEES.md)
  - L'**Arc** n'a pas de modèle CC0 disponible dans ce pack (uniquement des armes de mêlée) : pas de visuel pour l'instant, voir IDEES.md.
  - Fichiers dans `public/models/weapons/` (environ 12 Mo au total, pas encore optimisés comme les personnages — voir IDEES.md).
- **Armure** : pas encore de modèle visible par pièce (casque, plastron...). Le pack "Modular Character Outfits" (déjà téléchargé, voir plus haut) servira pour ça plus tard. Pour l'instant, l'armure n'apporte qu'un bonus de défense, sans changer l'apparence.

### Décors de donjon (plus tard)

- **KayKit Dungeon Pack 1.1 FREE** — KayKit (https://kaylousberg.itch.io/), licence CC0. Téléchargé et disponible pour les étapes 6/8 (décors de zone et de donjon), pas encore utilisé.

### Terrain de test (étape 0-1)

- `src/render/scene.ts` utilise des formes de base de Babylon.js (sol et quelques cubes-repères) comme décor provisoire, en attendant les vrais décors des zones (étape 6).

## Icône de l'application

- `public/icons/icon-source.svg` : icône originale créée pour ce projet (blason simple, sans référence à une œuvre existante). Déclinée en PNG (192, 512, 180, 32 px) dans `public/icons/`. Provisoire, à remplacer si une meilleure version est souhaitée.
