# Open 2D MMO

A browser-based 2D action MMO prototype. An authoritative Node.js server simulates the whole world in memory and streams it to clients over WebSockets; the client is plain JavaScript that renders with either Canvas 2D or [PixiJS](https://pixijs.com/).

Gameplay content (classes, abilities, mobs, items, quests, recipes, biomes) is data-driven from JSON files and can be hot-reloaded while the server is running.

> Status: playable prototype. There is no database, accounts or persistence: restarting the server resets the world.

## Features

**Classes and combat**
- Three classes, each with its own abilities and talent tree:
  - Warrior: Slash, War Stomp, Charge, Blood Wrath
  - Mage: Fireball, Frostbolt, Arcane Missiles, Blizzard, Blink, Arcane Beam, Lightning Beam, Chain Lightning, Fire Hydra
  - Ranger: Aimed Shot, Multishot, Poison Arrow, Explosive Arrow, Shrapnel Grenade, Rain of Arrows, Caltrops, Ricochet Shot, Ballista Nest, Piercing Bolt
- Ability kinds implemented as server handlers: projectile, melee, area, beam, chain, summon and teleport, with cast times, channelling, cooldowns and mana.
- Damage over time, slows and other combat effects; a DPS meter.
- Spatial (positional) audio for ability and mob sounds.

**World and mobs**
- Large tile world generated from biome bands and sectors, with a town hub and vendor.
- Mobs (zombies, skeletons, skeleton archers, creepers, spiders, orc berserkers) with spawners, wandering, chasing and their own abilities, plus huntable animals (rabbits, deer, boars).

**Progression and items**
- XP and levelling, talent points and per-class talent trees.
- Equipment with slots, rarity tiers and rolled affixes; inventory, loot bags and drop tables; vendor buy/sell.
- Gathering skills (woodcutting, mining, hunting) with resource nodes, and crafting recipes.
- Hand-written and procedurally generated quests with NPC dialogue, a quest log and a tracker.

**Social and tooling**
- Chat (with server-side sanitisation).
- Server-controlled bots that fight, loot, equip gear and visit the vendor; benchmark scenes for performance testing.
- Debug panel (FPS, bandwidth, entity counts, renderer stats) and admin tools for spawning bots and granting items.
- Touch controls with a virtual joystick for mobile browsers.

**Networking**
- Visibility filtering: each client only receives entities within its view range (quadtree / spatial index).
- Compact binary entity stream (full and delta packets) alongside JSON events.
- WebSocket payload-size and per-IP connection/message rate limits.

## Getting started

Requirements: Node.js 18 or newer (developed on Node 22) and npm.

```bash
npm install
npm start
```

Then open `http://localhost:3000` in one or more browser tabs, pick a name and a class, and play. Opening several tabs is the easiest way to see multiplayer.

### Run modes

| Command | What it does |
| --- | --- |
| `npm start` / `npm run start:dev` | Development mode: serves `public/index.dev.html`, which loads the client as separate ES modules for easier debugging. |
| `npm run start:prod` | Builds the minified client bundle with esbuild, then starts the server in production mode (serves `public/index.prod.html`). |
| `npm run build:client` | Only rebuilds `public/app.bundle.min.js` and `public/index.prod.html`. |
| `npm run sync:pixi` | Copies the PixiJS runtime from `node_modules` into `public/vendor/`. |

### Configuration

Environment variables (see [`.env.example`](.env.example)):

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | HTTP and WebSocket port. |
| `APP_MODE` (or `NODE_ENV`) | `development` | `prod` / `production` serves the bundled client. |

The server reads these from the environment only; it does not load a `.env` file itself, so export them in your shell or use a tool such as `dotenv-cli`.

Game tuning lives in JSON and is hot-reloaded on save:

- `config/server.json`: global multipliers (XP, mob health/damage/speed/respawn, drop chance, spawn density) and WebSocket limits (`wsMaxPayloadBytes`, connection/message rate limits, `wsTrustProxyHeaders` for running behind a reverse proxy).
- `config/gameplay.json` and `config/game-constants.js`: core gameplay constants.
- `data/*.json`: content definitions (`classes`, `abilities`, `talents`, `mobs`, `items`, `equipment`, `drop-tables`, `resources`, `skills`, `recipes`, `biomes`, `quests`, `quest-templates`, `quest-regions`).

## Controls

| Input | Action |
| --- | --- |
| `WASD` / arrow keys | Move (virtual joystick on touch screens) |
| Left mouse | Primary ability (hold to keep attacking) |
| Right mouse | Secondary action / pick up nearby loot bag |
| `1`–`9` | Action bar slots |
| `I` | Inventory |
| `C` | Character / equipment |
| `P` | Spellbook |
| `T` | Talents |
| `O` | Crafting |
| `Q` | Quest log |
| `K` | DPS meter |
| `F3` | Debug panel |
| `Enter` (in chat box) | Send chat message |

## Project layout

```
server.js             Server composition root: loads config/content, wires services, starts the loop
server/
  ability-handlers/   One handler per ability kind (projectile, melee, area, beam, chain, summon, teleport)
  config/             Loaders and normalisers for config/ and data/ files
  gameplay/           Combat, mobs, items, crafting, quests, bots, progression and other game systems
  network/            HTTP server, WebSocket connections, message router, packet encoders, state broadcast
  runtime/            World state, game loop, per-tick systems, config hot reload
  __tests__/          Jest unit tests
public/
  client.js           Client shell (state, glue code)
  client/             Client modules: networking, input, rendering (canvas + Pixi), UI panels, audio, VFX
  shared/             Code shared by client and server (protocol, codecs, layout and math helpers)
  sounds/             Ability and mob sound effects
  vendor/             Vendored PixiJS runtime
config/, data/        Game tuning and content (JSON)
scripts/              Build script, prod launcher, standalone tests, Playwright smoke tests, renderer benchmark
docs/                 Original game spec and idea backlog
```

For deeper detail see the architecture notes: [server.md](server.md) and [client.md](client.md).

## Testing

```bash
npm test                 # Jest unit tests (server/__tests__)
npm run test:coverage    # with coverage report
```

There are also standalone Node test scripts and Playwright browser smoke tests, for example:

```bash
npm run test:quests:unit
npm run test:security:ws
npx playwright install chromium   # once, before the smoke tests
npm run test:quests:smoke
```

See the `scripts` section of `package.json` for the full list. The Playwright smoke tests start their own server and drive a headless browser through the `window.__open2dmmoTest` automation hooks.

## Known limitations

- Admin/debug tools are enabled by a checkbox on the join screen, and the server trusts that flag. This is fine for local play and testing, but do not expose the server publicly without adding real authentication.
- All state is in memory in a single process; there is no persistence or horizontal scaling.
- `public/client.js` is still a large monolithic shell that is being split into the modules under `public/client/`.

## Contributing

Issues and pull requests are welcome. Please run `npm test` before opening a pull request.

## License

[MIT](LICENSE)
