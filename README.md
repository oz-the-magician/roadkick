# Roadkick

A browser pixel-art motorcycle racer in the spirit of *Road Rash*: pseudo-3D roads, rivals you can kick off their bikes, and police that chase you for speeding.

**Play:** https://oz-the-magician.github.io/roadkick/

Plain HTML and JavaScript — no build step, no dependencies. All pixel art, sound effects and the NES-style chiptune soundtrack are generated in code.

## Features

- **5 tracks** with a level-select screen and live preview: mountain road, night city, desert, Prague, stunt canyon
- **Rivals with character** — seven named riders: the hothead who hunts you, the vengeful one who turns nasty once kicked, two clean racers, a coward who swerves away, a backstabber and a wobbly old-timer. They talk trash in speech bubbles
- **Road Rash weapons** — some rivals carry a chain or a club; knock them off and the weapon is yours, with longer reach and a limited number of hits
- **Police chase** — exceed 130 km/h to fill a three-level violation meter: patrol car → car + motorcycle → car + two motorcycles. Patrols pin you from the side; 3.2 s of contact and you're busted (a ring over the bike shows how close). Outrun the car, kick the bikes, or stay clean for 20 s to lower the wanted level
- **Jumps and flips** — crests and ramps launch the bike; hold ↓ in the air to backflip, land upright or crash
- **Pickups** — a paintball drone (F) that shoots rivals, and nitro (C) for a 5-second boost
- **Hazards** — fall off the Prague bridge into the river, or into the canyon's chasms
- **Dynamic weather** — rain, fog and sandstorms roll in mid-race, cutting visibility and grip
- **Chiptune soundtrack** — a theme per track on two pulse channels, triangle bass and noise drums; it speeds up during chases
- **Combos and score** — overtakes, near misses, kicks, flips and big air chain into a multiplier up to ×8; crash and the combo burns. Best score is saved per track
- **Game feel** — the camera leans into corners and pulls back with speed, nitro opens a speed tunnel, and kicks, flips and crashes drop into a brief slow motion (off when the system asks for reduced motion)
- **Day / night** toggle with a headlight, plus touch controls on phones

## Controls

| Key | Action |
| --- | --- |
| ← → | Steer |
| ↑ / ↓ | Throttle / brake (↓ in the air: flip) |
| Space | Kick |
| F | Drone |
| C | Nitro |
| N | Day / night |
| B | Music on / off |
| M | All sound on / off |
| P / Esc | Pause |

## Run locally

Open `index.html` in a browser. That's it.

## Project structure

The scripts are plain (non-module) files loaded in order, so the game also runs straight from disk.

| File | What's in it |
| --- | --- |
| `js/core.js` | Constants, math helpers, colour palettes |
| `js/sprites.js` | Procedural pixel-art sprites: riders, vehicles, scenery |
| `js/backgrounds.js` | Parallax sky and horizon layers |
| `js/tracks.js` | Road geometry, scenery placement and the five track definitions |
| `js/state.js` | Race state, reset and HUD |
| `js/audio.js` | Sound effects and the NES-style chiptune player |
| `js/race.js` | Per-step simulation: bike physics, jumps, pickups, rivals, finish |
| `js/police.js` | Police dispatch and pursuit AI |
| `js/rivals.js` | Rival personalities, speech bubbles and weapons |
| `js/feel.js` | Slow motion, combo scoring, pass detection |
| `js/render.js` | Pseudo-3D renderer, effects and weather |
| `js/main.js` | Main loop, input, menus and boot |

## Credits

Inspired by Arun N M's racing game on [arunnm.com](https://www.arunnm.com/). The pseudo-3D road technique follows Jake Gordon's classic [javascript-racer](https://github.com/jakesgordon/javascript-racer) write-up; the code here is written from scratch. Font: Press Start 2P (Google Fonts).

## License

MIT
