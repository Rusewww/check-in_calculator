// @ts-check
/**
 * Application state shape, initialisation and pure state transitions.
 * @module ui/state
 */
import {
  DEFAULT_PERIOD,
  DEFAULT_PRESET_BY_UNIT,
  PRESETS,
  validatePeriodValue,
} from '../core/period.js';

/** @typedef {import('../core/airports.js').Airport} Airport */
/** @typedef {import('../core/airports.js').AirportIndex} AirportIndex */
/** @typedef {import('../core/period.js').Period} Period */
/** @typedef {import('../core/period.js').PeriodUnit} PeriodUnit */
/** @typedef {import('../core/period.js').PeriodError} PeriodError */

/**
 * @typedef {object} AppState
 * @property {{ status: 'loading' | 'ready' | 'error', index: AirportIndex | null, error: string | null }} data
 * @property {Airport | null} airport
 * @property {string | null} pendingIata       code from the URL, resolved once the data is loaded
 * @property {string} departure                "YYYY-MM-DDTHH:mm" or "" when not set
 * @property {Period} period                   the last valid period
 * @property {PeriodError | null} periodError  set while the custom input is invalid
 * @property {Record<PeriodUnit, number>} lastPresetByUnit
 * @property {Record<PeriodUnit, string>} customInput   text in the custom box, per unit
 * @property {boolean} followAirportZone       show times in the airport's zone
 * @property {string} userZone                 explicit zone when not following the airport
 */

/** @typedef {{ follow: boolean, zone: string }} ZonePreference */

export const ZONE_PREF_KEY = 'checkin-calculator.zone';

/**
 * @param {object} input
 * @param {import('../core/urlState.js').SharedState} [input.shared]
 * @param {ZonePreference | null} [input.pref]
 * @param {string} input.deviceZone
 * @returns {AppState}
 */
export function createInitialState({ shared = {}, pref = null, deviceZone }) {
  const period = shared.period ?? { ...DEFAULT_PERIOD };
  const isPresetValue = PRESETS[period.unit].includes(period.value);
  const lastPresetByUnit = { ...DEFAULT_PRESET_BY_UNIT };
  const customInput = { hours: '', days: '' };
  if (isPresetValue) lastPresetByUnit[period.unit] = period.value;
  else customInput[period.unit] = String(period.value);

  return {
    data: { status: 'loading', index: null, error: null },
    airport: null,
    pendingIata: shared.iata ?? null,
    departure: shared.departure ?? '',
    period,
    periodError: null,
    lastPresetByUnit,
    customInput,
    followAirportZone: shared.userZone ? false : pref ? pref.follow : true,
    userZone: shared.userZone ?? pref?.zone ?? deviceZone,
  };
}

/**
 * The zone times are displayed in: the airport's zone while "same as airport" is on
 * (device zone until an airport is chosen), otherwise the user's explicit choice.
 * @param {AppState} state
 * @param {string} deviceZone
 * @returns {string}
 */
export function effectiveUserZone(state, deviceZone) {
  if (state.followAirportZone) return state.airport?.tz ?? deviceZone;
  return state.userZone;
}

/**
 * @param {AppState} state
 * @param {number} value  a preset of the active unit
 * @returns {AppState}
 */
export function applyPreset(state, value) {
  const unit = state.period.unit;
  return {
    ...state,
    period: { unit, value },
    periodError: null,
    lastPresetByUnit: { ...state.lastPresetByUnit, [unit]: value },
    customInput: { ...state.customInput, [unit]: '' },
  };
}

/**
 * @param {AppState} state
 * @param {string} text  raw custom input for the active unit
 * @returns {AppState}
 */
export function applyCustomInput(state, text) {
  const unit = state.period.unit;
  const customInput = { ...state.customInput, [unit]: text };
  if (text.trim() === '') {
    return {
      ...state,
      customInput,
      period: { unit, value: state.lastPresetByUnit[unit] },
      periodError: null,
    };
  }
  const result = validatePeriodValue(unit, text);
  if (result.ok) {
    return { ...state, customInput, period: { unit, value: result.value }, periodError: null };
  }
  return { ...state, customInput, periodError: result.error };
}

/**
 * Switches the Hours/Days tab, restoring that unit's last preset or custom value.
 * @param {AppState} state
 * @param {PeriodUnit} unit
 * @returns {AppState}
 */
export function applyPeriodUnit(state, unit) {
  const base = {
    ...state,
    period: { unit, value: state.lastPresetByUnit[unit] },
    periodError: null,
  };
  const text = state.customInput[unit];
  return text.trim() === '' ? base : applyCustomInput(base, text);
}

/**
 * @returns {ZonePreference | null}
 */
export function loadZonePreference() {
  try {
    const raw = globalThis.localStorage?.getItem(ZONE_PREF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.follow === 'boolean' && typeof parsed?.zone === 'string') {
      return { follow: parsed.follow, zone: parsed.zone };
    }
  } catch {
    // Storage unavailable or corrupted: fall back to defaults.
  }
  return null;
}

/**
 * @param {AppState} state
 */
export function saveZonePreference(state) {
  try {
    const pref = { follow: state.followAirportZone, zone: state.userZone };
    globalThis.localStorage?.setItem(ZONE_PREF_KEY, JSON.stringify(pref));
  } catch {
    // Private mode or quota exceeded: preference simply is not remembered.
  }
}
