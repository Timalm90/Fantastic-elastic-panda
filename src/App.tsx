import { useState, Suspense, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { PlayerPanda } from "./components/scene/PlayerPanda";
import { TargetPanda } from "./components/scene/TargetPanda";
import { FaceControls } from "./components/controls/FaceControls";
// import { SceneDebugController } from "./components/debug/SceneDebugController"; //Uncomment to enable interactive debug panel for lights, camera, and environment
import { ApiTest } from "./dev/ApiTest";
import Timer from "./components/ui/Timer";
import { randomFace, scoreMatch } from "./utils/faceUtils";
import type { BlendshapeValues } from "./types/blendshape";
import type { AmbientLight, PointLight } from "three";
import "./App.css";
import Button from "./components/ui/Button";
import { useGameStore } from "./store/gameStore";
import GameResultModal from "./components/ui/GameResultModal";
import styles from "./App.module.css";

export default function App() {
  const phase = useGameStore((state) => state.phase);
  const startGame = useGameStore((state) => state.startGame);
  const finishGame = useGameStore((state) => state.finishGame);
  const exitGame = useGameStore((state) => state.exitGame);

  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>(
    {} as BlendshapeValues,
  );
  const [target, setTarget] = useState<BlendshapeValues>(
    {} as BlendshapeValues,
  );
  const [score, setScore] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [springConfig, setSpringConfig] = useState({
    stiffness: 100,
    damping: 12,
    mass: 1,
  });

  const yOffset = -0.25 + (target.Mouth_Down ?? 0) * 0.25;
  const zOffset =
    0 + ((target.L_Cheek_Down || target.R_Cheek_Right) ?? 0) * -0.1;

  const blendshapesRef = useRef(blendshapes);
  const targetRef = useRef(target);

  blendshapesRef.current = blendshapes;
  targetRef.current = target;

  const [envIntensity, _setEnvIntensity] = useState(0.1);
  const [envBlur, _setEnvBlur] = useState(0.7);
  const [envRotation, _setEnvRotation] = useState(-3.1);
  const [cameraX, _setCameraX] = useState(0);
  const [cameraY, _setCameraY] = useState(-2.2);
  const [cameraZ, _setCameraZ] = useState(5.4);
  const [cameraFov, _setCameraFov] = useState(56);
  const [rotationX, _setRotationX] = useState(0.2);
  const [light1Color, _setLight1Color] = useState("#0450d5");
  const [light2Color, _setLight2Color] = useState("#d63404");
  const [light3Color, _setLight3Color] = useState("#ffbd8f");
  const ambientLightRef = useRef<AmbientLight>(null!);
  const pointLight1Ref = useRef<PointLight>(null!);
  const pointLight2Ref = useRef<PointLight>(null!);
  const pointLight3Ref = useRef<PointLight>(null!);

  const [targetSpinTrigger, setTargetSpinTrigger] = useState(0);
  const TARGET_SPIN_START_DEGREES = -720;
  const TARGET_SPIN_DURATION_MS = 1200;

  function handleNewTarget() {
    setScore(null);
    setTargetSpinTrigger((value) => value + 1);
  }

  const handleReset = () => {
    setResetTrigger((v) => v + 1);
    setSpringConfig({ stiffness: 180, damping: 8, mass: 1.4 });
    setTimeout(() => {
      setSpringConfig({ stiffness: 100, damping: 12, mass: 1 });
    }, 1500);
  };

  const handleGameComplete = useCallback(() => {
    const finalScore = scoreMatch(targetRef.current, blendshapesRef.current);
    setScore(finalScore);
    finishGame(finalScore);
  }, [finishGame]);

  const handlePlayAgain = () => {
    const newTarget = randomFace();
    setTarget(newTarget);
    targetRef.current = newTarget;
    setScore(null);
  };

  const handleExitGame = useCallback(() => {
    setScore(null);
    exitGame();
  }, [exitGame]);

  return (
    <main>

      {/* <div className="UI-Debug">
        <button onClick={handleNewTarget}>New Target</button>
        <button onClick={() => setScore(scoreMatch(target, blendshapes))}>
          Score
        </button>
        <div style={{ marginTop: 8 }}>Score: {score ?? "-"}</div>
      </div> */}

      <ApiTest />
      {phase === "finished" && (
        <GameResultModal score={score} onExit={handleExitGame} />
      )}

<div className="scene-wrapper">
  <div className="gameplay-frame">

  {/* PANDA INTERACTION AREA */}
  <div className="panda-stage">

    <Canvas
      className="main-canvas"
      camera={{
        position: [cameraX, -2.7, cameraZ],
        fov: cameraFov,
        rotation: [rotationX, 0, 0],
      }}
      gl={{
        antialias: true,
        alpha: true,
      }}
      dpr={[1, 2]}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0)
        scene.background = null
      }}
    >
      <Suspense fallback={null}>
        <ambientLight ref={ambientLightRef} intensity={3} />

        <pointLight
          ref={pointLight1Ref}
          color={light1Color}
          position={[0, 4, -4.5]}
          intensity={308}
        />

        <pointLight
          ref={pointLight2Ref}
          color={light2Color}
          position={[0, -6.5, -8.5]}
          intensity={378}
        />

        <pointLight
          ref={pointLight3Ref}
          color={light3Color}
          position={[0, 7, 11]}
          intensity={484}
        />

        <PlayerPanda
          values={blendshapes}
          springConfig={springConfig}
        />

        <Environment
          preset="apartment"
          blur={envBlur}
          resolution={64}
          environmentIntensity={envIntensity}
          environmentRotation={[0, envRotation, 0]}
        />
      </Suspense>
    </Canvas>

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

      <Canvas
        camera={{
          position: [cameraX, cameraY, cameraZ * 0.65],
          fov: cameraFov,
          rotation: [rotationX, 0, 0],
        }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#53518d")
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={3} />

          <pointLight
            color={light1Color}
            position={[0, 4, -4.5]}
            intensity={308}
          />

          <pointLight
            color={light2Color}
            position={[0, -6.5, -8.5]}
            intensity={378}
          />

          <pointLight
            color={light3Color}
            position={[0, 7, 11]}
            intensity={484}
          />

          <group position={[0, yOffset, zOffset]}>
            <TargetPanda
              values={target}
              spinTrigger={targetSpinTrigger}
              spinStartDegrees={TARGET_SPIN_START_DEGREES}
              spinDurationMs={TARGET_SPIN_DURATION_MS}
              onSpinCovered={() => setTarget(randomFace())}
            />
          </group>
        </Suspense>
      </Canvas>
    </div>

    <div className="bottom-controls">
      <Button
        onClick={() => {
          const newTarget = randomFace()
          setTarget(newTarget)
          targetRef.current = newTarget
          setScore(null)
          startGame()
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

      <Button onClick={handleGameComplete}>
        Score
      </Button>

      <Button onClick={handleReset}>
        Reset
      </Button>
    </div>
</div>
  </div>
</div>
</main>
  );
}
