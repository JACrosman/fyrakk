import { Example } from "./scenes/intermission";

export const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: Example,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { x: 0, y: 200 }
      }
  }
};