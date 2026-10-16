# MRC Mate

A dashboard for Monitoring Resource Co-ordinators (MRCs) — a single place to
hold the tools they use to manage employees, the buffer, and other
day-to-day situations.

**This is a shell.** Only two things are fully built right now:

- The dashboard frame itself (sidebar nav, panel layout, tool registry).
- **Team Notes** — a working example tool (shared notes board) that
  demonstrates the pattern every future tool should follow.

Everything else in the sidebar (Buffer Monitor, Employee Roster, Shift
Coverage, Escalations) is a **placeholder** — a named, described slot with a
"Planned" badge. They were guessed at as *likely* MRC tools based on the name
of the role, not confirmed requirements. Swap, rename, remove, or flesh them
out once you know what the MRC team actually needs.

## Project structure

```
appsscript.json    Apps Script manifest (web app config, runtime)
Code.gs             Server-side: tool registry, doGet/onOpen, Team Notes backend
Index.html          Dashboard shell (sidebar + panel containers)
Stylesheet.html     All CSS, included into Index.html
JavaScript.html     Client-side nav/panel logic, included into Index.html
```

## How the shell works

`TOOL_REGISTRY` in `Code.gs` is the single source of truth for what appears
in the sidebar:

```js
{
  id: 'buffer',          // matches the <section id="tool-buffer"> panel
  name: 'Buffer Monitor',
  icon: '📊',
  status: 'planned',     // 'active' once it's built
  description: '...'
}
```

The client fetches this registry on load (`getToolRegistry()`), builds the
nav and the Overview cards from it, and auto-renders a "Planned" placeholder
panel for anything not yet marked `active`.

## Adding a new tool

1. Add an entry to `TOOL_REGISTRY` in `Code.gs`.
2. Add a matching panel in `Index.html`: `<section id="tool-<id>" class="panel" hidden>...</section>`.
3. Add whatever server-side functions it needs — either in `Code.gs` or a new
   file (e.g. `Tools_Buffer.gs`) for anything non-trivial.
4. Wire up data loading/submission in `JavaScript.html`, following the
   `loadAnnouncements()` / `addAnnouncement()` pattern used by Team Notes.
5. Flip `status` to `'active'` once it's working.

## Deploying with clasp

This repo doesn't include a `.clasp.json` (it needs a real Script ID, which
is specific to whoever creates the Apps Script project). To push this code:

```bash
npm install -g @google/clasp
clasp login

# Option A: create a new standalone Apps Script project
clasp create --title "MRC Mate" --type webapp --rootDir .

# Option B: bind it to an existing Google Sheet (lets the dashboard also
# open via Extensions > Apps Script > MRC Mate > Open Dashboard)
clasp create --title "MRC Mate" --type sheet --rootDir .

clasp push
clasp deploy
```

After deploying as a web app, share the web app URL with the MRC team.
If bound to a Sheet instead, the `onOpen()` menu lets them launch it from
there without a separate URL.

### Access control

`appsscript.json` currently sets:

```json
"webapp": { "executeAs": "USER_DEPLOYING", "access": "DOMAIN" }
```

- `executeAs: USER_DEPLOYING` — the app runs with the deployer's permissions,
  so shared data (like Team Notes) is consistent for everyone regardless of
  their individual permissions.
- `access: DOMAIN` — restricts the web app to signed-in users on your Google
  Workspace domain. Tighten or loosen this once you know who needs access.
