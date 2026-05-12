import { useState, Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Model } from "./components/scene/PandaModel";
import { FaceControls } from "./components/controls/FaceControls";
import { SceneDebugController } from "./components/debug/SceneDebugController";
import { api } from "./api";
import { getIdentityTokenFromUrl } from "./utils/identityToken";
import type { IdentityUser } from "./api/types";
import Timer from "./components/ui/Timer";
import type { BlendshapeValues } from "./types/blendshape";
import type { AmbientLight, PointLight } from "three";

import "./App.css";
export default function App() {
  const [, setIdentityToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<IdentityUser | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>(
    {} as BlendshapeValues,
  );
  const [envIntensity, setEnvIntensity] = useState(0.1);
  const [envBlur, setEnvBlur] = useState(0.7);
  const [envRotation, setEnvRotation] = useState(-3.1); // single Y-axis value
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(-2.2);
  const [cameraZ, setCameraZ] = useState(5.4);
  const [cameraFov, setCameraFov] = useState(56);
  const [rotationX, setRotationX] = useState(0.2);
  const [light1Color, setLight1Color] = useState("#0450d5");
  const [light2Color, setLight2Color] = useState("#d63404");
  const [light3Color, setLight3Color] = useState("#ffbd8f");
  const ambientLightRef = useRef<AmbientLight>(null!);
  const pointLight1Ref = useRef<PointLight>(null!);
  const pointLight2Ref = useRef<PointLight>(null!);
  const pointLight3Ref = useRef<PointLight>(null!);

  useEffect(() => {
    async function loadIdentity(): Promise<void> {
      console.log("Starting identity load...");

      const token = getIdentityTokenFromUrl();
      console.log("Token:", token);

      if (!token) {
        console.log("No token found");
        setApiError("No Tivoli token found. Please enter from Tivoli.");
        return;
      }

      setIdentityToken(token);

      try {
        console.log("Calling API...");

        const identity = await api.getIdentity(token);

        console.log("API response:", identity);
        console.log("User:", identity.user);

        setPlayer(identity.user);
      } catch (error) {
        console.log("API error:", error);

        setApiError(
          "Your Tivoli session has expired. Please go back to Tivoli and try again.",
        );
      }
    }

    void loadIdentity();
  }, []);
  return (
    <main>
      <h1>Fantastic elastic panda</h1>

      {apiError && <p>{apiError}</p>}
      {player && <p>Welcome, {player.name}!</p>}
      <Timer />
      <div className="scene-wrapper">
        <Canvas
          camera={{
            position: [cameraX, cameraY, cameraZ],
            fov: cameraFov,
            rotation: [rotationX, 0, 0],
          }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <ambientLight ref={ambientLightRef} intensity={3} />
            <pointLight
              ref={pointLight1Ref}
              position={[0, 4, -4.5]}
              intensity={308}
            />
            <pointLight
              ref={pointLight2Ref}
              position={[0, -6.5, -8.5]}
              intensity={378}
            />
            <pointLight
              ref={pointLight3Ref}
              position={[0, 7, 11]}
              intensity={484}
            />
            <SceneDebugController
              ambientLightRef={ambientLightRef}
              pointLight1Ref={pointLight1Ref}
              pointLight2Ref={pointLight2Ref}
              pointLight3Ref={pointLight3Ref}
              cameraX={cameraX}
              cameraY={cameraY}
              cameraZ={cameraZ}
              cameraFov={cameraFov}
              setCameraX={setCameraX}
              setCameraY={setCameraY}
              setCameraZ={setCameraZ}
              setCameraFov={setCameraFov}
              rotationX={rotationX}
              setRotationX={setRotationX}
              envIntensity={envIntensity}
              envBlur={envBlur}
              setEnvIntensity={setEnvIntensity}
              setEnvBlur={setEnvBlur}
              envRotation={envRotation}
              setEnvRotation={setEnvRotation}
              light1Color={light1Color}
              setLight1Color={setLight1Color}
              light2Color={light2Color}
              setLight2Color={setLight2Color}
              light3Color={light3Color}
              setLight3Color={setLight3Color}
            />
            <Model
              blendshapes={blendshapes}
              springConfig={{ stiffness: 100, damping: 12, mass: 1 }}
              receiveShadow
              castShadow
            />
            <Environment
              preset="apartment"
              blur={envBlur}
              background
              resolution={64}
              environmentIntensity={envIntensity}
              environmentRotation={[0, envRotation, 0]}
              backgroundRotation={[0, envRotation, 0]}
            />
          </Suspense>
        </Canvas>
        <FaceControls onBlendshapesChange={setBlendshapes} />
      </div>
      {/* </div> */}
    </main>
  );
}
