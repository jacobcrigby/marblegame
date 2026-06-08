export const GameConfig = {
  gravityY: -9.81,

  camera: {
    alpha: -Math.PI / 2,
    beta: Math.PI / 3.4,
    radius: 26,
    target: { x: 0, y: 0, z: 0 },
  },

  table: {
    size: 18,
    thickness: 0.6,
    wallHeight: 1.2,
    wallThickness: 0.5,
    friction: 0.4,
    restitution: 0.15,
    maxTiltAngle: 0.32,
    tiltLerp: 0.12,
  },

  marble: {
    radius: 0.8,
    mass: 1.2,
    friction: 0.35,
    restitution: 0.2,
    spawn: { x: 0, y: 4, z: 0 },
    tint: { r: 0.16, g: 0.17, b: 0.2 },
    alpha: 0.55,
    roughness: 0.05,
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
