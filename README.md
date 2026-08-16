# 🧩 Rubik's Cube 3D Solver & Studio

A modern, production-quality 3D Rubik's Cube web application built with **React**, **TypeScript**, **Three.js**, **Tailwind CSS**, and **Kociemba's Two-Phase Algorithm**.

It allows users to interact with a virtual 3D speedcube, paint their real-life physical cube on a 2D net with physical parity validation, and follow real-time animated 3D step-by-step solutions.

![Rubik's Cube 3D Solver](https://raw.githubusercontent.com/takaisbjehei/rubiks-cube-3d-solver/main/public/banner.png)

---

## ✨ Features

### 1. 🎮 Virtual 3D Speedcube Studio
- **Realistic 3D WebGL Mesh**: 26 individual cubies with beveled edges, dark plastic core, and tournament-grade sticker colors.
- **Dynamic Slice Animations**: Smooth easing rotations for 90° and 180° turns.
- **Natural Interaction**:
  - Drag background to orbit camera freely.
  - Swipe directly on cube faces to trigger face turns.
  - Scroll/pinch to zoom in and out.
  - Camera view presets (3D Isometric, Front, Top, Right, Back).
- **Virtual Move Keypad**: Full support for $U, D, L, R, F, B$, Prime ($'$), Double ($2$), slice moves ($M, E, S$), and cube rotations ($x, y, z$).
- **Fluid Keyboard Controls**: Fast hotkeys for speedsolving practice.
- **Synthesized Audio Effects**: Realistic mechanical clicks and solved victory fanfare using Web Audio API.

### 2. 🔍 "Solve My Real Cube" (IRL Cube Entry)
- **Interactive 2D Unfolded Net**: Paint stickers by selecting colors from a palette or clicking directly on the 3D cube.
- **Fixed Center Referencing**: Centers are locked to standard Western color scheme (White top, Green front, Red right, Blue back, Orange left, Yellow bottom).
- **Deep Parity & Mathematical Validation**:
  - Exact 9-sticker count verification per color.
  - Permutation & orientation checks for all 8 corners and 12 edges.
  - Corner twist parity ($\sum \text{twist} \equiv 0 \pmod 3$).
  - Edge flip parity ($\sum \text{flip} \equiv 0 \pmod 2$).
  - Permutation parity ($\operatorname{sgn}(\text{corners}) = \operatorname{sgn}(\text{edges})$).
  - Clear, human-actionable error messages (e.g., *"One corner piece was twisted in place"*).

### 3. 🚀 Step-by-Step 3D Guided Solver
- **Instant Kociemba Solver**: Calculates optimal ~18–22 move solutions in milliseconds (< 5ms).
- **Physical Guidance**: Plain-English physical instructions with holding tips.
- **3D Directional Arrows**: Luminous curved turn arrows rendered directly on the active turning face.
- **Timeline Breadcrumb**: Jump to any move in the algorithm with instant state synchronization.
- **Playback Controls**: Previous, Next, Auto-Play, Pause, Restart, Replay Move, and Speed Slider ($0.5\times, 1\times, 1.5\times, 2\times$).

### 4. ⏱️ Speedcube Timer & Pattern Gallery
- **Inspection & Precision Timer**: Millisecond timer with live Turns-Per-Second (TPS) tracker and solve history stored in `localStorage`.
- **Iconic Cube Patterns**: One-click generation of Checkerboard, Superflip, Cube in a Cube, Anaconda, Python, Six-Spot, etc.

---

## 🛠️ Tech Stack

- **Framework**: React 19 / 18, TypeScript, Vite
- **3D Graphics**: Three.js (WebGL, Directional/Ambient/Rim Studio Lighting, PCF Soft Shadows)
- **Solving Engine**: Two-Phase Kociemba Algorithm (`min2phase`)
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism
- **Audio**: Web Audio API Sound Synthesizer
- **Effects**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/takaisbjehei/rubiks-cube-3d-solver.git
cd rubiks-cube-3d-solver

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

---

## 📜 License
MIT License. Created for puzzle enthusiasts and speedcubers worldwide.
