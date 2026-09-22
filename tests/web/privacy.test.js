import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SETTINGS_KEY } from '../../src/ui/settings.js';
import { ZONE_PREF_KEY } from '../../src/ui/state.js';

// Keeps the published privacy policy honest: whatever the site stores or loads from a
// third party must be named in privacy.html. If one of these fails, update the policy
// (and its "Last updated" date) together with the code change.
/** @param {string} path */
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const policy = read('privacy.html');
const indexHtml = read('index.html');
const calendarSource = read('src/core/calendar.js');

/** @param {string} text */
const externalHosts = (text) =>
  [
    ...new Set([...text.matchAll(/https:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1].toLowerCase())),
  ].filter((host) => host !== 'www.w3.org');

describe('privacy policy page', () => {
  it('has a machine-readable "Last updated" date', () => {
    const match = /Last updated: <time datetime="(\d{4}-\d{2}-\d{2})">/.exec(policy);
    expect(match).not.toBeNull();
    expect(Number.isNaN(Date.parse(/** @type {RegExpExecArray} */ (match)[1]))).toBe(false);
  });

  it('names every storage key the website uses', () => {
    expect(policy).toContain(SETTINGS_KEY);
    expect(policy).toContain(ZONE_PREF_KEY);
  });

  it("describes the extension's storage and permission", () => {
    expect(policy).toContain('chrome.storage.local');
    expect(policy).toContain('checkin-calculator.lastInput');
    expect(policy).toContain('<code>storage</code>');
    expect(policy).toMatch(/no host permissions/i);
  });

  it('discloses every third-party host the calculator page loads from', () => {
    const hosts = externalHosts(indexHtml);
    expect(hosts.length).toBeGreaterThan(0);
    for (const host of hosts) expect(policy, host).toContain(host);
  });

  it('discloses the Google Calendar hand-off', () => {
    for (const host of externalHosts(calendarSource)) expect(policy, host).toContain(host);
  });

  it('publishes no e-mail address', () => {
    expect(policy).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  });
});
