// Déplacement du personnage joueur. Valeurs provisoires, à régler en jouant.

export const PLAYER_MOVEMENT = {
  /** Vitesse de déplacement, en mètres par seconde. */
  speed: 3.2,
  /** Vitesse à laquelle le personnage pivote pour faire face à sa direction (plus grand = plus réactif). */
  turnSpeed: 12,
};

// Caméra en orbite autour du personnage (ArcRotateCamera) : elle ne suit que sa position,
// jamais sa rotation, pour qu'on voie bien le personnage tourner sur lui-même.
export const ORBIT_CAMERA = {
  /** Distance de la caméra au personnage. */
  radius: 8,
  /** Angle horizontal de départ, en radians (-PI/2 = derrière un personnage qui regarde vers +Z). */
  alpha: -Math.PI / 2,
  /** Angle vertical de départ, en radians (plus petit = vue plus plongeante). */
  beta: 1.15,
  /** Limites verticales atteignables en tournant la caméra avec un deuxième doigt. */
  minBeta: 0.5,
  maxBeta: 1.5,
  /** Radians de rotation horizontale par pixel glissé. */
  alphaSensitivity: 0.007,
  /** Radians de rotation verticale par pixel glissé. */
  betaSensitivity: 0.006,
};
