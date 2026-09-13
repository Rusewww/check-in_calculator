// @ts-check
/**
 * Check-in window picker: Hours/Days tabs, preset chips and a custom number.
 * @module ui/components/PeriodPicker
 */
import { h } from '../dom.js';
import { t } from '../strings.js';
import { LIMITS, PRESETS, UNITS } from '../../core/period.js';
import { applyCustomInput, applyPeriodUnit, applyPreset } from '../state.js';

/** @type {Record<import('../../core/period.js').PeriodError, (unit: import('../../core/period.js').PeriodUnit) => string>} */
const ERROR_TEXT = {
  empty: () => t('periodErrorEmpty'),
  'not-integer': () => t('periodErrorNotInteger'),
  'out-of-range': (unit) => t('periodErrorRange', { min: LIMITS[unit].min, max: LIMITS[unit].max }),
};

/**
 * @param {HTMLElement} container
 * @param {{ store: import('../store.js').Store<import('../state.js').AppState> }} ctx
 * @returns {() => void} dispose
 */
export function mountPeriodPicker(container, { store }) {
  const tabs = UNITS.map((unit) =>
    h(
      'button',
      {
        type: 'button',
        role: 'tab',
        id: `period-tab-${unit}`,
        class: 'tab',
        'aria-selected': 'false',
        'aria-controls': 'period-panel',
        onclick: () => store.set((state) => applyPeriodUnit(state, unit)),
      },
      t(unit === 'hours' ? 'tabHours' : 'tabDays'),
    ),
  );
  const tablist = h(
    'div',
    { class: 'tabs', role: 'tablist', 'aria-label': t('periodLabel') },
    tabs,
  );
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': t('presetsLabel') });
  const custom = /** @type {HTMLInputElement} */ (
    h('input', {
      id: 'period-custom',
      class: 'input input-number',
      type: 'number',
      inputmode: 'numeric',
      min: '1',
      step: '1',
      placeholder: t('customPlaceholder'),
      'aria-describedby': 'period-error',
    })
  );
  const suffix = h('span', { class: 'field-hint' });
  const error = h('p', { id: 'period-error', class: 'field-error', role: 'alert', hidden: true });
  const panel = h(
    'div',
    { id: 'period-panel', role: 'tabpanel', 'aria-labelledby': 'period-tab-hours' },
    chips,
    h(
      'div',
      { class: 'custom-row' },
      h('label', { class: 'label', for: 'period-custom' }, t('customLabel')),
      h('div', { class: 'input-with-suffix' }, custom, suffix),
    ),
    error,
  );

  container.append(h('p', { class: 'label' }, t('periodLabel')), tablist, panel);

  custom.addEventListener('input', () => {
    store.set((state) => applyCustomInput(state, custom.value));
  });

  /** @param {import('../state.js').AppState} state */
  function render(state) {
    const { unit } = state.period;
    for (const tab of tabs) {
      const selected = tab.id === `period-tab-${unit}`;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    panel.setAttribute('aria-labelledby', `period-tab-${unit}`);

    chips.replaceChildren(
      ...PRESETS[unit].map((value) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip',
            'aria-pressed': String(!state.periodError && state.period.value === value),
            onclick: () => store.set((s) => applyPreset(s, value)),
          },
          t(unit === 'hours' ? 'presetHours' : 'presetDays', { n: value }),
        ),
      ),
    );

    custom.max = String(LIMITS[unit].max);
    if (document.activeElement !== custom && custom.value !== state.customInput[unit]) {
      custom.value = state.customInput[unit];
    }
    suffix.textContent = t(unit === 'hours' ? 'unitHours' : 'unitDays');

    if (state.periodError) {
      error.textContent = ERROR_TEXT[state.periodError](unit);
      error.hidden = false;
      custom.setAttribute('aria-invalid', 'true');
    } else {
      error.hidden = true;
      custom.removeAttribute('aria-invalid');
    }
  }

  tablist.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const current = UNITS.indexOf(store.get().period.unit);
    const next =
      UNITS[(current + (event.key === 'ArrowRight' ? 1 : -1) + UNITS.length) % UNITS.length];
    store.set((state) => applyPeriodUnit(state, next));
    tabs[UNITS.indexOf(next)].focus();
  });

  const unsubscribe = store.subscribe(render);
  render(store.get());
  return unsubscribe;
}
