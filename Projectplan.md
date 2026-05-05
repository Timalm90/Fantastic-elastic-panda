# 🐼 Fantastic Elastic Panda — Project Plan

> Tivoli School Assignment · 2 people · 3 weeks

---

## 1. Overview

Fantastic Elastic Panda is a Three.js blendshape-matching game. A red panda model is displayed with a randomly configured face. The player has a set time limit to reproduce the same facial configuration using intuitive drag controls. Score is calculated from blendshape value proximity and determines coin payouts.

| | |
|---|---|
| **Team** | 2 people |
| **Duration** | 3 weeks |
| **Stack** | React · TypeScript · Three.js (via react-three-fiber) |
| **Model** | Provided — GLTF/GLB with blendshape morph targets |
| **Deploy** | Early deploy recommended (CORS) |

---

## 2. MVP Scope

### 2.1 Must — Core Game

- GLTF model loads with morph targets (blendshapes) functional
- Two model instances: locked target + player-controlled copy
- 8 drag-control regions (invisible, touch/mouse activated):
  - Left Ear, Right Ear
  - Left Eyebrow, Right Eyebrow
  - Left Cheek, Right Cheek
  - Nose, Mouth
- Each control maps X/Y drag delta → two blendshape axes (e.g. Up/Down, Left/Right)
- Opposing shape keys mutually exclusive (R_Ear_Up blocks R_Ear_Down)
- Symmetrical L/R controls share logic, mirrored on X axis
- 30-second countdown timer
- Score calculated from average blendshape delta (0–100%)
- Win condition: 95%+ → double coins, 90–95% → money back, <90% → no win
- Centralbank API integration: deduct stake on entry, pay out winnings, award stamp
- Check user balance before allowing entry

### 2.2 Must — UI / A11y

- Mobile-first, no scroll required — full viewport layout
- Works on both mobile (touch) and desktop (mouse)
- Fullscreen API on Android/desktop; `100dvh` fallback for iOS Safari
- Keyboard accessible controls (WCAG 2.1.1)
- Sufficient tap target sizes min 44×44px (WCAG 2.5.5)
- Contextual help visible (WCAG 3.3.5)
- Consistent styling throughout

### 2.3 Must — Admin Page

- Minimal, functional — no design requirement
- Adjust entry price
- Adjust win payout multipliers

### 2.4 Should (if time allows)

- Score animation: percentage ticks up on result screen
- Player scoreboard (top scores)
- Tutorial / rules overlay
- Anti-cheat / script detection
- Admin: adjust timer length
- Admin: adjust win threshold percentages

### 2.5 Could (stretch)

- Forehead control (9th control point)
- Drum roll sound on score reveal
- Two-player mode


### 2.6 Won't 

- More than 2 player types
- Additional animals

---

## 3. Blendshape Control System

Each control is an invisible draggable zone overlaid on the face region. Dragging maps the pointer offset from the zone's center to shape key values:

| Gesture | Blendshape Effect |
|---|---|
| Drag up | Activates `_Up` shape key (0→1 over drag range), zeroes `_Down` |
| Drag down | Activates `_Down` shape key, zeroes `_Up` |
| Drag right | Activates `_Right` shape key, zeroes `_Left` |
| Drag left | Activates `_Left` shape key, zeroes `_Right` |
| Diagonal | Both axes active simultaneously, values split proportionally |

The naming convention is parsed programmatically:

- Split on underscore: `[Side?, BodyPart, Direction]`
- Side (`R`/`L`) determines which control zone owns the key
- Direction (`Up`/`Down`/`Left`/`Right`) determines axis and sign
- L/R controls share a single React component with an `isRight` prop; X axis is mirrored

Control zones are invisible by default. On first touch/click a brief highlight ring appears to teach the player where the zones are, then fades. The face works as a pure gesture surface after that.

---

## 4. Game Loop

