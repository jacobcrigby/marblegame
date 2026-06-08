import {
  Color3,
  CreateSphere,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Vector3,
  type IPhysicsCollisionEvent,
  type Mesh,
  type Observable,
  type Scene,
} from "@babylonjs/core";
import { GameConfig } from "../config/GameConfig";

export class Marble {
  readonly mesh: Mesh;
  private readonly aggregate: PhysicsAggregate;

  constructor(private readonly scene: Scene) {
    const cfg = GameConfig.marble;
    this.mesh = CreateSphere("marble", { diameter: cfg.radius * 2, segments: 32 }, scene);
    this.mesh.material = this.buildMaterial();
    this.buildCore();

    this.aggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.SPHERE, {
      mass: cfg.mass,
      friction: cfg.friction,
      restitution: cfg.restitution,
    }, scene);
    this.aggregate.body.setCollisionCallbackEnabled(true);

    this.reset();
  }

  get collisions(): Observable<IPhysicsCollisionEvent> {
    return this.aggregate.body.getCollisionObservable();
  }

  reset(): void {
    const spawn = GameConfig.marble.spawn;
    this.aggregate.body.setLinearVelocity(Vector3.Zero());
    this.aggregate.body.setAngularVelocity(Vector3.Zero());
    this.mesh.position.set(spawn.x, spawn.y, spawn.z);
    this.aggregate.body.disablePreStep = false;
    this.scene.onAfterPhysicsObservable.addOnce(() => {
      this.aggregate.body.disablePreStep = true;
    });
  }

  private buildMaterial(): PBRMaterial {
    const cfg = GameConfig.marble;
    const material = new PBRMaterial("marbleMat", this.scene);
    material.metallic = 0;
    material.roughness = cfg.roughness;
    material.alpha = cfg.alpha;
    material.albedoColor = new Color3(cfg.tint.r, cfg.tint.g, cfg.tint.b);
    material.subSurface.isRefractionEnabled = true;
    material.subSurface.refractionIntensity = 1;
    material.subSurface.indexOfRefraction = cfg.indexOfRefraction;
    material.subSurface.tintColor = new Color3(cfg.tint.r, cfg.tint.g, cfg.tint.b);
    material.subSurface.tintColorAtDistance = cfg.radius * 2;
    return material;
  }

  private buildCore(): void {
    const cfg = GameConfig.marble.core;
    const core = CreateSphere("marbleCore", { diameter: cfg.radius * 2, segments: 16 }, this.scene);
    core.parent = this.mesh;
    core.isPickable = false;
    const material = new PBRMaterial("marbleCoreMat", this.scene);
    material.metallic = 0.4;
    material.roughness = 0.3;
    material.albedoColor = new Color3(cfg.color.r, cfg.color.g, cfg.color.b);
    material.emissiveColor = new Color3(cfg.emissive.r, cfg.emissive.g, cfg.emissive.b);
    core.material = material;
  }
}
