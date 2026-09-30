# Persona portfolio

A game-style portfolio served as static files, with a live animated station. No build or package installation is needed.

## Preview

Run `python3 -m http.server 4173` in this folder and open `http://localhost:4173`.

## Controls

- Click/tap or use the arrow keys to select items.
- Enter confirms; Escape returns to the previous scene.
- The AK mark returns to the main menu.
- Sound and motion controls are at the top right. System reduced-motion preferences are respected.
- In Projects, select a mission to read it, then choose Open live or Source.
- The platform status button replays the train arrival.

## Edit

Personal details, experience, project links, and social links live in the `ME` object in `index.html`. The original `resume.pdf` is retained.

`style.css` contains the refreshed art direction and responsive layouts. `enhancements.js` controls motion preferences and pointer parallax. `npc-designs.js` defines four articulated, original NPC designs (rebel, student, suited commuter, and courier) with separate hair, masks, clothing, hands and accessories. `station.js` draws the subway live on Canvas: perspective geometry, six moving train carriages, sliding doors, animated commuters, lights and cast shadows. The 22-second train cycle includes arrival, boarding, door closure, departure, and a short empty-track interval. Rendering pauses when the scene or browser tab is hidden, and the motion control freezes the simulation. Portrait artwork is bundled in `assets/key-art.jpg`; the site does not reference files outside this folder. Google Fonts are optional online resources, with local sans-serif fallbacks.


## Artwork provenance

Generated with the built-in imagegen tool, using extracted frames from the user's video as style references. Final production prompts are recorded in `assets/art-direction.md`. These are generated interpretations, not extracted game assets. The generated `assets/underground.jpg` is retained as a design reference; it is no longer used as the station background. Scene motion is rendered by `station.js`, alongside animated menu selectors, dialogue typing, and timed graphic transitions.

