/**
 * MRC Mate — Monitoring Resource Co-ordinator Dashboard
 * -----------------------------------------------------
 * This is the shell of the dashboard. It is intentionally built around a
 * TOOL_REGISTRY so that new tools can be added later (once the MRC's full
 * responsibilities are known) without restructuring the app.
 *
 * To add a new tool once its requirements are known:
 *   1. Add an entry to TOOL_REGISTRY below (id, name, icon, status, description).
 *   2. Add a matching <section id="tool-<id>"> panel in Index.html.
 *   3. Add any server-side functions it needs (new file, e.g. Tools_Buffer.gs).
 *   4. Wire up the panel's data loading in JavaScript.html.
 */

// ---------------------------------------------------------------------------
// Tool registry — the single source of truth for what shows up in the nav.
// status: "active"   -> fully wired up, user can use it today
//         "planned"  -> placeholder card shown, not yet built
// ---------------------------------------------------------------------------
var TOOL_REGISTRY = [
  {
    id: 'home',
    name: 'Overview',
    icon: '🏠',
    status: 'active',
    description: 'At-a-glance summary of the tools available in MRC Mate.'
  },
  {
    id: 'announcements',
    name: 'Team Notes',
    icon: '📝',
    status: 'active',
    description: 'Shared notes/announcements board for the MRC team. A working example tool showing the pattern new tools should follow.'
  },
  {
    id: 'buffer',
    name: 'Buffer Monitor',
    icon: '📊',
    status: 'planned',
    description: 'Track buffer/queue levels and staffing against demand in real time.'
  },
  {
    id: 'roster',
    name: 'Employee Roster',
    icon: '👥',
    status: 'planned',
    description: 'Directory of employees, skills, and current status (available, on break, in a session, etc.).'
  },
  {
    id: 'coverage',
    name: 'Shift Coverage',
    icon: '🗓️',
    status: 'planned',
    description: 'View and manage shift coverage, gaps, and coverage requests.'
  },
  {
    id: 'escalations',
    name: 'Escalations',
    icon: '🚨',
    status: 'planned',
    description: 'Log and track escalations or incidents that need MRC follow-up.'
  }
];

/**
 * Serves the dashboard as a standalone web app.
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('MRC Mate')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Adds a custom menu when this script is bound to a Sheet/Doc/Form,
 * so the dashboard can also be launched from inside that file.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('MRC Mate')
    .addItem('Open Dashboard', 'showDashboard')
    .addToUi();
}

/**
 * Opens the dashboard in a modal dialog from within a bound Sheet.
 */
function showDashboard() {
  var html = HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setWidth(1100)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, 'MRC Mate');
}

/**
 * Allows Index.html to pull in Stylesheet.html / JavaScript.html partials.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Returns the tool registry to the client so the nav and placeholder
 * cards can be rendered generically.
 */
function getToolRegistry() {
  return TOOL_REGISTRY;
}

// ---------------------------------------------------------------------------
// "Team Notes" — a minimal, fully working example tool.
// Stored in Script Properties (shared across all users), so it works
// whether this is deployed standalone or bound to a Sheet.
// ---------------------------------------------------------------------------
var NOTES_KEY = 'MRC_MATE_TEAM_NOTES';
var MAX_NOTES = 50;

function getAnnouncements() {
  var raw = PropertiesService.getScriptProperties().getProperty(NOTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function addAnnouncement(text) {
  text = (text || '').toString().trim();
  if (!text) {
    throw new Error('Note text cannot be empty.');
  }
  var notes = getAnnouncements();
  notes.unshift({
    text: text,
    author: Session.getActiveUser().getEmail() || 'Unknown',
    timestamp: new Date().toISOString()
  });
  notes = notes.slice(0, MAX_NOTES);
  PropertiesService.getScriptProperties().setProperty(NOTES_KEY, JSON.stringify(notes));
  return notes;
}
