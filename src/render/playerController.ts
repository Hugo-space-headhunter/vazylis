import { Engine, FollowCamera, Scene, Vector3 } from "@babylonjs/core";
import { PLAYER_MOVEMENT } from "../config/player";
import type { Joystick } from "../ui/joystick";
import type { LoadedCharacter } from "./character";

function shortestAngleLerp(from: number, to: number, factor: number): number {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * factor;
}

/**
 * Fait avancer le personnage selon le joystick, le fait pivoter pour suivre sa direction,
 * et joue l'animation de marche ou de repos.
 */
export function createPlayerController(
  scene: Scene,
  engine: Engine,
  character: LoadedCharacter,
  camera: FollowCamera,
  joystick: Joystick,
): void {
  const idle = character.animations["Idle_Loop"];
  const walk = character.animations["Walk_Loop"];
  idle?.start(true);
  let currentlyWalking = false;

  scene.onBeforeRenderObservable.add(() => {
    const deltaSeconds = engine.getDeltaTime() / 1000;
    const direction = joystick.getDirection();
    const isMoving = Math.abs(direction.x) > 0.05 || Math.abs(direction.y) > 0.05;

    if (isMoving) {
      const forward = character.root.position.subtract(camera.position);
      forward.y = 0;
      forward.normalize();
      const right = Vector3.Cross(Vector3.Up(), forward);

      const moveDirection = forward.scale(direction.y).add(right.scale(direction.x));
      moveDirection.normalize();

      character.root.position.addInPlace(moveDirection.scale(PLAYER_MOVEMENT.speed * deltaSeconds));

      const targetRotationY = Math.atan2(moveDirection.x, moveDirection.z);
      character.root.rotation.y = shortestAngleLerp(
        character.root.rotation.y,
        targetRotationY,
        Math.min(1, PLAYER_MOVEMENT.turnSpeed * deltaSeconds),
      );
    }

    if (isMoving !== currentlyWalking) {
      currentlyWalking = isMoving;
      if (isMoving) {
        idle?.stop();
        walk?.start(true);
      } else {
        walk?.stop();
        idle?.start(true);
      }
    }
  });
}
