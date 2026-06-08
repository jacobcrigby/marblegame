export const GameConfig = {
  gravityY: -9.81,

  physics: {
    fixedTimeStepMs: 1000 / 60,
    maxLinearVelocity: 14,
    maxAngularVelocity: 60,
  },

  camera: {
    alpha: -Math.PI / 2,
    beta: Math.PI / 3.4,
    fov: 0.7,
    frameExtent: 10.5,
    target: { x: 0, y: 0, z: 0 },
  },

  table: {
    size: 18,
    thickness: 0.6,
    wallHeight: 1.6,
    wallThickness: 0.7,
    friction: 0.4,
    restitution: 0.1,
    maxTiltAngle: 0.26,
    maxTiltSpeed: 0.7,
  },

  marble: {
    radius: 0.8,
    mass: 1.2,
    friction: 0.35,
    restitution: 0.15,
    spawn: { x: 0, y: 4, z: 0 },
    tint: { r: 0.55, g: 0.58, b: 0.66 },
    alpha: 0.32,
    roughness: 0.04,
    indexOfRefraction: 1.5,
  },

  objects: {
    mass: 0.6,
    friction: 0.4,
    restitution: 0.25,
  },

  input: {
    gamepadDeadzone: 0.15,
    mouseSensitivity: 0.006,
  },

  audio: {
    minImpactSpeed: 1.2,
    clackThrottleMs: 60,
  },
} as const;
