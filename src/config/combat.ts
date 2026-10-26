// Combat du joueur. Valeurs simplifiées et provisoires pour le prototype :
// les vraies formules avec arme et statistiques arrivent aux étapes 3 et 4.
// Voir docs/game-design.md, section "Formules de combat".

export const PLAYER_COMBAT = {
  /** Dégâts de base, avant tout bonus de niveau (en attendant les armes). */
  baseDamage: 8,
  /** Dégâts ajoutés par niveau, valeur provisoire avant les vraies formules d'armes. */
  damagePerLevel: 1.5,
  /** Un coup toutes les X secondes (vitesse d'arme réelle à l'étape 3). */
  attackIntervalSeconds: 1,
  /** Distance à laquelle le personnage peut frapper un monstre. */
  attackRange: 1.8,
  /** Chance de coup critique (valeur de départ du document de design). */
  critChance: 0.05,
  critMultiplier: 1.5,
};

export const PLAYER_HEALTH = {
  base: 100,
  perLevel: 15,
  // Le bonus de Vitalité n'est pas encore inclus : la répartition des points arrive à l'étape 3.
};
