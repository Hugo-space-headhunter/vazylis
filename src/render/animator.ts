import type { AnimationGroup } from "@babylonjs/core";

export interface AnimatorKeys {
  idle: string;
  walk: string;
  attack?: string;
  death?: string;
}

export interface Animator {
  setMoving(isMoving: boolean): void;
  /** `animationName` permet de jouer une animation d'attaque différente selon l'arme équipée. */
  playAttack(onDone?: () => void, animationName?: string): void;
  playDeath(onDone?: () => void): void;
}

/**
 * Petite machine à états pour enchaîner repos / marche / attaque / mort sans faire jouer
 * deux animations en même temps sur le même personnage ou monstre.
 */
export function createAnimator(animations: Record<string, AnimationGroup>, keys: AnimatorKeys): Animator {
  let state: "idle" | "walk" | "once" | null = null;

  function loopNameFor(s: "idle" | "walk"): string {
    return s === "walk" ? keys.walk : keys.idle;
  }

  function stopCurrentLoop() {
    if (state === "idle" || state === "walk") {
      animations[loopNameFor(state)]?.stop();
    }
  }

  function playOnce(name: string | undefined, onDone?: () => void) {
    stopCurrentLoop();
    const group = name ? animations[name] : undefined;
    if (!group) {
      state = null;
      onDone?.();
      return;
    }
    state = "once";
    group.onAnimationGroupEndObservable.addOnce(() => {
      state = null;
      onDone?.();
    });
    group.start(false);
  }

  const animator: Animator = {
    setMoving(isMoving) {
      if (state === "once") return;
      const next: "idle" | "walk" = isMoving ? "walk" : "idle";
      if (next === state) return;
      stopCurrentLoop();
      state = next;
      animations[loopNameFor(next)]?.start(true);
    },
    playAttack(onDone, animationName) {
      playOnce(animationName ?? keys.attack, onDone);
    },
    playDeath(onDone) {
      playOnce(keys.death, onDone);
    },
  };

  animator.setMoving(false);
  return animator;
}
