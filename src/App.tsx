import { useEffect, useState } from "react";
import "./App.css";

import { PhaserGame } from "./phaser/game";
import { GameRef } from "./phaser/gameRef";
import {
  Intermission,
  IntermissionResults,
} from "./phaser/scenes/intermission";

import orbyRed from "./assets/orby-sm.png";
import orbyPurple from "./assets/orby-sm-shadow.png";

function App() {
  const [gameContainerMounted, setGameContainerMounted] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [selection, setSelection] = useState({
    text: "",
    icon: "",
    isRed: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<IntermissionResults | null>(null);

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
      const selection: string = (
        GameRef.game.scene.scenes[0] as Intermission
      ).generate({
        speed: 40,
        minOrbs: 10,
        maxOrbs: 15,
        showLabels,
        onSelection: (results) => {
          setIsRunning(false);
          setResults(results);
        },
        time: 4000,
      }); // Assuming the start method is defined in the first scene
      const isRed = selection.includes("O");
      setSelection({
        text: selection.replace(" O", "").replace(" P", ""),
        icon: isRed ? orbyRed : orbyPurple,
        isRed,
      });
      setIsRunning(true);
      setResults(null);
    }
  }

  const selectionColor = selection?.isRed
    ? "text-orange-500"
    : "text-purple-500";

  let resultText = "";
  let resultColor = "";
  let resultOrbIcon = "";
  let resultOrbColor = "";

  if (results) {
    resultOrbIcon = results.selected?.includes('O') ? orbyRed : orbyPurple;
    resultOrbColor = results.selected?.includes('O') ? 'text-orange-500' : 'text-purple-500';

    if (results.outOfTime) {
      resultText = "Out of Time!";
      resultColor = "text-red-500";
    } else if (results.win) {
      resultText = "Correct!";
      resultColor = "text-green-500";
    } else {
      resultText = "Wrong :(";
      resultColor = "text-red-500";
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-3 bg-black flex justify-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLabels"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />
          <label htmlFor="showLabels">Show Labels</label>
        </div>
      </div>
      {!!selection?.text && (
        <div
          className={
            "flex gap-2 absolute top-1/3 -translate-y-1/3 left-1/2 -translate-x-1/2 text-4xl font-bold bg-[#00000080] px-5 py-2 " +
            selectionColor
          }
        >
          <div>{selection.text}</div>
          <img src={selection.icon} width="42px" />
        </div>
      )}
      {!isRunning && !results && (
        <div className="fixed top-[48px] left-0 right-0 bottom-0 bg-[#00000080]">
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center flex flex-col gap-4">
            <button
              className="bg-black hover:bg-[#0e0e0e] text-white font-semibold py-3 px-4 text-4xl border border-gray-800 rounded shadow"
              onClick={startGame}
            >
              Start
            </button>
          </div>
        </div>
      )}

      {!!results && (
        <div className="fixed top-[48px] left-0 right-0 bottom-0 bg-[#00000080]">
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center flex flex-col gap-4">
            <div className={`text-8xl ${resultColor} bg-[#00000090] p-6 flex flex-col gap-4`}>
              {resultText}

              {!results.win && !!results.selected && (
                <div className="flex flex-col text-3xl justify-center">
                  <div>You selected</div>
                  <div className="flex gap-2 justify-center">
                    <div className={resultOrbColor}>{results.selected?.replace(' O', "").replace(' P', "")}</div>
                    <img src={resultOrbIcon} width="42px" />
                  </div>
                </div>
              )}
            </div>
            <button
              className="bg-black hover:bg-[#0e0e0e] text-white font-semibold py-3 px-4 text-3xl border border-gray-800 rounded shadow"
              onClick={startGame}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {gameContainerMounted && (
        <div id="game-container" className="flex-grow">
          <PhaserGame />
        </div>
      )}
    </div>
  );
}

export default App;
