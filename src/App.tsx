import { useState } from "react";
import { getRandomAircraft } from "./data/aircraftData";
import type { Aircraft } from "./types/aircraft";
import { GameScreen } from "./components/GameScreen";

function App() {
  const [target, setTarget] = useState<Aircraft>(() => getRandomAircraft());
  const [gameKey, setGameKey] = useState(0);

  function restart() {
    setTarget((current) => getRandomAircraft(current.id));
    setGameKey((current) => current + 1);
  }

  return (
    <div className="app-shell">
      <GameScreen key={gameKey} target={target} onRestart={restart} />
      <footer>
        <span>GUESSING PLANE · MVP</span>
        <span>本地题库 · 无账号 · 无联网依赖</span>
      </footer>
    </div>
  );
}

export default App;
