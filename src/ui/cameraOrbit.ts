import type { FollowCamera } from "@babylonjs/core";
import { FOLLOW_CAMERA } from "../config/player";

export interface CameraOrbitControl {
  dispose(): void;
}

/**
 * Tourne la caméra autour du personnage avec un deuxième doigt (le premier sert au joystick).
 * Glisser horizontalement tourne autour du personnage, verticalement change la hauteur de vue.
 */
export function createCameraOrbitControl(zone: HTMLElement, camera: FollowCamera): CameraOrbitControl {
  const activePointers = new Set<number>();
  let orbitPointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;

  function onPointerDown(event: PointerEvent) {
    const isAdditionalFinger = activePointers.size >= 1;
    activePointers.add(event.pointerId);
    if (isAdditionalFinger && orbitPointerId === null) {
      orbitPointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== orbitPointerId) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    camera.rotationOffset = (camera.rotationOffset + dx * FOLLOW_CAMERA.rotationSensitivity + 360) % 360;
    camera.heightOffset = Math.min(
      FOLLOW_CAMERA.maxHeightOffset,
      Math.max(FOLLOW_CAMERA.minHeightOffset, camera.heightOffset - dy * FOLLOW_CAMERA.heightSensitivity),
    );
  }

  function onPointerUp(event: PointerEvent) {
    activePointers.delete(event.pointerId);
    if (event.pointerId === orbitPointerId) {
      orbitPointerId = null;
    }
  }

  zone.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  return {
    dispose() {
      zone.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    },
  };
}
