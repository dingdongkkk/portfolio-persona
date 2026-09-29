# Persona portfolio

A static, game-style portfolio. No build or package installation is needed.

## Preview

Run `python3 -m http.server 4173` in this folder and open `http://localhost:4173`.

## Controls

- Click/tap or use the arrow keys to select items.
- Enter confirms; Escape returns to the previous scene.
- The AK mark returns to the main menu.
- Sound and motion controls are at the top right. System reduced-motion preferences are respected.
- In Projects, select a mission to read it, then choose Open live or Source.

## Edit

Personal details, experience, project links, and social links live in the `ME` object in `index.html`. The original `resume.pdf` is retained.

`style.css` contains the refreshed art direction and responsive layouts. `enhancements.js` controls motion preferences and pointer parallax. Artwork is bundled in `assets/key-art.jpg` and `assets/underground.jpg`; the site does not reference files outside this folder. Google Fonts are optional online resources, with local sans-serif fallbacks.


## Artwork provenance

Generated with the built-in imagegen tool, using extracted frames from the user's video as style references. Final production prompts are recorded in `assets/art-direction.md`. These are generated interpretations, not extracted game assets. Scene motion combines CSS camera drift, pointer parallax, animated menu selectors, dialogue typing, and timed graphic transitions.