| Step | Description |
|---|---|
| 1. Entry | User pays stake via API. Balance checked first. |
| 2. Target reveal | Random blendshape values set. Spinning animation plays, stops, face visible ~2s. |
| 3. Transition | Target model floats up and shrinks. Player model appears. |
| 4. Match phase | Timer starts (30s). "Match!" text shown. Controls active. |
| 5. Time up | "Finish!" shown. Controls locked. Blendshapes frozen. |
| 6. Score calc | Per-key delta averaged. Score = 100% − avg error. |
| 7. Payout | API called based on win tier. Stamp awarded. |
| 8. Result | Score animates up. Win/lose message shown. Play again option. |

---

## 5. Project Structure

```
fantastic-elastic-panda/
├── public/
│   └── panda.glb                   # 3D model (GLTF binary)
├── src/
│   ├── api/
│   │   ├── centralbank.ts           # All API calls (typed)
│   │   └── types.ts                 # API request/response types
│   ├── components/
│   │   ├── scene/
│   │   │   ├── PandaModel.tsx        # R3F mesh + morph target control
│   │   │   ├── TargetPanda.tsx       # Locked random target
│   │   │   ├── PlayerPanda.tsx       # Player-controlled copy
│   │   │   └── SceneLayout.tsx       # Camera, lighting, canvas
│   │   ├── controls/
│   │   │   ├── DragZone.tsx          # Single invisible drag control
│   │   │   ├── FaceControls.tsx      # Renders all 8 DragZones
│   │   │   └── useBlendshapeControl  # Hook: drag → shape key values
│   │   ├── ui/
│   │   │   ├── Timer.tsx
│   │   │   ├── ScoreReveal.tsx
│   │   │   ├── ResultScreen.tsx
│   │   │   └── HelpOverlay.tsx
│   │   └── admin/
│   │       ├── AdminPage.tsx
│   │       └── AdminForm.tsx
│   ├── hooks/
│   │   ├── useGameState.ts           # Game loop state machine
│   │   ├── useTimer.ts
│   │   └── useApi.ts                 # Typed fetch wrapper
│   ├── types/
│   │   ├── blendshape.ts             # BlendshapeKey, ControlZone, etc.
│   │   ├── game.ts                   # GameState, WinTier, Score
│   │   └── api.ts                    # ApiError, UserBalance, Stamp
│   ├── utils/
│   │   ├── blendshapeParser.ts       # Name → side/part/direction
│   │   ├── scoreCalculator.ts        # Blendshape delta → score %
│   │   └── randomFace.ts             # Generate valid random values
│   ├── config/
│   │   └── gameConfig.ts             # Price, timer, thresholds (admin editable)
│   ├── App.tsx
│   └── main.tsx
├── tsconfig.json                     # strict, noImplicitAny, strictNullChecks
├── vite.config.ts
└── package.json
```

---

## 6. Packages

### Core

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18 | UI framework — required by assignment |
| `typescript` | ^5 | Required by assignment |
| `vite` | ^5 | Fast dev server and bundler |
| `@react-three/fiber` | ^8 | React renderer for Three.js |
| `@react-three/drei` | ^9 | Helpers: useGLTF, OrbitControls, Html |
| `three` | ^0.165 | Underlying 3D engine (peer dep of r3f) |

### TypeScript Types

| Package | Version | Purpose |
|---|---|---|
| `@types/three` | ^0.165 | Three.js TypeScript definitions |
| `@types/react` | ^18 | React TypeScript definitions |

### UI & Utility

| Package | Version | Purpose |
|---|---|---|
| `zustand` | ^4 | Lightweight game state management |
| `clsx` | ^2 | Conditional className utility |
| `framer-motion` | ^11 | Score reveal animation, screen transitions |

### Optional / Nice-to-have

| Package | Version | Purpose |
|---|---|---|
| `howler` | ^2.2 | Audio — drum roll on score reveal |
| `react-router-dom` | ^6 | Routing to /admin page |

> **Note:** `@react-three/fiber` wraps Three.js so you write React components instead of imperative Three.js code. `useGLTF` from drei handles GLTF loading including morph targets automatically. Strongly recommended over raw Three.js inside React to avoid lifecycle conflicts.

---

## 7. TypeScript Design Notes

