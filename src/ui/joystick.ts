export interface JoystickDirection {
  /** Gauche (-1) à droite (+1). */
  x: number;
  /** Arrière (-1) à avant (+1). */
  y: number;
}

export interface Joystick {
  getDirection(): JoystickDirection;
  dispose(): void;
}

const BASE_SIZE = 100;
const KNOB_SIZE = 46;
const MAX_DISTANCE = BASE_SIZE / 2;

/**
 * Joystick flottant : apparaît là où le pouce touche l'écran, dans la zone donnée.
 */
export function createJoystick(zone: HTMLElement): Joystick {
  const base = document.createElement("div");
  base.className = "joystick-base";
  const knob = document.createElement("div");
  knob.className = "joystick-knob";
  base.appendChild(knob);
  base.style.display = "none";
  zone.appendChild(base);

  let activePointerId: number | null = null;
  let originX = 0;
  let originY = 0;
  let direction: JoystickDirection = { x: 0, y: 0 };

  function showAt(x: number, y: number) {
    originX = x;
    originY = y;
    base.style.left = `${x - BASE_SIZE / 2}px`;
    base.style.top = `${y - BASE_SIZE / 2}px`;
    base.style.display = "block";
    knob.style.transform = "translate(0px, 0px)";
  }

  function hide() {
    base.style.display = "none";
    direction = { x: 0, y: 0 };
  }

  function onPointerDown(event: PointerEvent) {
    if (activePointerId !== null) return;
    activePointerId = event.pointerId;
    showAt(event.clientX, event.clientY);
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;
    const dx = event.clientX - originX;
    // L'écran va vers le bas, mais "avant" doit correspondre à un glissement vers le haut.
    const dy = -(event.clientY - originY);
    const distance = Math.min(Math.hypot(dx, dy), MAX_DISTANCE);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * distance;
    const knobY = Math.sin(angle) * distance;
    knob.style.transform = `translate(${knobX}px, ${-knobY}px)`;
    direction = { x: knobX / MAX_DISTANCE, y: knobY / MAX_DISTANCE };
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    hide();
  }

  zone.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  return {
    getDirection: () => direction,
    dispose() {
      zone.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      base.remove();
    },
  };
}

export const JOYSTICK_SIZES = { BASE_SIZE, KNOB_SIZE };
