# ☄ Meteor Impact (Revival)

> A browser-based 3D destruction game built with **Three.js** and **Vite**.  
> Rain meteors on a procedural city, but the skyline fights back.

---

## Intro

**Meteor Impact (Revival)** drops you above a procedurally generated city sleeping under moonlight. Your mission is simple to describe and brutal to execute: **destroy every building at once**.

Each impact sends towers tumbling, lights flickering out, and shockwaves rippling across the streets. The catch? **The city regenerates.** Knocked-down buildings rebuild after a short delay, scaling back up from the ground. You win only when **100% destruction** is achieved in a single moment before the skyline heals itself.

Collect rare powerups from impacts to charge colossal meteors or unleash a synchronized barrage. Orbit the carnage, switch to cinematic camera mode, and chase your best time and launch count.

---

## How To Run

### Prerequisites

- [Node.js](https://nodejs.org/) **18+** (LTS recommended)
- A modern browser with **WebGL** support (Chrome, Firefox, Edge, Safari)

### Development

```bash
# Install dependencies
npm install

# Start the dev server (default: http://localhost:5173)
npm run dev
```

Open the URL shown in your terminal, click **Start** on the intro screen, and begin launching meteors.

### Production Build

```bash
# Build optimized static assets to dist/
npm run build

# Preview the production build locally
npm run preview
```

The `dist/` folder can be deployed to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## Features & Powerups

### Gameplay

| | |
|---|---|
| **Objective** | Achieve **100% building destruction** simultaneously |
| **Challenge** | Destroyed buildings **regenerate** after 3–7 seconds and regrow in ~2 seconds |
| **HUD** | Live stats for clicks, elapsed time, and destruction percentage |
| **Win screen** | Records your completion time and total meteor launches |

### World & Visuals

- **Procedural city**: varied block layouts, building heights, parks, and lit windows
- **Night atmosphere**: exponential fog, starfield, ACES filmic tone mapping
- **Impact effects**: particle explosions, smoke plumes, dual shockwaves, flying debris
- **Post-processing**: Unreal Bloom and FXAA for a cinematic glow
- **Camera shake**: scales with meteor size and impact intensity
- **Mobile optimized**: touch controls, reduced bloom resolution, and adaptive rendering

### Controls

#### Mouse & Keyboard (Desktop)

| Action | Input |
|---|---|
| Orbit camera | Click & drag |
| Zoom | Scroll wheel |
| Launch meteor | **Space** or **Launch Meteor** button |
| Hold to charge *(with Charge powerup)* | Hold **Space** or hold **Launch Meteor** |
| Activate Infinity | **I** or **∞ Infinity** button |
| Reset game | **R** or **Reset Game** button |
| Cinematic camera | **C** or **Cinematic View** button |

#### Touch (Mobile)

| Action | Input |
|---|---|
| Orbit camera | Drag |
| Zoom | Pinch |
| Launch meteor | Tap **Launch Meteor** |
| Hold to charge | Hold **Launch Meteor** |

> After ~8 seconds of inactivity, the camera gently auto-orbits the city.

### Audio

Procedural sound effects powered by the **Web Audio API**: meteor whoosh, impact booms, and powerup chimes. Audio initializes when you press **Start** (browser autoplay policy).

---

### Powerups

Powerups appear as glowing orbs after meteor impacts. They float upward and are **auto-collected** when they rise high enough or expire (~6 seconds).

| Powerup | Icon | Drop rate | Effect |
|---|---|---|---|
| **Charge** | ⚡ | ~3% per impact *(+ slight boost from larger meteors)* | Hold **Launch Meteor** to charge over **1.5 seconds**, then release for a meteor up to **~3.5×** normal size. Consumes one Charge stock per charged launch. |
| **Infinity** | ∞ | ~0.3% per impact *(10% of all powerup drops)* | Instantly launches **5 mega meteors** (3.5× scale) in a staggered barrage. Consumes one Infinity stock per activation. |

#### Powerup tips

- Without a Charge powerup, tapping **Launch Meteor** fires a standard meteor immediately.
- Larger meteors destroy buildings in a wider radius and slightly improve powerup drop odds.
- Powerup counts are shown on the bottom control bar and reset when you start a new game.

---

## Tech Stack

| Layer | Technology |
|---|---|
| 3D engine | [Three.js](https://threejs.org/) r160 |
| Build tool | [Vite](https://vitejs.dev/) 5 |
| Language | JavaScript (ES modules) |
| Audio | Web Audio API (procedural synthesis) |

---

## Disclaimer

**Meteor Impact (Revival) is a work of fiction created for entertainment purposes only.**

All destruction depicted in this game is **entirely simulated**. No real cities, buildings, or people are harmed. The game does not promote, encourage, or glorify violence against people or property in the real world.

This project is provided **as-is**, without warranty of any kind. Performance, compatibility, and availability may vary by device and browser. Use at your own discretion.

---

<p align="center">
  <strong>Now go become Death, the destroyer of worlds.</strong><br>
  <em>At least, in this city.</em>
</p>