| Type | Description |
|---|---|
| `BlendshapeKey` | Union type of all valid morph target names from the GLTF |
| `ControlZone` | Interface: id, label, position, affectedKeys, isRight |
| `BlendshapeValues` | `Record<BlendshapeKey, number>` — the main state shape |
| `GamePhase` | Enum: `IDLE \| REVEALING \| PLAYER_TURN \| FINISHED \| RESULT` |
| `WinTier` | Enum: `DOUBLE \| MONEY_BACK \| NO_WIN` |
| `ApiError` | Interface: message, status? — for typed catch blocks |
| `Stamp` | Interface: animal, metal? — per centralbank spec |

The `blendshapeParser` utility takes a raw morph target name string and returns a typed object — good candidate for a type guard and union narrowing (bonus TypeScript requirement).

---

## 8. 3-Week Plan

### Week 1 · Days 1–5 — 3D integration working end-to-end

| Day | Tasks |
|---|---|
| Day 1–2 | Vite project setup, tsconfig, folder structure. Load GLTF in r3f. Confirm morph targets accessible. Basic scene with camera and lighting. |
| Day 3 | Build `DragZone` with mouse + touch drag events. Map drag delta → two blendshape axes. One control working fully. |
| Day 4 | Wire all 8 control zones. Symmetry logic (`isRight` mirror). All shape keys responding correctly. |
| Day 5 | Random face generator. Two model instances in scene. Target model shows random face. |

### Week 2 · Days 6–10 — Full game loop playable

| Day | Tasks |
|---|---|
| Day 6 | Game state machine (`GamePhase` enum). Spinning reveal animation. |
| Day 7 | Transition animation: target floats up/shrinks, player model appears. Timer component. |
| Day 8 | Score calculation (blendshape delta average). Result screen. Win tier logic. |
| Day 9 | Centralbank API integration: balance check, stake deduction, payout, stamp. Typed API layer. |
| Day 10 | Mobile layout pass. Full viewport, no scroll. Touch event polish. Fullscreen API implementation. |

### Week 3 · Days 11–15 — Polish, A11y, admin, deploy

| Day | Tasks |
|---|---|
| Day 11 | A11y pass: keyboard controls for drag zones, target sizes, help overlay. |
| Day 12 | Admin page: entry price, payout multipliers. Minimal but functional. |
| Day 13 | Score reveal animation (framer-motion). Should-tier items if time allows. |
| Day 14 | Cross-device QA: iOS Safari, Android Chrome, desktop browsers. CORS check. |
| Day 15 | Buffer / documentation / final deploy. Project plan and evaluation docs. |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| GLTF morph targets not loading correctly | Test on Day 1. `useGLTF` + drei exposes `morphTargetDictionary`. Fallback: inspect with Three.js editor online. |
| Touch drag conflicts with page scroll | No-scroll layout + `touch-action: none` on drag zones eliminates this. Fullscreen API removes browser chrome on Android. |
| Centralbank API not ready | Swagger YAML available. Mock API locally with typed stubs from Day 1. |
| 3D transition animations complex | If difficult, static swap between phases still ships a working game. |
| iOS Safari fullscreen not supported | Use `100dvh` + `touch-action: none` fallback. Optionally show "Add to Home Screen" tip. |

---

## 10. Mobile Layout Strategy

Since no scroll is the goal, the full viewport is divided into fixed regions:

| Region | Content |
|---|---|
| Top bar (~10vh) | Game title, timer, balance display |
| 3D canvas (~70vh) | Both panda models. Target small top-left, player center. |
| Bottom bar (~20vh) | Status text ("Match!", "Finish!"), action button |

Control zones are absolutely positioned overlays on the canvas, sized at minimum 44×44px for WCAG tap target compliance. On mobile, tapping a zone activates it and further drag moves the shape — the face works as a pure gesture surface. A brief highlight ring appears on first touch to teach zone locations, then fades.

### Fullscreen

```ts
const canFullscreen = !!document.documentElement.requestFullscreen;

// Trigger on user gesture (tap)
if (canFullscreen) {
  document.documentElement.requestFullscreen();
}
```

- **Android / desktop:** Full Fullscreen API support — browser chrome hides completely
- **iOS Safari:** No Fullscreen API — fall back to `height: 100dvh` layout gracefully