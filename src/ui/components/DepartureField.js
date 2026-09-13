// @ts-check
/**
 * Scheduled departure: a `datetime-local` input interpreted in the airport's zone.
 * @module ui/components/DepartureField
 */
import { h } from '../dom.js';
import { t } from '../strings.js';
import { formatDepartureString, parseDepartureString } from '../../core/urlState.js';

/**
 * @param {HTMLElement} container
 * @param {{ store: import('../store.js').Store<import('../state.js').AppState> }} ctx
 * @returns {() => void} dispose
 */
export function mountDepartureField(container, { store }) {
  const input = /** @type {HTMLInputElement} */ (
    h('input', {
      id: 'departure-input',
      class: 'input',
      type: 'datetime-local',
      step: '60',
      required: true,
    })
  );
  const error = h('p', { class: 'field-error', role: 'alert', hidden: true });

  container.append(
    h('label', { class: 'label', for: 'departure-input' }, t('departureLabel')),
    input,
    h('p', { class: 'field-hint' }, t('departureHint')),
    error,
  );

  function onChange() {
    const raw = input.value;
    if (!raw) {
      store.set({ departure: '' });
      error.hidden = true;
      return;
    }
    // Some browsers include seconds; the shared format is minute precision.
    const wall = parseDepartureString(raw.slice(0, 16));
    if (wall) {
      store.set({ departure: formatDepartureString(wall) });
      error.hidden = true;
    } else {
      store.set({ departure: '' });
      error.textContent = t('departureInvalid');
      error.hidden = false;
    }
  }

  input.addEventListener('input', onChange);
  input.addEventListener('change', onChange);

  const unsubscribe = store.subscribe((state) => {
    if (document.activeElement !== input && input.value !== state.departure) {
      input.value = state.departure;
    }
  });
  input.value = store.get().departure;
  return unsubscribe;
}
