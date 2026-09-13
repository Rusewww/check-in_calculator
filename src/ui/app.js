// @ts-check
/**
 * Assembles the application: layout, state, components, data loading, URL sync and
 * user settings (theme, language). Used by the website entry point and, later, by the
 * Chrome extension popup.
 * @module ui/app
 */
import { h } from './dom.js';
import { setLanguage, t } from './strings.js';
import { createStore } from './store.js';
import { createInitialState, loadZonePreference, saveZonePreference } from './state.js';
import { applyTheme, loadSettings, resolveLocale, saveSettings } from './settings.js';
import { getDeviceZone, listZones } from '../core/timezone.js';
import { buildQueryString, parseSharedState } from '../core/urlState.js';
import { createAirportIndex } from '../core/airports.js';
import { loadAirportDataset, loadDatasetMeta } from '../data/airportSource.js';
import { mountAirportSearch } from './components/AirportSearch.js';
import { mountDepartureField } from './components/DepartureField.js';
import { mountPeriodPicker } from './components/PeriodPicker.js';
import { mountTimeZoneSelect } from './components/TimeZoneSelect.js';
import { mountResultPanel } from './components/ResultPanel.js';
import { mountSettingsButton } from './components/SettingsDialog.js';

/**
 * @param {HTMLElement} root
 * @param {object} options
 * @param {string} options.dataUrl   URL of airports.json
 * @param {string} [options.metaUrl] URL of airports.meta.json
 * @param {string} [options.repoUrl]
 * @returns {import('./store.js').Store<import('./state.js').AppState>}
 */
export function mountApp(root, options) {
  const deviceZone = getDeviceZone();
  const zones = listZones();
  const shared = parseSharedState(window.location.search);
  const store = createStore(createInitialState({ shared, pref: loadZonePreference(), deviceZone }));

  let settings = loadSettings();
  applyTheme(settings.theme);
  setLanguage(settings.language);

  /** @type {Date | null} */
  let dataGenerated = null;
  /** @type {() => void} */
  let renderDataUpdated = () => {};
  /** @type {Array<() => void>} */
  let disposers = [];

  /**
   * Builds the UI on top of the store. Called once, and again after a language change
   * because components render their text when they mount.
   * @param {{ settingsOpen?: boolean }} [opts]
   */
  function renderShell({ settingsOpen = false } = {}) {
    for (const dispose of disposers) dispose();
    disposers = [];
    root.replaceChildren();

    document.documentElement.lang = settings.language;
    document.title = t('appTitle');
    const locale = resolveLocale(settings.language);

    const headerActions = h('div', { class: 'app-header-actions' });
    const banner = h('div', { class: 'banner', role: 'alert', hidden: true });
    const airportField = h('div', { class: 'field field-wide' });
    const departureField = h('div', { class: 'field' });
    const zoneField = h('div', { class: 'field' });
    const periodField = h('div', { class: 'field field-wide' });
    const resultHost = h('div');
    const dataUpdated = h('p', { hidden: true });

    root.append(
      h(
        'div',
        { class: 'app' },
        h(
          'header',
          { class: 'app-header' },
          h(
            'div',
            { class: 'app-header-text' },
            h('h1', { class: 'app-title' }, t('appTitle')),
            h('p', { class: 'app-tagline' }, t('appTagline')),
          ),
          headerActions,
        ),
        banner,
        h(
          'form',
          {
            class: 'card form-grid',
            novalidate: true,
            onsubmit: (/** @type {Event} */ event) => event.preventDefault(),
          },
          airportField,
          departureField,
          zoneField,
          periodField,
        ),
        resultHost,
        h(
          'footer',
          { class: 'app-footer' },
          h('p', {}, t('footerPrivacy')),
          h('p', {}, t('footerData')),
          dataUpdated,
          options.repoUrl
            ? h('p', {}, h('a', { href: options.repoUrl, rel: 'noopener' }, t('footerSource')))
            : null,
        ),
      ),
    );

    /** @param {import('./state.js').AppState} state */
    function renderBanner(state) {
      if (state.data.status === 'error') {
        banner.replaceChildren(
          h('span', {}, t('dataError', { error: state.data.error ?? '' })),
          h('button', { type: 'button', class: 'btn', onclick: () => loadData() }, t('retry')),
        );
        banner.hidden = false;
      } else {
        banner.hidden = true;
      }
    }

    renderDataUpdated = () => {
      if (!dataGenerated) return;
      dataUpdated.textContent = t('footerDataUpdated', {
        date: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(dataGenerated),
      });
      dataUpdated.hidden = false;
    };

    disposers.push(
      mountAirportSearch(airportField, { store }),
      mountDepartureField(departureField, { store }),
      mountTimeZoneSelect(zoneField, { store, zones, deviceZone }),
      mountPeriodPicker(periodField, { store }),
      mountResultPanel(resultHost, {
        store,
        deviceZone,
        locale,
        getShareUrl: () => window.location.href,
      }),
      mountSettingsButton(headerActions, {
        settings,
        onChange: updateSettings,
        open: settingsOpen,
      }),
      store.subscribe(renderBanner),
    );
    renderBanner(store.get());
    renderDataUpdated();
  }

  /** @param {import('./settings.js').Settings} next */
  function updateSettings(next) {
    const languageChanged = next.language !== settings.language;
    settings = next;
    saveSettings(settings);
    applyTheme(settings.theme);
    if (languageChanged) {
      setLanguage(settings.language);
      renderShell({ settingsOpen: true });
    }
  }

  /** @param {import('./state.js').AppState} state */
  function syncUrl(state) {
    const query = buildQueryString({
      iata: state.airport?.iata ?? state.pendingIata ?? undefined,
      departure: state.departure || undefined,
      period: state.periodError ? undefined : state.period,
      userZone: state.followAirportZone ? undefined : state.userZone,
    });
    const { pathname, search, hash } = window.location;
    if (query !== search) window.history.replaceState(null, '', pathname + query + hash);
  }

  async function loadData() {
    store.set({ data: { status: 'loading', index: null, error: null } });
    try {
      const airports = await loadAirportDataset(options.dataUrl);
      const index = createAirportIndex(airports);
      store.set((state) => ({
        data: { status: 'ready', index, error: null },
        airport: state.airport ?? (state.pendingIata ? index.byIata(state.pendingIata) : null),
        pendingIata: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      store.set({ data: { status: 'error', index: null, error: message } });
    }
  }

  renderShell();

  store.subscribe((state) => {
    syncUrl(state);
    saveZonePreference(state);
  });
  syncUrl(store.get());

  loadData();

  if (options.metaUrl) {
    loadDatasetMeta(options.metaUrl).then((meta) => {
      const generated =
        meta && typeof meta.generated === 'string' ? new Date(meta.generated) : null;
      if (generated && !Number.isNaN(generated.getTime())) {
        dataGenerated = generated;
        renderDataUpdated();
      }
    });
  }

  return store;
}
