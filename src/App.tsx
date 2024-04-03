import { useEffect, useState } from "react";
import "./App.css";

import { PhaserGame } from "./phaser/game";
import { GameRef } from "./phaser/gameRef";
import { Intermission } from "./phaser/scenes/intermission";

function App() {
  const [gameContainerMounted, setGameContainerMounted] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    // Set game container mounted to true when component mounts
    setGameContainerMounted(true);

    // Clean up function to set game container mounted to false when component unmounts
    return () => {
      setGameContainerMounted(false);
    };
  }, []);

  function startGame() {
    // Access the Phaser game object from the ref and call the start method
    if (GameRef.game) {
      (GameRef.game.scene.scenes[0] as Intermission).generate({
        speed: 75,
        minOrbs: 10,
        maxOrbs: 15,
        showLabels,
      }); // Assuming the start method is defined in the first scene
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-3 bg-black flex justify-center gap-3">
        <button
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          onClick={startGame}
        >
          Start
        </button>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="showLabels" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} />
          <label htmlFor="showLabels">Show Labels</label>
        </div>
      </div>
      {gameContainerMounted && (
        <div id="game-container" className="flex-grow">
          <PhaserGame />
        </div>
      )}
    </div>
  );
}

export default App;
