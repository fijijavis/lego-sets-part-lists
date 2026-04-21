---
name: new-set
description: Add a new LEGO set to the checklist repo. Accepts a BrickLink inventory URL or pasted parts table, generates data/*.js, and validates it.
argument-hint: "[BrickLink URL or set number]"
allowed-tools: WebFetch Bash Read Write
---

You are adding a new LEGO set to the `lego-sets-part-lists` repo. Follow these steps exactly.

## Step 1 — Get the inventory

If `$ARGUMENTS` is a BrickLink URL, fetch it with WebFetch.
If `$ARGUMENTS` is empty or just a set number, ask the user for a BrickLink inventory URL or a pasted parts table.

BrickLink inventory URL format: `https://www.bricklink.com/catalogItemInv.asp?S=XXXXX-1`

**If the set looks large (250+ parts), ask the user for both the ascending and descending sort URLs** to ensure complete coverage, then fetch both and merge (deduplicate by part+color).

Extract only **Regular Items** — ignore Extra Items and Alternate Items sections entirely.

The parts table has columns: Image | Part Num | Qty | Color | Description

## Step 2 — Confirm and gather metadata

Tell the user: "Got N parts across C colours — need a few details."

Then ask (can be one message):
- **Set name** — display name (e.g. "AT-AT", "B-wing Starfighter — UCS")
- **Set number** — the LEGO set number, or `null` if this is a MOC
- **Is this a UCS set?** — yes/no
- **Subtitle** — only for MOCs (e.g. "MOC", "MOC — Rebrickable")
- **Accent color** — suggest one based on theme (see guide below), let user confirm or override
- **Completion message** — suggest one, let user confirm

### Accent color guide
- Star Wars military/walkers: `#7ab84a`
- Star Wars vehicles/fighters: `#4ab4e8`
- WALL-E / rusty/mechanical: `#c87820`
- Space/sci-fi neutral: `#4ab4e8`
- Castle/medieval: `#e8b94a`

## Step 3 — Build the data file

### Filename convention
- Standard set: `{setNumber}-{kebab-name}.js` → `75054-atat.js`
- UCS set: `ucs-{setNumber}-{kebab-name}.js` → `ucs-75095-tie-fighter.js`
- MOC: `MOC-{PascalName}.js` → `MOC-AT-DP.js`

### Schema
```js
export default {
  setNumber: "75054",       // string, or null for MOCs
  name: "AT-AT",
  // subtitle: "MOC",       // only for MOCs
  accentColor: "#7ab84a",   // 6-digit hex
  storageKey: "lego75054_counts",  // unique; multiplier auto-persists at storageKey + "_mult"
  completionMessage: "🦾 IMPERIAL WALKER COMPLETE!",
  features: {
    subModels: false,
  },
  subModelDefs: [],         // required even if empty
  colors: {
    // colorId (number) → { name, hex }
    11: { name: "Black", hex: "#1a1a1a" },
  },
  parts: [
    // id MUST equal "${partNo}-${colorId}"
    { id: "44728-11", partNo: "44728", colorId: 11, qty: 2, name: "Bracket 1×2–1×4" },
    // optional: sub (string), isFig (boolean)
  ],
};
```

### Rules
- `id` must always be `"${partNo}-${colorId}"` — no exceptions
- `colorId` must be a **number**, not a string
- `qty` must be a positive integer
- Every `colorId` in parts must have a matching entry in `colors`
- `subModelDefs` must always be present (use `[]` if no sub-models)
- Sort parts by colorId ascending, then partNo within each color group
- For minifigures: `colorId: 0`, `partNo` = fig ID (e.g. `"sw0607"`), `isFig: true`; add `0: { name: "—", hex: "#888888" }` to colors

### Color ID reference
```
Black=11, White=1, Yellow=3, Orange=4, Red=5, Green=6, Blue=7,
Light Gray=9, Trans-Clear=12, Trans-Brown=13, Trans-Red=17, Trans-Yellow=19,
Tan=2, Dark Green=80, Dark Red=59, Dark Blue=63, Dark Tan=69,
Light Bluish Gray=86, Dark Bluish Gray=85, Reddish Brown=88,
Flat Silver=95, Pearl Gold=115, Bright Light Orange=110,
Trans-Green=50, Trans-Neon Green=74, Sand Blue=55,
```

If a color isn't listed, look up its BrickLink colorId from `&idColor=XX` in the inventory URL.

## Step 4 — Write and validate

1. Write the file to `data/{filename}.js`
2. Run `npm run validate`
3. If validation passes, report: filename, part count, color count
4. If validation fails, fix the errors and re-validate before reporting done
