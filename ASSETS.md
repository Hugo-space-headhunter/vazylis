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

### Terrain de test (étape 0-1)

- `src/render/scene.ts` utilise des formes de base de Babylon.js (sol et quelques cubes-repères) comme décor provisoire, en attendant les vrais décors des zones (étape 6).

## Icône de l'application

- `public/icons/icon-source.svg` : icône originale créée pour ce projet (blason simple, sans référence à une œuvre existante). Déclinée en PNG (192, 512, 180, 32 px) dans `public/icons/`. Provisoire, à remplacer si une meilleure version est souhaitée.
