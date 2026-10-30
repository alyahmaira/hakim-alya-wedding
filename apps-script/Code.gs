/**
 * Wedding RSVP (groom's side) - Google Apps Script Web App backend.
 *
 * Receives RSVP submissions as JSON POSTs from the wedding website (via the
 * site's /api/rsvp?side=groom proxy), routes each response into a tab named
 * after its Guest Group (creating the tab and headers automatically if it
 * doesn't exist yet), and keeps a live Dashboard tab of totals.
 *
 * SETUP:
 *   1. Open the groom's Google Sheet.
 *   2. Extensions -> Apps Script, paste this whole file in, save.
 *   3. Run the `setup` function once (see toolbar) to pre-create all tabs
 *      + the Dashboard before your first real submission.
 *   4. Deploy:
 *        - Updating an existing deployment (keeps the same /exec URL):
 *          Deploy -> Manage deployments -> edit (pencil) -> Version: New version -> Deploy.
 *        - First deployment: Deploy -> New deployment -> Web app,
 *          Execute as: Me, Who has access: Anyone.
 *   5. Put the /exec URL in the GROOM_RSVP_ENDPOINT environment variable of
 *      the hakim-alya-wedding Vercel project.
 */

// ---- Fixed guest-group tabs. Must match the frontend's canonical values
// exactly (GUEST_GROUP_VALUES in index.html - the English option values, not
// the personalized display labels like "Hakim's Friends and Colleagues"). ----
const SHEET_TABS = ['Relatives', 'Friends', "Groom's Friends and Colleagues"];
const HEADERS = ['Timestamp', 'Full Name', 'Phone Number', 'Attendance Status', 'Number of Guests', 'Guest Group', 'Message'];
const DASHBOARD_NAME = 'Dashboard';

// How long (seconds) a given phone number is blocked from submitting again.
// This absorbs double-clicks and flaky-network auto-retries, not sophisticated abuse.
const DUPLICATE_COOLDOWN_SECONDS = 30;

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: 'Empty request body' }, 400);
    }

    const data = JSON.parse(e.postData.contents);

    // Honeypot: a hidden field real guests never see or fill. If it has a
    // value, this almost certainly isn't a human - silently pretend success
    // so the bot doesn't learn anything and try harder.
    if (data.company) return jsonOut({ ok: true });

    const name = sanitize(data.name);
    const phone = sanitize(data.phone);
    const attendance = sanitize(data.attendance);
    const guestGroup = sanitize(data.guestGroup);
    const message = sanitize(data.message || '');
    const guestCount = parseInt(data.guestCount, 10);

    // ---- validation: mirrors the client-side checks, but this is the copy
    // that actually matters since the client can be bypassed entirely. ----
    const errors = [];
    if (!name) errors.push('name is required');
    if (!phone) errors.push('phone is required');
    if (attendance !== 'Attending' && attendance !== 'Not Attending') errors.push('attendance must be "Attending" or "Not Attending"');
    if (!Number.isInteger(guestCount) || guestCount < 1) errors.push('guestCount must be a positive integer');
    if (SHEET_TABS.indexOf(guestGroup) === -1) errors.push('guestGroup must be one of: ' + SHEET_TABS.join(', '));
    if (errors.length) return jsonOut({ ok: false, error: errors.join('; ') }, 400);

    // Short per-phone cooldown against accidental double submits.
    const cache = CacheService.getScriptCache();
    const cacheKey = 'rsvp_' + phone;
    if (cache.get(cacheKey)) return jsonOut({ ok: true, note: 'duplicate request ignored' });
    cache.put(cacheKey, '1', DUPLICATE_COOLDOWN_SECONDS);

    // Serialize the actual sheet write - two simultaneous submissions could
    // otherwise both read "no existing row" and both append, or corrupt
    // each other's row insert.
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = getOrCreateSheet(ss, guestGroup);
      upsertRow(sheet, { name: name, phone: phone, attendance: attendance, guestCount: guestCount, guestGroup: guestGroup, message: message });
      refreshDashboard(ss);
    } finally {
      lock.releaseLock();
    }

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: 'Server error: ' + err.message }, 500);
  }
}

