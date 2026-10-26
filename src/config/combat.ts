// Combat du joueur. Les vraies formules (statistiques) sont dans src/game/stats.ts.
// Les armes arriveront à l'étape 4 : "vitesse de base de l'arme" est pour l'instant un
// temps de coup fixe, et "dégâts de l'arme" une petite valeur à mains nues (voir config/stats.ts).
// Voir docs/game-design.md, section "Formules de combat".

export const PLAYER_COMBAT = {
  /** Un coup toutes les X secondes avant bonus de vitesse d'attaque (Agilité). */
  attackIntervalSeconds: 1,
  /** Distance à laquelle le personnage peut frapper un monstre. */
  attackRange: 1.8,
};

export const PLAYER_HEALTH = {
  base: 200,
  perLevel: 15,
};
