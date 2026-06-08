import {
  Color3,
  CreateBox,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsMotionType,
  PhysicsShapeType,
  Scalar,
  TransformNode,
  Vector3,
  type AbstractMesh,
  type Mesh,
  type Scene,
} from "@babylonjs/core";
import { GameConfig } from "../config/GameConfig";
import type { TiltIntent } from "../input/TiltIntent";

export class Table {
  private readonly pivot: TransformNode;
  private readonly surfaces: Mesh[] = [];
  private targetTiltX = 0;
  private targetTiltZ = 0;

  constructor(private readonly scene: Scene) {
    this.pivot = new TransformNode("tablePivot", scene);
    const material = this.buildMaterial();
    this.buildSurface(material);
    this.buildWalls(material);
  }

  get meshes(): AbstractMesh[] {
    return this.surfaces;
  }

  setTilt(intent: TiltIntent): void {
    const max = GameConfig.table.maxTiltAngle;
    this.targetTiltX = intent.x * max;
    this.targetTiltZ = intent.z * max;
  }

  level(): void {
    this.targetTiltX = 0;
    this.targetTiltZ = 0;
  }

  update(): void {
    const lerp = GameConfig.table.tiltLerp;
    this.pivot.rotation.x = Scalar.Lerp(this.pivot.rotation.x, this.targetTiltX, lerp);
    this.pivot.rotation.z = Scalar.Lerp(this.pivot.rotation.z, this.targetTiltZ, lerp);
  }

  private buildMaterial(): PBRMaterial {
    const material = new PBRMaterial("tableMat", this.scene);
    material.albedoColor = new Color3(0.22, 0.24, 0.28);
    material.metallic = 0.1;
    material.roughness = 0.6;
    return material;
  }

  private buildSurface(material: PBRMaterial): void {
    const { size, thickness } = GameConfig.table;
    const surface = CreateBox("tableSurface", { width: size, depth: size, height: thickness }, this.scene);
    surface.material = material;
    this.attach(surface, new Vector3(0, -thickness / 2, 0));
  }

  private buildWalls(material: PBRMaterial): void {
    const { size, wallHeight, wallThickness } = GameConfig.table;
    const half = size / 2;
    const length = size + wallThickness;
    const y = wallHeight / 2;

    const configs: Array<{ pos: Vector3; w: number; d: number }> = [
      { pos: new Vector3(0, y, half), w: length, d: wallThickness },
      { pos: new Vector3(0, y, -half), w: length, d: wallThickness },
      { pos: new Vector3(half, y, 0), w: wallThickness, d: length },
      { pos: new Vector3(-half, y, 0), w: wallThickness, d: length },
    ];

    configs.forEach((cfg, i) => {
      const wall = CreateBox(`wall${i}`, { width: cfg.w, depth: cfg.d, height: wallHeight }, this.scene);
      wall.material = material;
      this.attach(wall, cfg.pos);
    });
  }

  private attach(mesh: Mesh, position: Vector3): void {
    mesh.position.copyFrom(position);
    mesh.parent = this.pivot;
    const aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, {
      mass: 0,
      friction: GameConfig.table.friction,
      restitution: GameConfig.table.restitution,
    }, this.scene);
    aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
    this.surfaces.push(mesh);
  }
}
