import { readFileSync } from "node:fs";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin, NullEngine, Scene, Vector3 } from "@babylonjs/core";
import { GameConfig } from "../src/config/GameConfig";
import { Table } from "../src/scene/Table";
import { Marble } from "../src/scene/Marble";

const STEP = 1 / 60;

function step(scene: Scene, table: Table, count: number): void {
  const engine = scene.getPhysicsEngine()!;
  const advance = engine as unknown as { _step(delta: number): void };
  for (let i = 0; i < count; i++) {
    table.update();
    advance._step(STEP);
  }
}

function horizontal(p: Vector3): { x: number; z: number } {
  return { x: p.x, z: p.z };
}

async function main(): Promise<void> {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const wasmBinary = readFileSync(
    new URL("../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm", import.meta.url),
  );
  const havok = await HavokPhysics({ wasmBinary });
  scene.enablePhysics(new Vector3(0, GameConfig.gravityY, 0), new HavokPlugin(true, havok));

  const table = new Table(scene);
  const marble = new Marble(scene);

  step(scene, table, 120);
  const rest = horizontal(marble.mesh.position);

  const surface = table.meshes[0];
  surface.computeWorldMatrix(true);
  const flatQ = surface.absoluteRotationQuaternion.clone();
  const obstacle = table.meshes[table.meshes.length - 1];
  obstacle.computeWorldMatrix(true);
  const obstacleFlat = obstacle.getAbsolutePosition().clone();

  table.setTilt({ x: 1, z: 0 });
  step(scene, table, 150);

  surface.computeWorldMatrix(true);
  obstacle.computeWorldMatrix(true);
  const tiltedQ = surface.absoluteRotationQuaternion.clone();
  const obstacleTilted = obstacle.getAbsolutePosition().clone();
  const rolled = horizontal(marble.mesh.position);

  const tiltAngle = 2 * Math.acos(Math.min(1, Math.abs(tiltedQ.w)));
  const rollDist = Math.hypot(rolled.x - rest.x, rolled.z - rest.z);
  const obstacleShift = Vector3.Distance(obstacleFlat, obstacleTilted);
  const tiltChanged = Math.abs(tiltAngle - 2 * Math.acos(Math.min(1, Math.abs(flatQ.w))));

  const results = {
    tiltAngleRad: tiltAngle.toFixed(3),
    tiltHeld: tiltAngle > 0.15,
    marbleRolled: rollDist > 1.0,
    rollDist: rollDist.toFixed(2),
    obstacleRidesBoard: obstacleShift > 0.05,
    obstacleShift: obstacleShift.toFixed(2),
    marbleSettledY: marble.mesh.position.y.toFixed(2),
  };
  console.log(JSON.stringify(results, null, 2));

  const ok = results.tiltHeld && results.marbleRolled && results.obstacleRidesBoard && tiltChanged > 0.1;
  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
