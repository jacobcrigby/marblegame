# PLAN.md — Marble Game

Plan-driven development tracker. This is the source of truth for **what** we are
building and **in what order**. Agents: read `AGENTS.md` first, then this file,
then `docs/alpha-plan.html` for the full design rationale.

## Vision

A tilt-to-roll 3D marble game (Labyrinth / Perplexus / Rollgoal lineage). The
player tilts the play surface; gravity moves the marble. Built on Babylon.js +
Havok physics.

## Alpha goal

A marble rolling on a tiltable table with containing walls and a few test boxes
for collision. Prove out the rendering, physics, tilt-control, and audio-seam
foundations that every later feature builds on.

### In scope (Alpha)

- Glassy, smoky, see-through marble (PBR glass + smoky tint).
- A flat table with raised walls that tilts on two axes via player input.
- Tilt controls: **keyboard (baseline)**, mouse drag, gamepad, device gyro — all
  behind one input abstraction.
- A handful of dynamic boxes to test collisions.
- Fixed angled overhead camera.
- Reset (re-center marble, level the table).
- Debug overlay (FPS + Babylon Inspector toggle).
- Audio *seam*: collision hook calls an `AudioService`; Alpha ships the stub.

### Out of scope (Alpha — do not build yet)

- Goal hole / win / lose states.
- Levels, mazes, level loading.
- Real audio assets, music.
- Menus, scoring, persistence.
- Inside-a-sphere (Perplexus) mode.

## Locked decisions

| Area        | Decision                                                            |
|-------------|---------------------------------------------------------------------|
| Language    | TypeScript (strict)                                                  |
| Build       | Vite                                                                 |
| Engine      | Babylon.js (`@babylonjs/core`)                                       |
| Physics     | Havok (`HavokPlugin`, Physics v2 API)                                |
| World       | Tilting flat table + walls under a pivot `TransformNode`             |
| Controls    | Keyboard + mouse drag + gamepad + device gyro, via `TiltIntent`      |
| Camera      | Fixed angled `ArcRotateCamera`, user controls detached              |
| Marble      | PBR glass, smoky tint volume, IBL reflections                       |
| Audio       | `AudioService` interface + `NullAudioService` stub in Alpha          |

## Architecture at a glance

```
input sources ──► TiltIntent ──► InputManager (combine + clamp) ──► Table.applyTilt()
                                                                        │
                                                          pivot TransformNode rotates
                                                                        │
        Havok: marble & boxes are DYNAMIC, table & walls are ANIMATED  │
                                                                        ▼
                         gravity rolls the marble across the tilted surface
                                                                        │
                              collision observable ──► AudioService.playClack()
```

See `docs/alpha-plan.html` for the full breakdown.

## Milestones

Work top to bottom. A phase is done only when every box is checked **and** its
acceptance criteria hold. Check boxes in the same change that completes the work.

### Phase 0 — Scaffolding
- [ ] `package.json` with Babylon, Havok, Vite, TypeScript
- [ ] `tsconfig.json` (strict), `vite.config.ts`, `index.html` with a fullscreen canvas
- [ ] `src/main.ts` boots an empty Babylon scene with a render loop and clear color
- [ ] npm scripts: `dev`, `build`, `preview`, `typecheck`
- **Accept:** `npm run dev` serves a blank rendered scene; `npm run typecheck` is clean; no console errors.

### Phase 1 — Scene foundation
- [ ] `GameApp` owns Engine, Scene, resize handling, and the render loop
- [ ] `SceneBuilder` adds the fixed angled `ArcRotateCamera` (controls detached)
- [ ] Lighting (hemispheric + directional) and an environment/IBL texture
- [ ] A static reference ground
- **Accept:** A lit scene renders from the fixed camera; window resize is handled.

### Phase 2 — Physics world
- [ ] `PhysicsWorld` initializes Havok (async wasm load) and enables physics with gravity
- [ ] A temporary dynamic sphere falls onto a static ground and comes to rest
- **Accept:** The sphere falls under gravity and settles on the ground; stable, no jitter explosion.

### Phase 3 — The marble
- [ ] `Marble` builds the glassy smoky PBR sphere (tint + transmission + IBL)
- [ ] Marble has a `DYNAMIC` body with tuned mass/friction/restitution from `GameConfig`
- [ ] Spawns above the surface and settles
- **Accept:** Marble visibly reads as glass/see-through with a smoky tint and rolls/settles believably.

### Phase 4 — Tilting table
- [ ] `Table` builds a flat surface + four raised walls as `ANIMATED` bodies under a pivot `TransformNode`
- [ ] `Table.applyTilt(intent)` rotates the pivot within `GameConfig` tilt limits
- [ ] Temporary hard-coded tilt proves the marble rolls and walls contain it
- **Accept:** Tilting the table rolls the marble downhill; walls keep it on the surface.

### Phase 5 — Input system
- [ ] `TiltIntent` type + `InputSource` interface
- [ ] `InputManager` aggregates active sources into one clamped `TiltIntent` and drives `Table`
- [ ] `KeyboardInput` (baseline), then `MouseInput`, `GamepadInput`, `DeviceTiltInput`
- **Accept:** Keyboard tilts the table; each other source tilts when present; combined input is clamped sanely.

### Phase 6 — Test boxes
- [ ] `TestBoxes` spawns a few `DYNAMIC` boxes on the table
- **Accept:** The marble knocks boxes around; boxes respect the walls and rest realistically.

### Phase 7 — Audio seam
- [ ] `AudioService` interface + `NullAudioService` stub wired in
- [ ] Collision observable hook maps impact magnitude → `playClack(volume)` (throttled)
- **Accept:** Collisions fire the hook and call the stub with a sensible volume; zero runtime errors; silent.

### Phase 8 — Debug & reset
- [ ] `DebugOverlay` shows FPS and toggles the Babylon Inspector via a key
- [ ] Reset key re-centers the marble (clears velocity) and levels the table
- **Accept:** FPS visible, Inspector toggles, reset returns to a clean start state.

### Phase 9 — Tuning pass
- [ ] Tune gravity, friction, restitution, tilt sensitivity, marble material in `GameConfig`
- **Accept:** Rolling feels good and controllable; stable ~60 FPS on desktop.

## Definition of done (Alpha)

All phases complete and accepted; `npm run build` and `npm run typecheck` pass;
no console errors; code adheres to the principles in `AGENTS.md`; `PLAN.md`
checkboxes reflect reality.

## Risks & watch-items

- **Havok wasm loading** must be awaited before any physics body is created.
- **ANIMATED vs DYNAMIC** — tilting a static body won't transfer momentum
  correctly; the table/walls must be `ANIMATED`.
- **Gyro permissions/HTTPS** — `DeviceTiltInput` needs a user gesture + secure
  context on iOS; degrade gracefully when unavailable.
- **Glass cost** — PBR transmission/refraction is the heaviest material; keep the
  marble single and watch mobile performance in the tuning pass.
- **Input fighting** — detach camera user-controls so mouse-drag tilt and the
  camera don't compete for the pointer.
