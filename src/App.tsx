import { useState, useRef, useCallback } from "react";
import { PlayerPanda } from "./components/scene/PlayerPanda";
import { TargetPanda } from "./components/scene/TargetPanda";
import { FaceControls } from "./components/controls/FaceControls";
import Timer from "./components/ui/Timer";
// Utility functions for generating random faces and scoring similarity
import { randomFace, scoreMatch } from "./utils/faceUtils";
// Type definitions
import type { BlendshapeValues } from "./types/blendshape";
import "./App.css";
import Button from "./components/ui/Button";
import { useGameStore } from "./store/gameStore";
import GameResultModal from "./components/ui/GameResultModal";
import styles from "./App.module.css";
import { SceneLayout } from "./components/scene/SceneLayout";
import { defaultSceneConfig } from "./config/sceneConfig";

export default function App() {
  // Global game state from Zustand store
  const phase = useGameStore((state) => state.phase);
  const startGame = useGameStore((state) => state.startGame);
  const finishGame = useGameStore((state) => state.finishGame);
  const exitGame = useGameStore((state) => state.exitGame);

  const [sceneConfig, setSceneConfig] = useState(defaultSceneConfig);

  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>(
    {} as BlendshapeValues,
  );

  // Target facial expression the player should match
  const [target, setTarget] = useState<BlendshapeValues>(
    {} as BlendshapeValues,
  );

  // Current score
  const [score, setScore] = useState<number | null>(null);

  // Used to force-reset FaceControls
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics/spring animation settings for panda face movement
  const [springConfig, setSpringConfig] = useState({
    stiffness: 100,
    damping: 12,
    mass: 1,
  });

  const yOffset = -0.25 + (target.Mouth_Down ?? 0) * 0.35;
  const zOffset =
    0 + ((target.L_Cheek_Down || target.R_Cheek_Right) ?? 0) * -0.1;

  // Refs allow access to latest values inside callbacks without stale closures
  const blendshapesRef = useRef(blendshapes);
  const targetRef = useRef(target);

  // Keep refs updated every render
  blendshapesRef.current = blendshapes;
  targetRef.current = target;

  // Used to trigger target spin animation
  const [targetSpinTrigger, setTargetSpinTrigger] = useState(0);
  // Spin animation settings
  const TARGET_SPIN_START_DEGREES = -720;
  const TARGET_SPIN_DURATION_MS = 1200;

  // Resets player face and temporarily increases spring animation intensity
  const handleReset = () => {
    setResetTrigger((v) => v + 1);
    // Stronger "bounce" animation after reset
    setSpringConfig({ stiffness: 180, damping: 8, mass: 1.4 });
    // Return to normal spring settings after 1.5 seconds
    setTimeout(() => {
      setSpringConfig({ stiffness: 100, damping: 12, mass: 1 });
    }, 1500);
  };

  // Called when timer finishes or score button pressed
  const handleGameComplete = useCallback(() => {
    // Compare player face against target face
    const finalScore = scoreMatch(targetRef.current, blendshapesRef.current);

    setScore(finalScore);

    // Placeholder reward token until backend API exists
    setRewardToken("Token will appear here from API later");

    // Update global game state
    finishGame(finalScore);
  }, [finishGame]);

  // Generates a fresh target and resets score
  const handlePlayAgain = () => {
    const newTarget = randomFace();

    setTarget(newTarget);
    targetRef.current = newTarget;

    setScore(null);
  };

  // Exit game and clear score
  const handleExitGame = useCallback(() => {
    setScore(null);
    exitGame();
  }, [exitGame]);

  return (
    <main>
      {/* <ApiTest /> */}
      {phase === "finished" && (
        <GameResultModal
          score={score}
          token={rewardToken}
          onExit={handleExitGame}
        />
      )}

      <div className="scene-wrapper">
        <div className="gameplay-frame">
          {/* PANDA INTERACTION AREA */}
          <div className="panda-stage">
            <SceneLayout
              config={sceneConfig}
              setConfig={setSceneConfig}
              // debug
              className="main-canvas"
            >
              <PlayerPanda values={blendshapes} springConfig={springConfig} />
            </SceneLayout>

            <FaceControls
              onBlendshapesChange={setBlendshapes}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* UI OVERLAY */}
          <div className="overlay-ui">
            <div className="top-bar">
              <Timer
                duration={10}
                isRunning={phase === "playing"}
                onComplete={handleGameComplete}
              />
            </div>

            <div className={styles.targetWindow}>
              <h1 className={styles.windowText}>TARGET</h1>

     <div className={styles.targetCanvasWrapper}>
  <div className={styles.targetBackground} />

  <SceneLayout
    config={sceneConfig}
    background={null}
    cameraOverride={{
      y: sceneConfig.camera.y * 1.1,
      z: sceneConfig.camera.z * 0.65,
    }}
  >
    <group position={[0, yOffset, zOffset]}>
      <TargetPanda
        values={target}
        spinTrigger={targetSpinTrigger}
        spinStartDegrees={TARGET_SPIN_START_DEGREES}
        spinDurationMs={TARGET_SPIN_DURATION_MS}
        onSpinCovered={() => setTarget(randomFace())}
      />
    </group>
  </SceneLayout>
</div>
            </div>

            <div className="bottom-controls">
              <Button
                onClick={() => {
                  const newTarget = randomFace();
                  setTarget(newTarget);
                  targetRef.current = newTarget;
                  setScore(null);
                  setTargetSpinTrigger((v) => v + 1);
                  startGame();
                }}
              >
                Play
              </Button>

              <Button
                onClick={() => console.log("clicked tutorial")}
                variant="secondary"
              >
                Tutorial
              </Button>

              <Button onClick={handleGameComplete}>Score</Button>

              <Button onClick={handleReset}>Reset</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}