// Déplacement du personnage joueur. Valeurs provisoires, à régler en jouant.

export const PLAYER_MOVEMENT = {
  /** Vitesse de déplacement, en mètres par seconde. */
  speed: 3.2,
  /** Vitesse à laquelle le personnage pivote pour faire face à sa direction (plus grand = plus réactif). */
  turnSpeed: 12,
};

export const FOLLOW_CAMERA = {
  /** Distance horizontale derrière le personnage. */
  radius: 7,
  /** Hauteur de la caméra au-dessus du personnage. */
  heightOffset: 3.2,
  /** Angle de la caméra derrière le personnage, en degrés (0 = derrière). */
  rotationOffsetDegrees: 180,
};
