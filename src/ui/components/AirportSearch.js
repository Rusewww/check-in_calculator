// @ts-check
/**
 * Accessible combobox for picking the departure airport by IATA code or name.
 * @module ui/components/AirportSearch
 */
import { h } from '../dom.js';
import { t } from '../strings.js';
import { placeOf } from '../../core/airports.js';
import { offsetAt } from '../../core/timezone.js';
import { formatZoneLabel } from '../format.js';

/**
 * @param {HTMLElement} container
 * @param {{ store: import('../store.js').Store<import('../state.js').AppState> }} ctx
 * @returns {() => void} dispose
 */
export function mountAirportSearch(container, { store }) {
  const listId = 'airport-options';
  const input = /** @type {HTMLInputElement} */ (
    h('input', {
      id: 'airport-input',
      class: 'input',
      type: 'text',
      role: 'combobox',
      autocomplete: 'off',
      autocapitalize: 'characters',
      spellcheck: 'false',
      placeholder: t('airportPlaceholder'),
      'aria-autocomplete': 'list',
      'aria-expanded': 'false',
      'aria-controls': listId,
      'aria-haspopup': 'listbox',
      disabled: true,
    })
  );
  const listbox = h('ul', { id: listId, class: 'listbox', role: 'listbox', hidden: true });
  const hint = h('p', { class: 'field-hint', 'aria-live': 'polite' }, t('airportsLoading'));
  const card = h('div', { class: 'airport-card', hidden: true });

  container.append(
    h('label', { class: 'label', for: 'airport-input' }, t('airportLabel')),
    h('div', { class: 'combobox' }, input, listbox),
    hint,
    card,
  );

  /** @type {import('../../core/airports.js').Airport[]} */
  let results = [];
  let activeIndex = -1;
  /** @typedef {'loading' | 'none' | 'hint' | 'no-results'} HintMode */
  /** @type {HintMode} */
  let hintMode = 'loading';

  /**
   * @param {HintMode} mode
   * @param {string} text
   */
  function setHint(mode, text) {
    hintMode = mode;
    hint.textContent = text;
  }

  function renderOptions() {
    listbox.replaceChildren(
      ...results.map((airport, i) =>
        h(
          'li',
          {
            id: `${listId}-${i}`,
            role: 'option',
            class: `option${i === activeIndex ? ' is-active' : ''}`,
            'aria-selected': i === activeIndex ? 'true' : 'false',
            onmousedown: (/** @type {Event} */ event) => {
              event.preventDefault(); // keep focus in the input
              choose(airport);
            },
          },
          h('span', { class: 'option-code' }, airport.iata),
          h(
            'span',
            { class: 'option-text' },
            h('span', { class: 'option-name' }, airport.name),
            h('span', { class: 'option-place' }, placeOf(airport)),
          ),
        ),
      ),
    );
    const open = results.length > 0;
    listbox.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    if (open && activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', `${listId}-${activeIndex}`);
      listbox.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function closeList() {
    results = [];
    activeIndex = -1;
    renderOptions();
  }

  /** @param {import('../../core/airports.js').Airport} airport */
  function choose(airport) {
    store.set({ airport, pendingIata: null });
    input.value = airport.iata;
    closeList();
    setHint('hint', t('airportHint'));
  }

  function runSearch() {
    const { data, airport } = store.get();
    if (data.status !== 'ready' || !data.index) return;
    const query = input.value.trim();
    if (airport && query.toUpperCase() !== airport.iata) store.set({ airport: null });
    results = query ? data.index.search(query, 8) : [];
    activeIndex = results.length > 0 ? 0 : -1;
    renderOptions();
    if (query && results.length === 0) setHint('no-results', t('airportNoResults', { query }));
    else setHint('hint', t('airportHint'));
  }

  input.addEventListener('input', runSearch);
  input.addEventListener('focus', () => {
    if (!store.get().airport && input.value.trim()) runSearch();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length === 0) {
        runSearch();
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      activeIndex = (activeIndex + delta + results.length) % results.length;
      renderOptions();
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        event.preventDefault();
        choose(results[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      if (results.length > 0) {
        event.preventDefault();
        closeList();
      }
    }
  });
  input.addEventListener('blur', () => {
    const { data, airport } = store.get();
    const code = input.value.trim().toUpperCase();
    if (!airport && data.index && /^[A-Z]{3}$/.test(code)) {
      const exact = data.index.byIata(code);
      if (exact) {
        choose(exact);
        return;
      }
    }
    closeList();
  });

  /** @param {import('../state.js').AppState} state */
  function render(state) {
    const ready = state.data.status === 'ready';
    input.disabled = !ready;
    if (state.data.status === 'loading') setHint('loading', t('airportsLoading'));
    else if (state.data.status === 'error') setHint('none', '');
    else if (hintMode === 'loading' || hintMode === 'none') setHint('hint', t('airportHint'));

    const { airport } = state;
    if (airport) {
      if (document.activeElement !== input && input.value !== airport.iata) {
        input.value = airport.iata;
      }
      const offset = offsetAt(Date.now(), airport.tz);
      card.replaceChildren(
        h('strong', {}, `${airport.iata} · ${airport.name}`),
        h('span', {}, placeOf(airport)),
        h('span', {}, t('airportTimeZone', { zone: formatZoneLabel(airport.tz, offset) })),
      );
      card.hidden = false;
    } else {
      card.hidden = true;
      if (document.activeElement !== input && state.pendingIata === null && !ready) {
        input.value = '';
      }
    }
  }

  const unsubscribe = store.subscribe(render);
  render(store.get());
  return unsubscribe;
}
