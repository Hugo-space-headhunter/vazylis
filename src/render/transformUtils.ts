import type { TransformNode } from "@babylonjs/core";

/**
 * Les modèles importés (glTF) ont souvent une "rotationQuaternion" figée posée par l'outil
 * d'export. Tant qu'elle existe, Babylon.js l'utilise pour l'affichage et ignore complètement
 * `node.rotation` : on peut changer `.rotation.y` autant qu'on veut, rien ne bouge à l'écran.
 * Cette fonction convertit la rotation figée en rotation "normale" (Euler), sans changer
 * l'apparence du modèle, pour qu'on puisse ensuite le faire tourner avec `.rotation.y`.
 */
export function makeRotatable(node: TransformNode): void {
  if (node.rotationQuaternion) {
    node.rotation = node.rotationQuaternion.toEulerAngles();
    node.rotationQuaternion = null;
  }
}
