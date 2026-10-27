# Vazylis : Le Dernier Rempart

## Contexte

- Jeu mobile RPG 3D de farm infini, projet personnel de Hugo. Hugo n'est pas développeur.
- La référence complète du jeu est `docs/game-design.md`. Lis-le avant chaque étape. Si une demande le contredit, signale-le avant d'agir.
- Le développement suit la section « Plan de développement du prototype » de ce document, une étape à la fois.

## Façon de travailler avec Hugo

- Réponds en français, avec des mots simples, sans jargon. Quand un concept technique est utile, explique-le avec une image ou un petit schéma.
- Au début d'une étape : résume ton plan en quelques lignes et attends l'accord de Hugo s'il y a un choix important.
- À la fin d'une étape : résume ce qui a été fait, explique pas à pas comment tester sur l'iPhone, et liste ce qui reste ou ce qui pose question.
- Si Hugo doit faire une action lui-même (créer un compte, télécharger un pack, cliquer quelque part), guide-le pas à pas, un clic après l'autre.
- Fais des commits git réguliers avec des messages clairs en français, et pousse sur GitHub en fin d'étape.
- Reste dans le périmètre de l'étape en cours. Note les idées et améliorations hors périmètre dans `IDEES.md` au lieu de les coder.

## Cadre technique

- Babylon.js + TypeScript + Vite.
- Web app installable (PWA) : manifest, service worker, icônes, plein écran, portrait et paysage.
- Cible prioritaire : Safari sur iPhone. Performances mobiles : low-poly, peu d'objets dessinés à la fois, ombres simples, 60 images/seconde visées (30 minimum).
- Hébergement : GitHub Pages en HTTPS, déployé automatiquement par GitHub Actions.
- Architecture :
  - `src/game/` : logique du jeu (statistiques, combat, XP, loot, économie), indépendante de Babylon.js et testée avec Vitest ;
  - `src/render/` : affichage 3D (Babylon.js) ;
  - `src/ui/` : interface (bandeau, boutons, menus) ;
  - `src/config/` : toutes les valeurs d'équilibrage (taux, multiplicateurs, formules, temps de réapparition), commentées. Aucune valeur d'équilibrage en dur ailleurs.
- Le monde est découpé en zones, pour pouvoir plus tard ne charger que la zone courante et ses voisines.
- Sauvegarde : derrière une couche abstraite. D'abord locale, puis en ligne (Supabase) à l'étape 5.
- Le code doit rester compatible avec un futur emballage en app iOS (Capacitor) : pas d'API web exotique.

## Assets : règle absolue

- Uniquement des assets sous licence CC0 : Quaternius (https://quaternius.itch.io/), KayKit (https://kaylousberg.itch.io/) et Polyy (https://polyy.ai). Jamais d'asset payant ni d'asset qui exige de créditer son auteur. Toute autre source doit être signalée à Hugo avant utilisation.
- Chaque pack utilisé est noté dans `ASSETS.md` (nom, source, licence).
- Si un téléchargement est impossible depuis ton environnement, demande à Hugo de télécharger le pack et de le déposer dans `assets/`, en le guidant pas à pas.
- Si aucun modèle CC0 ne convient, utilise un modèle provisoire simple (formes de base) et note-le dans `ASSETS.md`.

## Règle d'originalité

- Le jeu s'inspire d'ambiances (Flyff, World of Warcraft, Warhammer, Metin2, Dofus), sans jamais reprendre de noms, personnages, monstres signature, symboles, logos, designs identifiables ou textes.
- Tous les noms et designs du jeu sont originaux, comme définis dans `docs/game-design.md`.

## À ne jamais faire sans l'accord de Hugo

- Souscrire ou configurer un service payant.
- Supprimer des fichiers ou réécrire l'historique git.
- Changer une décision du document de game design.
