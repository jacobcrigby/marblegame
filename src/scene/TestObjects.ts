import {
  Color3,
  CreateBox,
  CreateCylinder,
  Mesh,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Vector3,
  VertexData,
  type Scene,
} from "@babylonjs/core";
import { GameConfig } from "../config/GameConfig";

export class TestObjects {
  private readonly bodies: Mesh[] = [];

  constructor(private readonly scene: Scene) {
    this.spawnBox(new Vector3(-4, 1, 3), new Color3(0.8, 0.3, 0.3));
    this.spawnBox(new Vector3(-2.5, 1, 4.2), new Color3(0.3, 0.7, 0.4));
    this.spawnCylinder(new Vector3(4, 1, -3), new Color3(0.35, 0.5, 0.85));
    this.spawnCylinder(new Vector3(2.5, 1, -4.5), new Color3(0.85, 0.7, 0.3));
    this.spawnRamp(new Vector3(3, 0.4, 3), new Color3(0.6, 0.45, 0.75));
  }

  get meshes(): Mesh[] {
    return this.bodies;
  }

  private spawnBox(position: Vector3, color: Color3): void {
    const mesh = CreateBox("box", { size: 1.4 }, this.scene);
    mesh.material = this.material("boxMat", color);
    mesh.position.copyFrom(position);
    this.addBody(mesh, PhysicsShapeType.BOX);
  }

  private spawnCylinder(position: Vector3, color: Color3): void {
    const mesh = CreateCylinder("cylinder", { diameter: 1.3, height: 1.6 }, this.scene);
    mesh.material = this.material("cylinderMat", color);
    mesh.position.copyFrom(position);
    mesh.rotation.z = Math.PI / 2;
    this.addBody(mesh, PhysicsShapeType.CYLINDER);
  }

  private spawnRamp(position: Vector3, color: Color3): void {
    const mesh = this.buildWedge(3, 1.6, 3);
    const material = this.material("rampMat", color);
    material.backFaceCulling = false;
    mesh.material = material;
    mesh.position.copyFrom(position);
    this.addBody(mesh, PhysicsShapeType.CONVEX_HULL);
  }

  private buildWedge(width: number, height: number, depth: number): Mesh {
    const hw = width / 2;
    const hd = depth / 2;
    const positions = [
      -hw, 0, -hd,  hw, 0, -hd,  -hw, height, -hd,
      -hw, 0,  hd,  hw, 0,  hd,  -hw, height,  hd,
    ];
    const indices = [
      0, 2, 1,
      3, 4, 5,
      0, 1, 4, 0, 4, 3,
      2, 5, 4, 2, 4, 1,
      0, 3, 5, 0, 5, 2,
    ];
    const mesh = new Mesh("ramp", this.scene);
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.applyToMesh(mesh);
    mesh.createNormals(false);
    return mesh;
  }

  private material(name: string, color: Color3): PBRMaterial {
    const material = new PBRMaterial(name, this.scene);
    material.albedoColor = color;
    material.metallic = 0.05;
    material.roughness = 0.5;
    return material;
  }

  private addBody(mesh: Mesh, shape: PhysicsShapeType): void {
    new PhysicsAggregate(mesh, shape, {
      mass: GameConfig.objects.mass,
      friction: GameConfig.objects.friction,
      restitution: GameConfig.objects.restitution,
    }, this.scene);
    this.bodies.push(mesh);
  }
}
