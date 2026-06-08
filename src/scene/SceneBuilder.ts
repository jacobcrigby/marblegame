import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  ReflectionProbe,
  Vector3,
  type AbstractMesh,
  type Scene,
} from "@babylonjs/core";
import { GameConfig } from "../config/GameConfig";

export class SceneBuilder {
  private readonly probe: ReflectionProbe;

  constructor(private readonly scene: Scene) {
    this.buildCamera();
    this.buildLights();
    this.probe = this.buildEnvironment();
  }

  reflect(meshes: AbstractMesh[]): void {
    for (const mesh of meshes) this.probe.renderList?.push(mesh);
  }

  private buildCamera(): void {
    const c = GameConfig.camera;
    const camera = new ArcRotateCamera(
      "camera",
      c.alpha,
      c.beta,
      c.radius,
      new Vector3(c.target.x, c.target.y, c.target.z),
      this.scene,
    );
    camera.fov = 0.7;
  }

  private buildLights(): void {
    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.55;
    ambient.groundColor = new Color3(0.1, 0.12, 0.16);

    const key = new DirectionalLight("key", new Vector3(-0.6, -1, 0.4), this.scene);
    key.intensity = 1.1;
    key.position = new Vector3(12, 20, -8);
  }

  private buildEnvironment(): ReflectionProbe {
    this.scene.environmentIntensity = 0.8;
    const probe = new ReflectionProbe("env", 256, this.scene);
    probe.refreshRate = 1;
    this.scene.environmentTexture = probe.cubeTexture;
    return probe;
  }
}
