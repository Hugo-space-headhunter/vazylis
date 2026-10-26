import "./style.css";
import { createScene } from "./render/scene";
import { attachFpsCounter } from "./ui/fpsCounter";

const canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
const fpsElement = document.getElementById("fps-counter") as HTMLElement;

const { engine, scene } = createScene(canvas);
attachFpsCounter(engine, scene, fpsElement);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.error("Échec de l'enregistrement du service worker", error);
    });
  });
}