// Lets you open the deployed URL directly in a browser to confirm it's live.
function doGet(e) {
  return jsonOut({ ok: true, message: 'Wedding RSVP endpoint is live. POST JSON to submit an RSVP.' });
}

function getOrCreateSheet(ss, tabName) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

// If this phone number already has a row in this tab, overwrite it in place
// (treats a resubmission as "I changed my mind about my RSVP") instead of
// creating a second row for the same guest. Otherwise append a new row.
function upsertRow(sheet, r) {
  var row = [new Date(), r.name, r.phone, r.attendance, r.guestCount, r.guestGroup, r.message];
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var phones = sheet.getRange(2, 3, lastRow - 1, 1).getValues(); // column C = Phone Number
    for (var i = 0; i < phones.length; i++) {
      if (String(phones[i][0]).trim() === r.phone) {
        sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }
  sheet.appendRow(row);
}

function sanitize(v) {
  return String(v == null ? '' : v).trim().slice(0, 500);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the Apps Script editor (pick "setup" in the function
 * dropdown, click Run) before your first real submission. Pre-creates every
 * guest-group tab and the Dashboard so they all exist and are correctly
 * formatted from day one, even before any RSVP has come in.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_TABS.forEach(function (name) { getOrCreateSheet(ss, name); });
  refreshDashboard(ss);
}

// Rebuilds the Dashboard tab's formulas. Safe to re-run any time (e.g. from
// setup(), or manually if you ever want to force a refresh) - it clears and
// rewrites the tab, it doesn't accumulate anything. The per-group rows are
// generated from SHEET_TABS so they can never point at a tab that doesn't exist.
function refreshDashboard(ss) {
  var dash = ss.getSheetByName(DASHBOARD_NAME);
  if (!dash) dash = ss.insertSheet(DASHBOARD_NAME);
  dash.clear();

  var attendingSum = SHEET_TABS.map(function (t) { return 'COUNTIF(' + q(t) + '!D2:D,"Attending")'; }).join('+');
  var notAttendingSum = SHEET_TABS.map(function (t) { return 'COUNTIF(' + q(t) + '!D2:D,"Not Attending")'; }).join('+');
  var totalResponsesSum = SHEET_TABS.map(function (t) { return 'COUNTA(' + q(t) + '!B2:B)'; }).join('+');
  var guestsExpectedSum = SHEET_TABS.map(function (t) { return 'SUMIFS(' + q(t) + '!E2:E,' + q(t) + '!D2:D,"Attending")'; }).join('+');
  var perGroupRows = SHEET_TABS.map(function (t) { return ['Total ' + t + ' Responses', '=COUNTA(' + q(t) + '!B2:B)']; });

  var rows = [
    ['Wedding RSVP Dashboard (Groom)', ''],
    ['', ''],
    ['Total Responses', '=' + totalResponsesSum],
    ['Total Attending', '=' + attendingSum],
    ['Total Not Attending', '=' + notAttendingSum],
    ['Total Guests Expected', '=' + guestsExpectedSum],
    ['', '']
  ].concat(perGroupRows, [
    ['', ''],
    ['Last refreshed', new Date()]
  ]);

  dash.getRange(1, 1, rows.length, 2).setValues(rows);
  dash.getRange(1, 1, 1, 2).merge().setFontWeight('bold').setFontSize(14);
  dash.getRange(3, 1, rows.length - 2, 1).setFontWeight('bold');
  dash.autoResizeColumns(1, 2);
}

// Wraps a sheet name in single quotes for formula references when it
// contains a space or an apostrophe (e.g. "Groom's Friends and Colleagues");
// plain names like Friends don't need it, but quoting them too would still be
// valid. An apostrophe *inside* a quoted sheet name must be doubled, the same
// escaping Sheets itself uses - without this, "Groom's Friends and Colleagues"
// would produce a broken reference (the apostrophe closes the quote early).
function q(name) {
  return /[\s']/.test(name) ? "'" + name.replace(/'/g, "''") + "'" : name;
}
