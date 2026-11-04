import { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { game } from '../core/GameManager';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useSave } from '../core/SaveSystem';
import { useGameUi } from '../core/store';
import { PROFILES } from '../render/quality';
import { ScentVisionSystem } from '../systems/scent/ScentVisionSystem';
import { CameraRig } from './CameraRig';
import { ExplorationScene } from './ExplorationScene';
import { PhysicsBridge } from './PhysicsBridge';
import { PostFX } from './PostFX';
import { EnvironmentRig, ViewBridge } from './SceneBridges';

/** Napędza GameManager.tick() tuż przed renderem (priorytet < 0). */
function GameLoop() {
  useFrame((_, delta) => game.tick(delta), -1);
  return null;
}

export function GameCanvas() {
  const quality = useSave((s) => s.data.settings.quality);
  const state = useGameUi((s) => s.state);
  const profile = PROFILES[quality];
  const showExploration = state === 'menu' || state === 'hub';

  return (
    <Canvas
      className="absolute inset-0"
      shadows="soft"
      dpr={profile.dpr}
      flat
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false, failIfMajorPerformanceCaveat: false }}
      onCreated={({ gl }) => {
        // błędy kompilacji shaderów (np. futro na GPU telefonu) trafiają na ekran zamiast zniknąć w konsoli
        gl.debug.onShaderError = (ctx, _program, vs, fs) => {
          const log = (ctx.getShaderInfoLog(vs) || '') + (ctx.getShaderInfoLog(fs) || '');
          window.__fadoReportError?.(`Shader: ${log.slice(0, 400)}`);
        };
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          window.__fadoReportError?.('Utracono kontekst WebGL (spróbuj niższej jakości)');
        });
      }}
      camera={{ fov: 42, near: 0.1, far: 400, position: [0, 5, 8] }}
    >
      <GameLoop />
      <ViewBridge />
      <EnvironmentRig />
      <Suspense fallback={null}>
        <Physics gravity={[0, -18, 0]} paused={state === 'paused'}>
          <PhysicsBridge />
          {showExploration ? (
            <ErrorBoundary label="Scena">
              <ExplorationScene profile={profile} />
            </ErrorBoundary>
          ) : null}
          <primitive object={game.root} />
        </Physics>
      </Suspense>
      <ErrorBoundary label="Psi Węch">
        <ScentVisionSystem />
      </ErrorBoundary>
      <CameraRig director={game.camera} />
      <ErrorBoundary label="Efekty">
        <PostFX profile={profile} director={game.camera} scent={game.scent} />
      </ErrorBoundary>
    </Canvas>
  );
}
