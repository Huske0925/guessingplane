import { useState } from "react";
import { getRandomAircraft } from "./data/aircraftData";
import type { Aircraft } from "./types/aircraft";
import type { GameMode } from "./types/game";
import { GameScreen } from "./components/GameScreen";
import { ModeSelection } from "./components/ModeSelection";

function App() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [target, setTarget] = useState<Aircraft>(() => getRandomAircraft());
  const [gameKey, setGameKey] = useState(0);

  function restart() {
    setTarget((current) => getRandomAircraft(current.id));
    setGameKey((current) => current + 1);
  }

  return (
    <div className="app-shell">
      {mode ? (
        <GameScreen
          key={`${mode}-${gameKey}`}
          mode={mode}
          target={target}
          onRestart={restart}
          onReselectMode={() => setMode(null)}
        />
      ) : (
        <ModeSelection onSelect={setMode} />
      )}
      <footer>
        <span>GUESSING PLANE · MVP</span>
        <span>本地题库 · 无账号 · 无联网依赖</span>
      </footer>
    </div>
  );
}

export default App;
