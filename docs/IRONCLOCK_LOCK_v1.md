# Kolosseum.tools IronClock Lock v1

Status: LOCKED  
Scope: /tools/ironclock  
Stack: Vite + React + Tailwind + lucide-react  
Primary files:
- src/pages/IronClock.jsx
- src/pages/IronClock.css
- src/App.jsx
- public/manifest.webmanifest
- public/sw.js

## Locked decision

IronClock is the approved installable tool baseline.

It must remain:
- a React route at /tools/ironclock
- linked from the landing page IronClock card
- covered by npm run check
- available as the PWA start URL
- cached by the service worker
- styled with the Kolosseum dark/lime operator aesthetic

## Locked functionality

IronClock must keep:
- target weight input
- kg/lb unit selector
- 20kg and 25kg bar selection
- collar selection
- quick plate availability controls
- full plate settings modal
- localStorage persistence for plate settings
- closest load output
- exact/rounded status
- barbell visual
- per-side plate output
- rest timer
- custom minute/second controls
- timer overlay
- share button
- Tools home back link

## Edit rule

Do not modify IronClock unless the task is specifically about IronClock.

Do not commit temporary CSS.

Do not remove the route, PWA start URL, service worker cache entry, or landing page link.

Any future IronClock change must pass:
- npm run build
- npm run check:landing-lock
- npm run check:ironclock-lock
- npm run check:pwa
