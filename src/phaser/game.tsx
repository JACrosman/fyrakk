import { useEffect } from "react";
import { GameRef } from "./gameRef";
import { Intermission } from "./scenes/intermission";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: Intermission,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 200 },
    },
  },
};

export interface PhaseGameConfig {
  start: () => void;
}


export function PhaserGame() {
  useEffect(() => {
    if (!GameRef.game) {
      GameRef.game = new Phaser.Game(config);
    }
  }, []);

  return <div></div>;
}
