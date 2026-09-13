import { describe, expect, it } from 'vitest';
import {
  applyCustomInput,
  applyPeriodUnit,
  applyPreset,
  createInitialState,
  effectiveUserZone,
} from '../../src/ui/state.js';

const deviceZone = 'Europe/Kyiv';

describe('createInitialState', () => {
  it('uses defaults when nothing is shared or stored', () => {
    const state = createInitialState({ deviceZone });
    expect(state.period).toEqual({ unit: 'hours', value: 24 });
    expect(state.lastPresetByUnit).toEqual({ hours: 24, days: 3 });
    expect(state.customInput).toEqual({ hours: '', days: '' });
    expect(state.followAirportZone).toBe(true);
    expect(state.userZone).toBe(deviceZone);
    expect(state.pendingIata).toBeNull();
  });
  it('takes shared state from the URL, treating a custom value as custom input', () => {
    const state = createInitialState({
      shared: {
        iata: 'LHR',
        departure: '2026-10-05T14:30',
        period: { unit: 'days', value: 20 },
        userZone: 'Asia/Tokyo',
      },
      pref: { follow: true, zone: 'Europe/Paris' },
      deviceZone,
    });
    expect(state.pendingIata).toBe('LHR');
    expect(state.departure).toBe('2026-10-05T14:30');
    expect(state.period).toEqual({ unit: 'days', value: 20 });
    expect(state.customInput).toEqual({ hours: '', days: '20' });
    expect(state.lastPresetByUnit).toEqual({ hours: 24, days: 3 });
    expect(state.followAirportZone).toBe(false);
    expect(state.userZone).toBe('Asia/Tokyo');
  });
  it('falls back to the stored zone preference', () => {
    const state = createInitialState({ pref: { follow: false, zone: 'Europe/Paris' }, deviceZone });
    expect(state.followAirportZone).toBe(false);
    expect(state.userZone).toBe('Europe/Paris');
  });
});

describe('effectiveUserZone', () => {
  it('follows the airport, then the device, unless set explicitly', () => {
    const base = createInitialState({ deviceZone });
    expect(effectiveUserZone(base, deviceZone)).toBe(deviceZone);
    /** @type {import('../../src/core/airports.js').Airport} */
    const airport = {
      iata: 'LHR',
      icao: 'EGLL',
      name: 'London Heathrow Airport',
      city: 'London',
      region: 'England',
      country: 'United Kingdom',
      countryCode: 'GB',
      tz: 'Europe/London',
      lat: 51.471,
      lon: -0.46,
      type: 'L',
      scheduled: true,
    };
    expect(effectiveUserZone({ ...base, airport }, deviceZone)).toBe('Europe/London');
    expect(
      effectiveUserZone(
        { ...base, airport, followAirportZone: false, userZone: 'Asia/Tokyo' },
        deviceZone,
      ),
    ).toBe('Asia/Tokyo');
  });
});

describe('period transitions', () => {
  const start = createInitialState({ deviceZone });

  it('selects presets and clears custom input', () => {
    const typed = applyCustomInput(start, '17');
    const state = applyPreset(typed, 48);
    expect(state.period).toEqual({ unit: 'hours', value: 48 });
    expect(state.customInput.hours).toBe('');
    expect(state.lastPresetByUnit.hours).toBe(48);
    expect(state.periodError).toBeNull();
  });

  it('accepts valid custom input without touching the last preset', () => {
    const state = applyCustomInput(start, '17');
    expect(state.period).toEqual({ unit: 'hours', value: 17 });
    expect(state.lastPresetByUnit.hours).toBe(24);
    expect(state.periodError).toBeNull();
  });

  it('flags invalid custom input and keeps the last valid period', () => {
    const state = applyCustomInput(start, '0');
    expect(state.periodError).toBe('out-of-range');
    expect(state.period).toEqual({ unit: 'hours', value: 24 });
    expect(state.customInput.hours).toBe('0');
  });

  it('reverts to the last preset when the custom box is cleared', () => {
    const state = applyCustomInput(applyCustomInput(start, '17'), '');
    expect(state.period).toEqual({ unit: 'hours', value: 24 });
    expect(state.periodError).toBeNull();
  });

  it('switches units, remembering each unit’s custom value', () => {
    const hours17 = applyCustomInput(start, '17');
    const days = applyPeriodUnit(hours17, 'days');
    expect(days.period).toEqual({ unit: 'days', value: 3 });
    const days9 = applyCustomInput(days, '9');
    const backToHours = applyPeriodUnit(days9, 'hours');
    expect(backToHours.period).toEqual({ unit: 'hours', value: 17 });
    const backToDays = applyPeriodUnit(backToHours, 'days');
    expect(backToDays.period).toEqual({ unit: 'days', value: 9 });
  });

  it('re-validates a remembered custom value on switch', () => {
    const badDays = applyCustomInput(applyPeriodUnit(start, 'days'), '999');
    expect(badDays.periodError).toBe('out-of-range');
    const hours = applyPeriodUnit(badDays, 'hours');
    expect(hours.periodError).toBeNull();
    expect(applyPeriodUnit(hours, 'days').periodError).toBe('out-of-range');
  });
});
