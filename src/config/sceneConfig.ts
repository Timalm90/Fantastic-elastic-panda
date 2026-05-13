// sceneConfig.ts

export const defaultSceneConfig = {
camera: {
    x: 0,
    y: -2.2,
    z: 5.4,
    fov: 56,
    rotationX: 0.2,
  },

  environment: {
    preset: "dawn",
    intensity: 0.32,
    blur: 0.7,
    rotation: -0.65,
  },

  ambientLight: {
    intensity: 0.0,
  },

  light1: {
    color: "#d56103",
    intensity: 225,
    distance: 12.1,
    decay: 1.0,
    position: [-1.4, 6.7, -2.5],
  },

  light2: {
    color: "#ba6040",
    intensity: 31,
    distance: 15.8,
    decay: 1.1,
    position: [0.0, -3.5, -1.3],
  },

  light3: {
    color: "#002a82",
    intensity: 247,
    distance: 47.8,
    decay: 1.3,
    position: [-2.3, 5.3, 20.2  ],
  },
}