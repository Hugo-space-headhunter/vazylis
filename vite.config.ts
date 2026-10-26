import { defineConfig } from "vite";

// "base" doit correspondre au nom du dépôt GitHub pour que les liens
// fonctionnent une fois le jeu publié sur GitHub Pages (https://<pseudo>.github.io/vazylis/).
export default defineConfig({
  base: "/vazylis/",
  test: {
    environment: "node",
  },
});
