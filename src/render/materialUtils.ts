import { AbstractMesh, PBRMaterial, StandardMaterial } from "@babylonjs/core";

/**
 * Les modèles importés (glTF) arrivent avec des matériaux PBR, qui ont besoin d'une
 * "texture d'environnement" (reflets du ciel) pour bien s'éclairer. On n'en charge pas,
 * pour rester léger et jouable hors ligne (voir CLAUDE.md), donc sans ce correctif les
 * modèles PBR apparaissent trop clairs côté lumière et trop sombres côté ombre : on ne
 * voit plus que des silhouettes, sans détail (signalé par Hugo sur iPhone).
 *
 * On remplace donc ces matériaux par des équivalents simples (StandardMaterial), qui
 * s'éclairent correctement avec juste la lumière de la scène, et qui sont aussi moins
 * coûteux à afficher sur mobile.
 */
export function simplifyMaterials(root: AbstractMesh): void {
  for (const mesh of root.getChildMeshes(false)) {
    const material = mesh.material;
    if (!(material instanceof PBRMaterial)) continue;

    const standard = new StandardMaterial(`${material.name}-standard`, mesh.getScene());
    standard.diffuseTexture = material.albedoTexture;
    standard.diffuseColor = material.albedoColor;
    standard.alpha = material.alpha;
    standard.backFaceCulling = material.backFaceCulling;
    // Rendu mat (sans reflet brillant) : plus proche de l'esthétique low-poly visée.
    standard.specularColor = material.albedoColor.scale(0.02);

    mesh.material = standard;
    material.dispose(false, false);
  }
}
